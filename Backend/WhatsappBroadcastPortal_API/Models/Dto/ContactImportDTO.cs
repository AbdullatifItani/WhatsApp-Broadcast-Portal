namespace WhatsappBroadcastPortal_API.Models.Dto
{
    public class ContactImport
    {
        public string id { get; set; }

        public string name { get; set; }

        public string type { get; set; }
    }

    public class ContactResponse
    {
        public bool success { get; set; }

        public List<ContactImport> data { get; set; }
    }

}