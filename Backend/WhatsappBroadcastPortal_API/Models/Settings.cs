using System.ComponentModel.DataAnnotations;

namespace WhatsappBroadcastPortal_API.Models
{
    public class Settings
    {
        [Key]
        public int Id { get; set; }

        public string SenderName { get; set; }

        public string SenderEmail { get; set; }

        public string SenderAddress { get; set; }

        public string ProductId { get; set; }

        public string Token { get; set; }

        public string PhoneId { get; set; }

        public string PhoneNumber { get; set; }
    }
}
