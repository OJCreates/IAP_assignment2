using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using starter_code.Data;
using starter_code.Models;
using Microsoft.AspNetCore.Authorization;

namespace starter_code.Controllers
{
    [Route("api/v2/organizers")]
    [ApiController]
    public class OrganizersController : ControllerBase
    {
        private readonly AyventDbContext _context;

        public OrganizersController(AyventDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Organizer>>> GetOrganizers()
        {
            return await _context.Organizers.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Organizer>> GetOrganizer(int id)
        {
            var organizer = await _context.Organizers.FindAsync(id);
            if (organizer == null) return NotFound();
            return organizer;
        }

        [HttpPost]
        public async Task<ActionResult<Organizer>> CreateOrganizer(Organizer organizer)
        {
            _context.Organizers.Add(organizer);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetOrganizer), new { id = organizer.Id }, organizer);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateOrganizer(int id, Organizer organizer)
        {
            if (id != organizer.Id) return BadRequest();
            _context.Entry(organizer).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteOrganizer(int id)
        {
            var organizer = await _context.Organizers.FindAsync(id);
            if (organizer == null) return NotFound();
            _context.Organizers.Remove(organizer);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}