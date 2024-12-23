using System.Text.Json.Serialization;
using System.Collections.Generic;

namespace WhatsappBroadcastPortal_API.Models.Dto
{
    public class PhoneDTO
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("number")]
        public string Number { get; set; }

        [JsonPropertyName("status")]
        public string Status { get; set; }

        [JsonPropertyName("type")]
        public string Type { get; set; }

        [JsonPropertyName("name")]
        public string Name { get; set; }

        [JsonPropertyName("data")]
        public Dictionary<string, object> Data { get; set; }
        //public object Data { get; set; }

        [JsonPropertyName("multi_device")]
        public bool MultiDevice { get; set; }
    }

    public class ErrorResponse
    {
        [JsonPropertyName("success")]
        public bool Success { get; set; }
        
        [JsonPropertyName("message")]
        public string Message { get; set; }
    }
}
