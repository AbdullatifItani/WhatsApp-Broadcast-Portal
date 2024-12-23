using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using WhatsappBroadcastPortal_API.Models;
using WhatsappBroadcastPortal_API.Models.Dto;
using WhatsappBroadcastPortal_API.Data;
using System.Net;

namespace WhatsappBroadcastPortal_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        private readonly IConfiguration _configuration;
        private readonly UserManager<User> _userManager;
        private readonly RoleManager<UserRole> _roleManager;
        private ApiResponse _response;

        public AccountController(ApplicationDbContext db, IConfiguration configuration, UserManager<User> userManager, RoleManager<UserRole> roleManager)
        {
            _db = db;
            _configuration = configuration;
            _userManager = userManager;
            _roleManager = roleManager;
            _response = new ApiResponse();
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDTO loginRequest)
        {
            var user = await _userManager.FindByNameAsync(loginRequest.UserName);

            bool isValid = await _userManager.CheckPasswordAsync(user, loginRequest.Password);

            if (user == null)
            {
                _response.Result = new LoginResponseDTO();
                _response.StatusCode = HttpStatusCode.BadRequest;
                _response.IsSuccess = false;
                _response.ErrorMessages.Add("Invalid Username");
                return Unauthorized(_response);
            }

            if (isValid == false)
            {
                _response.Result = new LoginResponseDTO();
                _response.StatusCode = HttpStatusCode.BadRequest;
                _response.IsSuccess = false;
                _response.ErrorMessages.Add("Invalid Password");
                return Unauthorized(_response);
            }

            var token = await GenerateJwtTokenAsync(user);
            var loginResponse = new LoginResponseDTO
            {
                Token = token,
                UserName = user.UserName,
                Role = (await _userManager.GetRolesAsync(user)).FirstOrDefault()
            };

            _response.StatusCode = HttpStatusCode.OK;
            _response.IsSuccess = true;
            _response.Result = loginResponse;
            return Ok(_response);
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequestDTO registerRequest)
        {
            var user = await _userManager.FindByNameAsync(registerRequest.UserName);

            if (user != null)
            {
                _response.StatusCode = HttpStatusCode.BadRequest;
                _response.IsSuccess = false;
                _response.ErrorMessages.Add("Username already exists");
                return BadRequest(_response);
            }

            try
            {
                var existingRole = await _roleManager.FindByNameAsync(registerRequest.Role);
                UserRole role;
                if (existingRole != null)
                {
                    role = existingRole;
                }
                else
                {
                    role = new UserRole { Name = registerRequest.Role };
                    await _roleManager.CreateAsync(role);
                }
                var newUser = new User
                {
                    UserName = registerRequest.UserName,
                    Name = registerRequest.Name,
                    UserRoleId = role.Id,
                    Active = true,
                    LastLoggedInDate = DateTime.Now,
                    SecurityStamp = Guid.NewGuid().ToString() // Set the SecurityStamp
                };

                var result = await _userManager.CreateAsync(newUser, registerRequest.Password);
                if (result.Succeeded)
                {
                    await _userManager.AddToRoleAsync(newUser, role.Name);
                    var userSettings = new Settings
                    {
                    };
                    _db.Settings.Add(userSettings);
                    _db.SaveChanges();
                    _response.StatusCode = HttpStatusCode.OK;
                    _response.IsSuccess = true;
                    return Ok(_response);
                }
            }
            catch (Exception)
            {

            }
            _response.StatusCode = HttpStatusCode.BadRequest;
            _response.IsSuccess = false;
            _response.ErrorMessages.Add("Error while registering");
            return BadRequest(_response);
        }

        private async Task<string> GenerateJwtTokenAsync(User user)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim("name", user.Name),
                new Claim("id", user.Id.ToString()),
                new Claim("userName", user.UserName.ToString()),
                new Claim("role", (await _userManager.GetRolesAsync(user)).FirstOrDefault()),
            };

            var token = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.Now.AddDays(7),
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
