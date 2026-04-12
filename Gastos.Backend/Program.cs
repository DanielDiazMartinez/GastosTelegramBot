
using Gastos.Backend.Data;
using Gastos.Backend.Services;
using Microsoft.EntityFrameworkCore;
using Telegram.Bot;
using Tomlyn.Extensions.Configuration;


var builder = WebApplication.CreateBuilder(args);


builder.Configuration.AddTomlFile("config.toml", optional: true, reloadOnChange: true);

bool isDocker = Environment.GetEnvironmentVariable("DOTNET_RUNNING_IN_CONTAINER") == "true";
string section = isDocker ? "database_docker" : "database";

var dbHost = builder.Configuration[$"{section}:host"] ?? "localhost";
var dbName = builder.Configuration[$"{section}:name"];
var dbUser = builder.Configuration[$"{section}:user"];
var dbPass = builder.Configuration[$"{section}:password"];

var connectionString = $"Host={dbHost};Port=5432;Database={dbName};Username={dbUser};Password={dbPass};";

var configuredCorsOrigins = builder.Configuration["FRONTEND_CORS_ORIGINS"]
    ?.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

var serverIp = builder.Configuration["SERVER_IP"];
var fallbackCorsOrigins = new List<string>
{
    "http://localhost:5173",
    "http://127.0.0.1:5173"
};

if (!string.IsNullOrWhiteSpace(serverIp))
{
    fallbackCorsOrigins.Add($"http://{serverIp}:5173");
}

var allowedCorsOrigins = (configuredCorsOrigins is { Length: > 0 }
    ? configuredCorsOrigins
    : fallbackCorsOrigins.ToArray())
    .Distinct(StringComparer.OrdinalIgnoreCase)
    .ToArray();

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));

builder.Services.AddScoped<TransactionRepository>();

builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddMemoryCache();

const string FrontendCorsPolicy = "FrontendCorsPolicy";
builder.Services.AddCors(options =>
{
    options.AddPolicy(FrontendCorsPolicy, policy =>
    {
        policy
            .WithOrigins(allowedCorsOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.AddSingleton<ITelegramBotClient>(sp =>
    new TelegramBotClient(builder.Configuration["telegram:token"] ?? throw new InvalidOperationException("Token de Telegram no configurado.")));

builder.Services.AddHostedService<TelegramPoolingService>();
var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

if (!isDocker)
{
    app.UseHttpsRedirection();
}

app.UseCors(FrontendCorsPolicy);
app.UseAuthorization();
app.MapControllers();

app.Run();