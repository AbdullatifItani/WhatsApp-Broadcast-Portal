using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Identity;

namespace WhatsappBroadcastPortal_API.Models
{
    public class UserRole : IdentityRole<int>
    {
        //[Key]
        //public int Id { get; set; }

        //[Required]
        //public string Name { get; set; }
    }
}
