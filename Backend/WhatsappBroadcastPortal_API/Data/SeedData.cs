using Microsoft.AspNetCore.Identity;
using WhatsappBroadcastPortal_API.Models;
using WhatsappBroadcastPortal_API.Data;

namespace WhatsappBroadcastPortal_API.Data
{
    public static class SeedData
    {
        public static async Task Initialize(IServiceProvider serviceProvider, ApplicationDbContext _db)
        {
            var userManager = serviceProvider.GetRequiredService<UserManager<User>>();
            var roleManager = serviceProvider.GetRequiredService<RoleManager<UserRole>>();

            // Ensure the Admin role exists
            if (!await roleManager.RoleExistsAsync("Admin"))
            {
                await roleManager.CreateAsync(new UserRole { Id = 1, Name = "Admin" });
            }

            // Ensure the Admin user exists
            var adminUser = await userManager.FindByNameAsync("User1");
            if (adminUser == null)
            {
                adminUser = new User
                {
                    UserName = "User1",
                    Name = "User1",
                    UserRoleId = 1,
                    Active = true,
                    LastLoggedInDate = DateTime.Now,
                    SecurityStamp = Guid.NewGuid().ToString() // Set the SecurityStamp
                };
                
                var result = await userManager.CreateAsync(adminUser, "123456789");
                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(adminUser, "Admin");
                    var adminSettings = new Settings
                    {
                    };
                    _db.Settings.Add(adminSettings);
                    _db.SaveChanges();
                }
                else
                {
                    // Handle errors if user creation fails
                    foreach (var error in result.Errors)
                    {
                        Console.WriteLine($"Error: {error.Description}");
                    }
                }
            }
        }
    }
}
