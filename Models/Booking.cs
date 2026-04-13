namespace starter_code.Models
{
    public class Booking
    {
        public int Id { get; set; }
        public DateTime BookingDate { get; set; } = DateTime.Now;
        public string TicketNumber { get; set; } = Guid.NewGuid().ToString().Substring(0, 8).ToUpper(); 

        public int UserId { get; set; }
        public User? User { get; set; }

        public int EventId { get; set; }
        public Event? Event { get; set; }
    }
}