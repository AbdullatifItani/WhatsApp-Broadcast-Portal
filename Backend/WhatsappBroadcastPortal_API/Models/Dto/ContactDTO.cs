using System.ComponentModel.DataAnnotations;

namespace WhatsappBroadcastPortal_API.Models.Dto
{
    public class ContactDTO
    {
        [Key]
        public int Id { get; set; }

        public int UserId { get; set; }

        public string Name { get; set; }

        public string Phone { get; set; }

        public string Address { get; set; }
    }
}
