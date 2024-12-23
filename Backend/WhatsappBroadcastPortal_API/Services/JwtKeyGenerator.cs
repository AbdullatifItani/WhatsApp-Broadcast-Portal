using System.Security.Cryptography;


namespace WhatsappBroadcastPortal_API.Services
{
    public class JwtGenerator
    {
        public static string GenerateRandomKey(int length)
        {
            byte[] data = new byte[length];
            using (RandomNumberGenerator rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(data);
            }
            return Convert.ToBase64String(data);
        }

        /*public static void Main(string[] args)
        {
            int keyLength = 64; // You can adjust the length of the key as needed
            string key = GenerateRandomKey(keyLength);
            Console.WriteLine("Generated Key: " + key);
        }*/
    }
}
