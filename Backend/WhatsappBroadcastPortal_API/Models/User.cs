using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Identity;

namespace WhatsappBroadcastPortal_API.Models
{
    public class User : IdentityUser<int>
    {
        //[Key]
        //public int Id { get; set; }

        [Required]
        public string Name { get; set; }

        //[Required]
        //public string UserName { get; set; }

        //[Required]
        //public string Password { get; set; }

        [Required]
        //[ForeignKey("UserRole")]
        public int UserRoleId { get; set; }
        //public UserRole UserRole { get; set; }

        [Required]
        public bool Active { get; set; }

        [Required]
        public DateTime LastLoggedInDate { get; set; }
    }
}
