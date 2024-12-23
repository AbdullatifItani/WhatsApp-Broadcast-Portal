using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WhatsappBroadcastPortal_API.Migrations
{
    /// <inheritdoc />
    public partial class settingsUpdatedForMaytapi : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PhoneId",
                table: "Settings",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "ProductId",
                table: "Settings",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "Token",
                table: "Settings",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PhoneId",
                table: "Settings");

            migrationBuilder.DropColumn(
                name: "ProductId",
                table: "Settings");

            migrationBuilder.DropColumn(
                name: "Token",
                table: "Settings");
        }
    }
}
