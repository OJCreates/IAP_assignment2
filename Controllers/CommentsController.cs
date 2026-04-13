using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization; 
using starter_code.Data;
using starter_code.Models;
using System.Security.Claims;

namespace starter_code.Controllers
{
    [Route("api/v2/comments")]
    [ApiController]
    public class CommentsController : ControllerBase
    {
        private readonly AyventDbContext _context;

        public CommentsController(AyventDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Comment>>> GetComments()
        {
            return await _context.Comments.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Comment>> GetComment(int id)
        {
            var comment = await _context.Comments.FindAsync(id);
            if (comment == null) return NotFound();
            return comment;
        }

        [Authorize]
        [HttpPost]
        public async Task<ActionResult<Comment>> CreateComment(Comment comment)
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var username = User.Identity?.Name;

            if (string.IsNullOrEmpty(userIdStr)) return Unauthorized("Invalid token.");

            comment.UserId = int.Parse(userIdStr);
            comment.Username = username ?? "Unknown User";
            comment.CreatedAt = DateTime.Now;

            _context.Comments.Add(comment);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetComment), new { id = comment.Id }, comment);
        }

        [Authorize(Roles = "admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteComment(int id)
        {
            var comment = await _context.Comments.FindAsync(id);
            if (comment == null) return NotFound();

            _context.Comments.Remove(comment);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}