namespace starter_code.Models
{
    public class Event
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public string DisplayImage { get; set; } = string.Empty;

        public int Capacity { get; set; }

        public int OrganizerId { get; set; }
        public Organizer? Organizer { get; set; }

        public ICollection<Comment>? Comments { get; set; }
        public ICollection<Booking>? Attendees { get; set; }
    }
}