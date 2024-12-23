using Microsoft.AspNetCore.Identity;
using WhatsappBroadcastPortal_API.Models;

namespace WhatsappBroadcastPortal_API.Services
{
    public class PasswordHasher
    {
        public string HashPassword(string password)
        {
            var passwordHasher = new PasswordHasher<User>();
            return passwordHasher.HashPassword(null, password);
        }
    }
}