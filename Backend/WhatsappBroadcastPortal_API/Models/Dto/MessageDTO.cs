using System.ComponentModel.DataAnnotations;

namespace WhatsappBroadcastPortal_API.Models.Dto
{
    public class MessageDTO
    {
        [Required]
        public string Type { get; set; }

        [Required]
        public int Id { get; set; }

        [Required]
        public string MessageContent { get; set; }

        public string Text { get; set; }

        public string FileName { get; set; }
        
        [Required]
        public Contact[] ContactList { get; set; }
    }
}
