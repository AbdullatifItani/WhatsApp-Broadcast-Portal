using Microsoft.AspNetCore.Mvc;
using WhatsappBroadcastPortal_API.Models.Dto;
using WhatsappBroadcastPortal_API.Models;
using System.Net;
using WhatsappBroadcastPortal_API.Data;
using System.Text;
using System.Text.Json;
using System;
using Twilio;
using Twilio.Rest.Content.V1;
using System.Threading.Tasks;
using static Twilio.Rest.Content.V1.ContentResource;
using Twilio.Rest.Content.V1.Content;
using Microsoft.EntityFrameworkCore.ChangeTracking.Internal;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace WhatsappBroadcastPortal_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TemplatesController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        private readonly IConfiguration _configuration;
        private ApiResponse _response;

        public TemplatesController(ApplicationDbContext db, IConfiguration configuration)
        {
            _db = db;
            _configuration = configuration;
            _response = new ApiResponse();
        }

        [HttpPost("create-template")]
        public async Task CreateTemplateAsync([FromBody] TemplateCreateDTO templateCreateDTO)
        {
            var accountSid = _configuration["Twilio:AccountSID"];
            var authToken = _configuration["Twilio:AuthToken"];

            TwilioClient.Init(accountSid, authToken);

            var types = new Types.Builder();

            if (templateCreateDTO.ContentType == "text")
            {
                var twilioText = new TwilioText.Builder();
                twilioText.WithBody(templateCreateDTO.Message);

                types.WithTwilioText(twilioText.Build());
            }

            else if (templateCreateDTO.ContentType == "media")
            {
                var twilioMedia = new TwilioMedia.Builder();
                twilioMedia.WithBody(templateCreateDTO.Message);
                twilioMedia.WithMedia(new List<string>() { templateCreateDTO.Media });

                types.WithTwilioMedia(twilioMedia.Build());
            }

            // build the create request object
            var contentCreateRequest = new ContentCreateRequest.Builder();
            contentCreateRequest.WithTypes(types.Build());
            contentCreateRequest.WithLanguage("en"); //Change
            contentCreateRequest.WithFriendlyName(templateCreateDTO.Name);

            // create the twilio template
            var contentTemplate = await CreateAsync(contentCreateRequest.Build());

            Console.WriteLine($"Created Twilio Content Template SID: {contentTemplate.Sid}");
            return;
        }

        [HttpGet("fetch-template")] //Fix Response
        public async Task<IActionResult> FetchTemplate(string contentSid)
        {
            var accountSid = _configuration["Twilio:AccountSID"];
            var authToken = _configuration["Twilio:AuthToken"];

            TwilioClient.Init(accountSid, authToken);

            var content = await ContentResource.FetchAsync(contentSid);

            var response = DeepConvert(JToken.FromObject(content));

            Console.WriteLine(content);

            return Ok(response);
        }

        [HttpGet("fetch-all-templates")] //Fix Response
        public async Task<IActionResult> FetchAllTemplates()
        {
            var accountSid = _configuration["Twilio:AccountSID"];
            var authToken = _configuration["Twilio:AuthToken"];

            TwilioClient.Init(accountSid, authToken);

            var content = await ContentResource.ReadAsync();
            var response = content.Select(content =>
            {
                return DeepConvert(JToken.FromObject(content));
            }).ToList();

            Console.WriteLine(content);
            return Ok(response);
        }

        [HttpDelete("delete-template")]
        public async Task DeleteTemplate(string contentSid)
        {
            var accountSid = _configuration["Twilio:AccountSID"];
            var authToken = _configuration["Twilio:AuthToken"];

            TwilioClient.Init(accountSid, authToken);

            await ContentResource.DeleteAsync(contentSid);
        }

        [HttpPost("approve-template")]
        public async Task<IActionResult> ApproveTemplate(string contentSid)
        {
            var accountSid = _configuration["Twilio:AccountSID"];
            var authToken = _configuration["Twilio:AuthToken"];

            try
            {
                TwilioClient.Init(accountSid, authToken);

                // Create approval request using the generated class
                var approvalRequest = new ApprovalCreateResource.ContentApprovalRequest.Builder()
                    .WithName("hi") // Replace with actual name
                    .WithCategory("UTILITY") // Replace with actual category
                    .Build();

                // Send approval request using Twilio SDK method
                var approval = ApprovalCreateResource.Create(contentSid, approvalRequest);

                // Optionally handle the response if needed
                return Ok("Template approval request sent successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpGet("approve-template-status")] //Fix Response
        public async Task<IActionResult> ApproveTemplateStatus(string contentSid)
        {
            var accountSid = _configuration["Twilio:AccountSID"];
            var authToken = _configuration["Twilio:AuthToken"];

            TwilioClient.Init(accountSid, authToken);

            var approvalFetch = await ApprovalFetchResource.FetchAsync(contentSid);

            var response = DeepConvert(JToken.FromObject(approvalFetch));

            Console.WriteLine(approvalFetch);

            return Ok(response);
        }

        [HttpGet("fetch-content-and-approvals")] //Fix Response
        public async Task<IActionResult> FetchContentAndApprovals()
        {
            var accountSid = _configuration["Twilio:AccountSID"];
            var authToken = _configuration["Twilio:AuthToken"];

            TwilioClient.Init(accountSid, authToken);

            var contentAndApprovals = await ContentAndApprovalsResource.ReadAsync(limit: 20);

            var response = contentAndApprovals.Select(content =>
            {
                return DeepConvert(JToken.FromObject(content));
            }).ToList();

            foreach (var record in contentAndApprovals)
            {
                Console.WriteLine(record.Types);
                Console.WriteLine(record.ApprovalRequests);
            }

            return Ok(response);
        }

        private object DeepConvert(JToken token)
        {
            switch (token.Type)
            {
                case JTokenType.Object:
                    return token.Children<JProperty>()
                                .ToDictionary(prop => prop.Name, prop => DeepConvert(prop.Value));
                case JTokenType.Array:
                    return token.Select(DeepConvert).ToList();
                default:
                    return ((JValue)token).Value;
            }
        }

    }
}