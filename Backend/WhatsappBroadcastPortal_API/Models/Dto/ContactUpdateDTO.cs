using System.ComponentModel.DataAnnotations;

namespace WhatsappBroadcastPortal_API.Models.Dto
{
    public class ContactUpdateDTO
    {
        [Key]
        public int Id { get; set; }

        public int UserId { get; set; }

        [Required]
        public string Name { get; set; }

        [Required]
        public string Phone { get; set; }

        [Required]
        public string Address { get; set; }
    }
}
