using api;
using starter_code;
using starter_code.Middleware;
using Microsoft.EntityFrameworkCore;
using starter_code.Data;

using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;


var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
});
//builder.Services.AddRazorPages();

// Register custom API services
builder.RegisterApi(Initialiser.GetDir(builder.Configuration.GetValue<string>("DbFile") ?? ""));

builder.Services.AddDbContext<AyventDbContext>(options =>
    options.UseSqlite($"Data Source={Initialiser.GetDir(builder.Configuration.GetValue<string>("DbFile") ?? "AyventDb.db")}"));

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("this_is_my_super_secret_auth_key_for_ayvent_that_is_very_long")),
            ValidateIssuer = false,
            ValidateAudience = false
        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var context = services.GetRequiredService<AyventDbContext>();
    context.Database.EnsureCreated();
}

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AyventDbContext>();
    dbContext.Database.EnsureCreated();
}

// Start Mk5202 Initialiser
// Initialiser.Start();


// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}


/**
 * Config route example:
 *      api/config?action=reset-database
 *      api/config?action=reset-table:messages
 *      api/config?action=populate-table:messages
 */
app.UseApi();

app.UseHttpsRedirection();
app.UseStaticFiles();
app.MapGet("/", async context =>
    {
       // context.Response.ContentType = "text/html";
        await context.Response.SendFileAsync("wwwroot/index.html");
    }
    );

app.UseRouting();

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.UseRedirectRoot();

//app.MapRazorPages();

app.Run();