using Microsoft.AspNetCore.Mvc;
using WhatsappBroadcastPortal_API.Models;
using WhatsappBroadcastPortal_API.Models.Dto;
using WhatsappBroadcastPortal_API.Data;
using System.Net;
using System.Text.Json;

namespace WhatsappBroadcastPortal_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ContactsController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        private ApiResponse _response;

        public ContactsController(ApplicationDbContext db)
        {
            _db = db;
            _response = new ApiResponse();
        }

        [HttpGet("AllContacts")]
        public async Task<ActionResult<ApiResponse>> GetAllContacts(int userId)
        {
            var contacts = _db.Contacts
            .Where(u => u.UserId == userId)
            .OrderBy(u => u.Name)
            .ToList();
            _response.Result = contacts;
            _response.StatusCode = HttpStatusCode.OK;
            return Ok(_response);
        }

        [HttpGet]
        public async Task<ActionResult<ApiResponse>> GetContacts(int userId,
        string searchString, string address, int pageNumber = 1, int pageSize = 5, string sortBy = "name", string sortOrder = "asc")
        {
            IEnumerable<Contact> contacts = _db.Contacts
            .Where(u => u.UserId == userId)
            .ToList();

            if (!string.IsNullOrEmpty(searchString))
            {
                contacts = contacts
                    .Where(u => u.Name.ToLower().Contains(searchString.ToLower()) ||
                u.Phone.ToLower().Contains(searchString.ToLower())
                || u.Address.ToLower().Contains(searchString.ToLower()));
            }

            if (!string.IsNullOrEmpty(address))
            {
                contacts = contacts.Where(u => u.Address.ToLower() == address.ToLower());
            }

            if (sortBy == "name")
            {
                contacts = sortOrder == "asc" ? contacts.OrderBy(u => u.Name) : contacts.OrderByDescending(u => u.Name);
            }

            Pagination pagination = new()
            {
                CurrentPage = pageNumber,
                PageSize = pageSize,
                TotalRecords = contacts.Count(),
            };

            Response.Headers.Add("X-Pagination", JsonSerializer.Serialize(pagination));

            _response.Result = contacts.Skip((pageNumber - 1) * pageSize).Take(pageSize);
            _response.StatusCode = HttpStatusCode.OK;
            return Ok(_response);
        }

        [HttpGet("{id}", Name = "GetContact")]
        public async Task<ActionResult<ApiResponse>> GetContact(int id)
        {
            if (id == 0)
            {
                _response.StatusCode = HttpStatusCode.BadRequest;
                _response.IsSuccess = false;
                return BadRequest(_response);
            }

            Contact contact = _db.Contacts.FirstOrDefault(u => u.Id == id);
            if (contact == null)
            {
                _response.StatusCode = HttpStatusCode.NotFound;
                _response.IsSuccess = false;
                return NotFound(_response);
            }

            _response.Result = contact;
            _response.StatusCode = HttpStatusCode.OK;
            return Ok(_response);
        }

        [HttpPost]
        public async Task<ActionResult<ApiResponse>> AddContact([FromBody] ContactCreateDTO contactCreateDTO)
        {
            try
            {
                if (ModelState.IsValid)
                {
                    bool contactExists = _db.Contacts.Any(c => c.UserId == contactCreateDTO.UserId && c.Phone == contactCreateDTO.Phone);
                    if (contactExists)
                    {
                        _response.IsSuccess = false;
                        _response.ErrorMessages = new List<string>() { "A contact with this phone number already exists." };
                        _response.StatusCode = HttpStatusCode.BadRequest;
                        return BadRequest(_response);
                    }

                    Contact contactToCreate = new()
                    {
                        UserId = contactCreateDTO.UserId,
                        Name = contactCreateDTO.Name,
                        Phone = contactCreateDTO.Phone,
                        Address = contactCreateDTO.Address,
                    };

                    _db.Contacts.Add(contactToCreate);
                    _db.SaveChanges();
                    _response.Result = contactToCreate;
                    _response.StatusCode = HttpStatusCode.Created;
                    return CreatedAtRoute("GetContact", new { id = contactToCreate.Id }, _response);
                }
                else
                {
                    _response.IsSuccess = false;
                }
            }
            catch (Exception ex)
            {
                _response.IsSuccess = false;
                _response.ErrorMessages = new List<string>() { ex.ToString() };
            }
            return _response;
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<ApiResponse>> UpdateContact(int id, [FromBody] ContactUpdateDTO contactUpdateDTO)
        {
            try
            {
                if (ModelState.IsValid)
                {
                    if (contactUpdateDTO == null || id != contactUpdateDTO.Id)
                    {
                        _response.StatusCode = HttpStatusCode.BadRequest;
                        _response.IsSuccess = false;
                        return BadRequest();
                    }
                    Contact contactFromDb = await _db.Contacts.FindAsync(id);
                    if (contactFromDb == null)
                    {
                        _response.StatusCode = HttpStatusCode.BadRequest;
                        _response.IsSuccess = false;
                        return BadRequest();
                    }

                    bool contactExists = _db.Contacts.Any(c => c.UserId == contactFromDb.UserId && c.Phone == contactUpdateDTO.Phone && c.Id != id);
                    if (contactExists)
                    {
                        _response.IsSuccess = false;
                        _response.ErrorMessages = new List<string>() { "A contact with this phone number already exists." };
                        _response.StatusCode = HttpStatusCode.BadRequest;
                        return BadRequest(_response);
                    }

                    contactFromDb.Name = contactUpdateDTO.Name;
                    contactFromDb.Phone = contactUpdateDTO.Phone;
                    contactFromDb.Address = contactUpdateDTO.Address;

                    _db.Contacts.Update(contactFromDb);
                    _db.SaveChanges();
                    _response.StatusCode = HttpStatusCode.NoContent;
                    return Ok(_response);
                }
                else
                {
                    _response.IsSuccess = false;
                }
            }
            catch (Exception ex)
            {
                _response.IsSuccess = false;
                _response.ErrorMessages = new List<string>() { ex.ToString() };
            }
            return _response;
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult<ApiResponse>> DeleteContact(int id)
        {
            try
            {
                if (id == 0)
                {
                    _response.StatusCode = HttpStatusCode.BadRequest;
                    _response.IsSuccess = false;
                    return BadRequest();
                }

                Contact contactFromDb = await _db.Contacts.FindAsync(id);
                if (contactFromDb == null)
                {
                    _response.StatusCode = HttpStatusCode.BadRequest;
                    _response.IsSuccess = false;
                    return BadRequest();
                }

                _db.Contacts.Remove(contactFromDb);
                _db.SaveChanges();
                _response.StatusCode = HttpStatusCode.NoContent;
                return Ok(_response);
            }
            catch (Exception ex)
            {
                _response.IsSuccess = false;
                _response.ErrorMessages
                     = new List<string>() { ex.ToString() };
            }
            return _response;
        }

        [HttpPost("import")]
        public async Task<ActionResult<ApiResponse>> ImportContacts([FromBody] ContactBulkCreateDTO contactBulkCreateDTO)
        {
            try
            {
                if (ModelState.IsValid)
                {
                    foreach (var contactDto in contactBulkCreateDTO.Contacts)
                    {
                        Contact contactToCreate = new()
                        {
                            UserId = contactBulkCreateDTO.UserId,
                            Name = contactDto.Name,
                            Phone = contactDto.Phone,
                            Address = contactDto.Address,
                        };

                        _db.Contacts.Add(contactToCreate);
                    }
                    await _db.SaveChangesAsync();

                    _response.Result = contactBulkCreateDTO.Contacts;
                    _response.StatusCode = HttpStatusCode.Created;
                    return Ok(_response);
                }
                else
                {
                    _response.IsSuccess = false;
                }
            }
            catch (Exception ex)
            {
                _response.IsSuccess = false;
                _response.ErrorMessages = new List<string>() { ex.ToString() };
            }
            return _response;
        }

    }
}
