using Microsoft.AspNetCore.Mvc;
using WhatsappBroadcastPortal_API.Models.Dto;
using WhatsappBroadcastPortal_API.Models;
using System.Net;
using WhatsappBroadcastPortal_API.Data;
using System.Text;
using System.Text.Json;

using System;
using Twilio;
using Twilio.Rest.Api.V2010.Account;
using System.Threading.Tasks;
//using Newtonsoft.Json;

namespace WhatsappBroadcastPortal_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MessageBroadcastController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        private readonly IConfiguration _configuration;
        private ApiResponse _response;

        public MessageBroadcastController(ApplicationDbContext db, IConfiguration configuration)
        {
            _db = db;
            _configuration = configuration;
            _response = new ApiResponse();
        }

        [HttpPost("send")]
        public async Task<IActionResult> SendMessage([FromBody] MessageDTO messageDTO)
        {
            var results = new List<string>();

            try
            {
                Settings settings = await _db.Settings.FindAsync(messageDTO.Id);
                // Fast
                //var productID = _configuration["Maytapi:ProductID"];
                //var apiKey = _configuration["Maytapi:Token"];
                //var phoneID = _configuration["Maytapi:PhoneID"];
                var productID = settings.ProductId;
                var apiKey = settings.Token;
                var phoneID = settings.PhoneId;
                var url = $"https://api.maytapi.com/api/{productID}/{phoneID}/sendMessage";

                using (var client = new HttpClient())
                {
                    client.DefaultRequestHeaders.Add("x-maytapi-key", apiKey);

                    var tasks = new List<Task>();

                    foreach (var contact in messageDTO.ContactList) //Check file
                    {
                        object message = null;

                        if (messageDTO.Type == "text")
                        {
                            message = new
                            {
                                to_number = contact.Phone,
                                type = "text",
                                message = messageDTO.MessageContent,
                            };
                        }

                        else if (messageDTO.Type == "media")
                        {
                            message = new
                            {
                                to_number = contact.Phone,
                                type = "media",
                                message = messageDTO.MessageContent,
                                text = messageDTO.Text,
                                filename = messageDTO.FileName,
                            };
                        }

                        //object message = messageDTO.Type == "text" ?
                        //new { to_number = contact.Phone, type = "text", message = messageDTO.MessageContent } :
                        //new { to_number = contact.Phone, type = "media", message = messageDTO.MessageContent, text = messageDTO.Text, filename = messageDTO.FileName };

                        var json = JsonSerializer.Serialize(message);
                        var content = new StringContent(json, Encoding.UTF8, "application/json");

                        tasks.Add(Task.Run(async () =>
                        {
                            //Adds To Queue
                            var response = await client.PostAsync(url, content);
                            var responseContent = await response.Content.ReadAsStringAsync();

                            Console.WriteLine(response.Content.ReadAsStringAsync());
                            if (response.IsSuccessStatusCode)
                            {
                                results.Add($"Message sent successfully to {contact.Phone}!");
                                Console.WriteLine($"Message sent successfully to {contact.Phone}!");
                            }
                            else
                            {
                                results.Add($"Error sending to {contact.Phone}: {response.StatusCode} - {responseContent}");
                                Console.WriteLine($"Error sending to {contact.Phone}: {response.StatusCode} - {responseContent}");
                            }
                        }));
                    }

                    await Task.WhenAll(tasks);
                }

                _response.StatusCode = HttpStatusCode.OK;
                _response.IsSuccess = true;
                //_response.Result = "Broadcast message sent successfully.";
                _response.Result = string.Join("\n", results);

                return StatusCode((int)_response.StatusCode, _response);
            }
            catch (Exception ex)
            {
                _response.IsSuccess = false;
                _response.StatusCode = HttpStatusCode.InternalServerError;
                _response.ErrorMessages.Add(ex.ToString());
                return StatusCode((int)HttpStatusCode.InternalServerError, _response);
            }
        }

        [HttpPost("validate")]
        public async Task<IActionResult> ValidateMessageAsync([FromBody] ValidateDTO validateDTO)
        {
            try
            {
                var productID = validateDTO.ProductId;
                var apiKey = validateDTO.Token;
                var phoneID = validateDTO.PhoneId;

                var url = $"https://api.maytapi.com/api/{productID}/listPhones";

                using (var client = new HttpClient())
                {
                    client.DefaultRequestHeaders.Add("x-maytapi-key", apiKey);

                    var response = await client.GetAsync(url);
                    var responseContent = await response.Content.ReadAsStringAsync();

                    Console.WriteLine(response);
                    Console.WriteLine(responseContent);

                    List<PhoneDTO> phones = new List<PhoneDTO>();
                    string errorMessage = null;

                    if (responseContent.Trim().StartsWith("["))
                    {
                        phones = JsonSerializer.Deserialize<List<PhoneDTO>>(responseContent);
                    }
                    else
                    {
                        var errorResponse = JsonSerializer.Deserialize<ErrorResponse>(responseContent);
                        if (errorResponse != null && !errorResponse.Success)
                        {
                            errorMessage = errorResponse.Message;
                        }
                    }

                    if (response.IsSuccessStatusCode)
                    {
                        if (errorMessage == null)
                        {
                            if (phones != null && phones.Count > 0)
                            {
                                int searchId = int.Parse(phoneID);
                                string searchNumber = validateDTO.PhoneNumber;

                                var phone = phones.FirstOrDefault(phone => phone.Id == searchId && phone.Number == searchNumber);

                                if (phone != null)
                                {
                                    Console.WriteLine($"Found phone with ID {phone.Id} and Number {phone.Number}.");
                                    _response.IsSuccess = true;
                                    _response.StatusCode = HttpStatusCode.OK;
                                    _response.Result = "Your settings and phone number are validated.";
                                }
                                else
                                {
                                    Console.WriteLine("Phone not found.");
                                    _response.IsSuccess = false;
                                    _response.StatusCode = HttpStatusCode.BadRequest;
                                    //_response.Result = "Failed to validate your settings and phone number.";
                                    _response.Result = "Phone ID or Phone Number is wrong! Please check your Account Information and Settings.";
                                }
                            }
                        }
                        else
                        {
                            _response.IsSuccess = false;
                            _response.StatusCode = HttpStatusCode.BadRequest;
                            _response.Result = errorMessage;
                        }
                    }
                    else
                    {
                        _response.IsSuccess = false;
                        _response.StatusCode = HttpStatusCode.InternalServerError;
                        _response.ErrorMessages.Add("Failed to retrieve phone list from API.");
                    }
                }

                return StatusCode((int)_response.StatusCode, _response);
            }
            catch (Exception ex)
            {
                _response.IsSuccess = false;
                _response.StatusCode = HttpStatusCode.InternalServerError;
                _response.ErrorMessages.Add(ex.ToString());
                return StatusCode((int)HttpStatusCode.InternalServerError, _response);
            }
        }

        [HttpPost("send-twilio")]
        public async Task SendMessageTwilio([FromBody] TemplateMessageDTO templateMessageDTO) //Add DTO
        {
            var accountSid = _configuration["Twilio:AccountSID"];
            var authToken = _configuration["Twilio:AuthToken"];
            var phone = _configuration["Twilio:Phone"];
            var messagingServiceSid = _configuration["Twilio:MessagingServiceSID"];

            TwilioClient.Init(accountSid, authToken);

            foreach (var contact in templateMessageDTO.ContactList)
            {
                var message = await MessageResource.CreateAsync(
                    contentSid: templateMessageDTO.ContentSid,
                    to: new Twilio.Types.PhoneNumber($"whatsapp:+{contact.Phone}"),
                    from: new Twilio.Types.PhoneNumber($"whatsapp:{phone}"),
                    //from: new Twilio.Types.PhoneNumber(messagingServiceSid),
                    messagingServiceSid: messagingServiceSid);

                Console.WriteLine(message.Body);
            };

            return;

        }
    }
}

