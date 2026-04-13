using Microsoft.EntityFrameworkCore;
using starter_code.Models;

namespace starter_code.Data
{
    public class AyventDbContext : DbContext
    {

        public AyventDbContext(DbContextOptions<AyventDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Organizer> Organizers { get; set; }
        public DbSet<Event> Events { get; set; }
        public DbSet<Comment> Comments { get; set; }
        public DbSet<Message> Messages { get; set; }
        public DbSet<Booking> Bookings { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Booking>()
                .HasOne(b => b.User)
                .WithMany(u => u.Bookings)
                .HasForeignKey(b => b.UserId);

            modelBuilder.Entity<Booking>()
                .HasOne(b => b.Event)
                .WithMany(e => e.Attendees)
                .HasForeignKey(b => b.EventId);

            modelBuilder.Entity<Organizer>() .HasData(
                new Organizer
                {
                    Id = 1,
                    Name = "Admin Organizer",
                    ContactEmail = "admin@ayvent.com",
                    Phone = "123-456-7890"
                }
            );

            modelBuilder.Entity<User>().HasData(
                new User 
                { 
                    Id = 1, 
                    Username = "admin", 
                    PasswordHash = "admin123",
                    Role = "admin" 
                },
                new User 
                { 
                    Id = 2, 
                    Username = "user1",
                    PasswordHash = "user123",
                    Role = "user" 
                },
                new User 
                { 
                    Id = 3, 
                    Username = "user2",
                    PasswordHash = "user456",
                    Role = "user" 
                }
            );
        }
    }
}