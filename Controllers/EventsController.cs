using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using starter_code.Data;
using starter_code.Models;

namespace starter_code.Controllers
{
    [Route("api/v2/events")]
    [ApiController] 
    public class EventsController : ControllerBase
    {
        private readonly AyventDbContext _context;

        public EventsController(AyventDbContext context)
        {
            _context = context;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Event>> GetEvent(int id)
        {
            var singleEvent = await _context.Events
                .Include(e => e.Organizer)
                .Include(e => e.Comments)
                .FirstOrDefaultAsync(e => e.Id == id);

            if (singleEvent == null) return NotFound();

            return singleEvent;
        }

        [HttpGet]
public async Task<ActionResult<IEnumerable<Event>>> GetEvents([FromQuery] string? title, [FromQuery] string? location, [FromQuery] string? search)
{
    var query = _context.Events
        .Include(e => e.Organizer)
        .Include(e => e.Comments)
        .AsQueryable();

    if (!string.IsNullOrWhiteSpace(search))
    {
        var s = search.ToLower();
        query = query.Where(e => 
            (e.Title != null && e.Title.ToLower().Contains(s)) || 
            (e.Location != null && e.Location.ToLower().Contains(s))
        );
    }

    if (!string.IsNullOrWhiteSpace(title))
    {
        query = query.Where(e => e.Title.ToLower().Contains(title.ToLower()));
    }

    if (!string.IsNullOrWhiteSpace(location))
    {
        query = query.Where(e => e.Location != null && e.Location.ToLower().Contains(location.ToLower()));
    }

    var events = await query.ToListAsync();
    return Ok(events);
}

        [Authorize(Roles = "admin")]
        [HttpPost]
        public async Task<ActionResult<Event>> CreateEvent(Event newEvent)
        {
            _context.Events.Add(newEvent);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetEvent), new { id = newEvent.Id }, newEvent);
        }

        [Authorize(Roles = "admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateEvent(int id, Event updatedEvent)
        {
            if (id != updatedEvent.Id) return BadRequest();

            _context.Entry(updatedEvent).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [Authorize(Roles = "admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEvent(int id)
        {
            var eventToDelete = await _context.Events.FindAsync(id);
            if (eventToDelete == null) return NotFound();

            _context.Events.Remove(eventToDelete);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}