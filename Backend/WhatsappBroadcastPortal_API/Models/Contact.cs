using System.ComponentModel.DataAnnotations;

namespace WhatsappBroadcastPortal_API.Models
{
    public class Contact
    {
        [Key]
        public int Id { get; set; }

        public int UserId { get; set; }

        public string Name { get; set; }

        public string Phone { get; set; }

        public string Address { get; set; }
    }
}
