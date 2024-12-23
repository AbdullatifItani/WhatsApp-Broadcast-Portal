using Microsoft.AspNetCore.Mvc;
using WhatsappBroadcastPortal_API.Models;
using WhatsappBroadcastPortal_API.Models.Dto;
using WhatsappBroadcastPortal_API.Data;
using System.Net;
using Microsoft.EntityFrameworkCore;

namespace WhatsappBroadcastPortal_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SettingsController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        private ApiResponse _response;

        public SettingsController(ApplicationDbContext db)
        {
            _db = db;
            _response = new ApiResponse();
        }

        [HttpGet("{id}", Name = "GetSettings")]
        public async Task<IActionResult> GetSettings(int id)
        {
            if (id == 0)
            {
                _response.StatusCode = HttpStatusCode.BadRequest;
                _response.IsSuccess = false;
                return BadRequest(_response);
            }

            var settings = await _db.Settings.Where(u => u.Id == id).ToListAsync();

            if (settings == null)
            {
                _response.StatusCode = HttpStatusCode.NotFound;
                _response.IsSuccess = false;
                return NotFound(_response);
            }

            _response.Result = settings;
            _response.StatusCode = HttpStatusCode.OK;
            return Ok(_response);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<ApiResponse>> UpdateSettings(int id, [FromBody] SettingsUpdateDTO settingsUpdateDTO)
        {
            try
            {
                if (ModelState.IsValid)
                {
                    if (settingsUpdateDTO == null || id != settingsUpdateDTO.Id)
                    {
                        _response.StatusCode = HttpStatusCode.BadRequest;
                        _response.IsSuccess = false;
                        return BadRequest(_response);
                    }

                    Settings settingsFromDb = await _db.Settings.FindAsync(id);

                    if (settingsFromDb == null)
                    {
                        // If no settings found, create a new entry
                        settingsFromDb = new Settings
                        {
                            Id = id,
                            SenderName = settingsUpdateDTO.SenderName,
                            SenderEmail = settingsUpdateDTO.SenderEmail,
                            SenderAddress = settingsUpdateDTO.SenderAddress,
                            ProductId = settingsUpdateDTO.ProductId,
                            Token = settingsUpdateDTO.Token,
                            PhoneId = settingsUpdateDTO.PhoneId,
                            PhoneNumber = settingsUpdateDTO.PhoneNumber,
                        };

                        _db.Settings.Add(settingsFromDb);
                        await _db.SaveChangesAsync();

                        _response.StatusCode = HttpStatusCode.Created;
                        _response.IsSuccess = true;
                        return CreatedAtAction(nameof(UpdateSettings), new { id = settingsFromDb.Id }, _response);
                    }
                    else
                    {
                        // Update existing settings
                        settingsFromDb.SenderName = settingsUpdateDTO.SenderName;
                        settingsFromDb.SenderEmail = settingsUpdateDTO.SenderEmail;
                        settingsFromDb.SenderAddress = settingsUpdateDTO.SenderAddress;
                        settingsFromDb.ProductId = settingsUpdateDTO.ProductId;
                        settingsFromDb.Token = settingsUpdateDTO.Token;
                        settingsFromDb.PhoneId = settingsUpdateDTO.PhoneId;
                        settingsFromDb.PhoneNumber = settingsUpdateDTO.PhoneNumber;

                        _db.Settings.Update(settingsFromDb);
                        await _db.SaveChangesAsync();

                        _response.StatusCode = HttpStatusCode.NoContent;
                        _response.IsSuccess = true;
                        return Ok(_response);
                    }
                }
                else
                {
                    _response.StatusCode = HttpStatusCode.BadRequest;
                    _response.IsSuccess = false;
                    return BadRequest(_response);
                }
            }
            catch (Exception ex)
            {
                _response.IsSuccess = false;
                _response.ErrorMessages = new List<string>() { ex.ToString() };
                return StatusCode((int)HttpStatusCode.InternalServerError, _response);
            }
        }
    }
}