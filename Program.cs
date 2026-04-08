using api;
using starter_code;
using starter_code.Middleware;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
//builder.Services.AddRazorPages();

// Register custom API services
builder.RegisterApi(Initialiser.GetDir(builder.Configuration.GetValue<string>("DbFile") ?? ""));


var app = builder.Build();

// Start Mk5202 Initialiser
Initialiser.Start();


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

app.UseAuthorization();

app.UseRedirectRoot();

//app.MapRazorPages();

app.Run();