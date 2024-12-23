using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WhatsappBroadcastPortal_API.Migrations
{
    /// <inheritdoc />
    public partial class uniquePhoneUserId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Contacts_Phone",
                table: "Contacts");

            migrationBuilder.CreateIndex(
                name: "IX_Contacts_UserId_Phone",
                table: "Contacts",
                columns: new[] { "UserId", "Phone" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Contacts_UserId_Phone",
                table: "Contacts");

            migrationBuilder.CreateIndex(
                name: "IX_Contacts_Phone",
                table: "Contacts",
                column: "Phone",
                unique: true);
        }
    }
}
