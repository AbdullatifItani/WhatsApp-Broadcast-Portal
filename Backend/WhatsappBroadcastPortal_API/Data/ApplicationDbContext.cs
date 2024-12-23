using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using WhatsappBroadcastPortal_API.Models;

namespace WhatsappBroadcastPortal_API.Data
{
    public class ApplicationDbContext : IdentityDbContext<User, UserRole, int>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        //public DbSet<User> Users { get; set; }
        //public DbSet<UserRole> UserRoles { get; set; }
        public DbSet<Contact> Contacts { get; set; }
        public DbSet<Settings> Settings { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            // Seed initial data
            //modelBuilder.Entity<UserRole>().HasData(new UserRole { Id = 1, Name = "Admin" });
            //modelBuilder.Entity<User>().HasData(new User { Id = 1, Name = "User1", UserName = "User1", PasswordHash = HashPassword("123456789"), UserRoleId = 2, Active = true, LastLoggedInDate = DateTime.Now });
        }

        /*private static string HashPassword(string password)
        {
            var passwordHasher = new PasswordHasher<User>();
            return passwordHasher.HashPassword(null, password);
        }*/
    }
}