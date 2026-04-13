using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using starter_code.Data;
using starter_code.Models;

namespace starter_code.Controllers
{
    [Route("api/v2/bookings")]
    [ApiController]
    [Authorize]
    public class BookingsController : ControllerBase
    {
        private readonly AyventDbContext _context;

        public BookingsController(AyventDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Booking>>> GetBookings()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var userRole = User.FindFirstValue(ClaimTypes.Role);

            var query = _context.Bookings
                .Include(b => b.Event)
                .AsQueryable();

            if (userRole != "admin")
            {
                query = query.Where(b => b.UserId == userId);
            }

            return await query.ToListAsync();
        }

        [Authorize(Roles = "user")]
[HttpPost]
public async Task<ActionResult<Booking>> BookEvent([FromBody] BookingDto request)
{
    var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    var evt = await _context.Events.FindAsync(request.EventId);
    if (evt == null) return NotFound("Event not found.");

    var currentBookingsCount = await _context.Bookings
        .CountAsync(b => b.EventId == request.EventId);

    if (currentBookingsCount >= evt.Capacity)
    {
        return BadRequest("This event is fully booked.");
    }

    var alreadyBooked = await _context.Bookings
        .AnyAsync(b => b.EventId == request.EventId && b.UserId == userId);
    
    if (alreadyBooked) 
    {
        return BadRequest("You have already booked a ticket for this event.");
    }

    var newBooking = new Booking
    {
        UserId = userId,
        EventId = request.EventId
    };

    _context.Bookings.Add(newBooking);
    await _context.SaveChangesAsync();

    return Ok(newBooking);
}

        [HttpDelete("{id}")]
        public async Task<IActionResult> CancelBooking(int id)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var userRole = User.FindFirstValue(ClaimTypes.Role);

            var booking = await _context.Bookings.FindAsync(id);
            if (booking == null) return NotFound();

            if (userRole != "admin" && booking.UserId != userId)
            {
                return Forbid(); 
            }

            _context.Bookings.Remove(booking);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }

    public class BookingDto
    {
        public int EventId { get; set; }
    }
}