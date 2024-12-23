using System.ComponentModel.DataAnnotations;

namespace WhatsappBroadcastPortal_API.Models.Dto
{
    public class ContactBulkCreateDTO
    {
        public int UserId { get; set; }
        
        [Required]
        public List<ContactCreateDTO> Contacts { get; set; }
    }
}
