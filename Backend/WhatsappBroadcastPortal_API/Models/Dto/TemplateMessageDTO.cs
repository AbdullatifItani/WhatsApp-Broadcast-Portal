using System.ComponentModel.DataAnnotations;

namespace WhatsappBroadcastPortal_API.Models.Dto
{
    public class TemplateMessageDTO
    {
        [Required]
        public string ContentSid { get; set; }
        
        [Required]
        public Contact[] ContactList { get; set; }
    }
}
