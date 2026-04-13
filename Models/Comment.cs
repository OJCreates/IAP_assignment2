namespace starter_code.Models
{
    public class Comment
    {
        public int Id { get; set; }
        public string Content { get; set; } = string.Empty; 
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        
        public int EventId { get; set; }
        public int UserId { get; set; }
        public string Username { get; set; } = string.Empty;
    }
}