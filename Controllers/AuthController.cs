using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using starter_code.Data;
using starter_code.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;


namespace starter_code.Controllers
{
    [Route("api/v2/auth")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AyventDbContext _context;

        public AuthController(AyventDbContext context)
        {
            _context = context;
        }

        

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] User user)
        {   
            if (await _context.Users.AnyAsync(u => u.Username == user.Username))
                return BadRequest("Username is already taken.");
            
            user.PasswordHash = user.Password;

            if (string.IsNullOrEmpty(user.Role)) user.Role = "user";

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok("User registered successfully.");
        }

        [HttpPost("login")]
        public async Task<ActionResult<string>> Login(UserDto request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == request.Username);
            
            if (user == null || (user.Password != request.Password &&user.PasswordHash != request.Password))
            {
                return BadRequest("Wrong username or password.");
            }

            var token = CreateToken(user);
            
            return Ok(new { token = token, role = user.Role });
        }

        private string CreateToken(User user)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Role, user.Role)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("this_is_my_super_secret_auth_key_for_ayvent_that_is_very_long"));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256Signature);

            var token = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.Now.AddDays(1),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }

    public class UserDto
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}