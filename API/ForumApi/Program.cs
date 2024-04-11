using System.Text.Json.Serialization;
using ForumApi.Data.Repository;
using ForumApi.Utils.Extensions;
using ForumApi.Utils.Middlewares;
using ForumApi.Options;
using Microsoft.OpenApi.Models;
using ForumApi.Hubs;

//need to be checked before create builder
if (!Directory.Exists("wwwroot"))
{
  Directory.CreateDirectory("wwwroot");
}

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddLogging();

builder.Services.AddAppOptions(builder.Configuration);

var imageSettings = builder.Configuration
  .GetSection(ImageOptions.Image)
  .Get<ImageOptions>() ?? throw new ArgumentNullException("ImageOptions");

//check for folders
if(!Directory.Exists($"{imageSettings.Folder}/{imageSettings.AvatarFolder}"))
{
  Directory.CreateDirectory($"{imageSettings.Folder}/{imageSettings.AvatarFolder}");
}

if(!Directory.Exists($"{imageSettings.Folder}/{imageSettings.PostImageFolder}"))
{
  Directory.CreateDirectory($"{imageSettings.Folder}/{imageSettings.PostImageFolder}");
}

builder.Services.AddRepository(builder.Configuration);

builder.Services.AddAppServices();

builder.Services.AddControllers()
  .AddJsonOptions(options => options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));

builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "FroumAPI", Version = "v1" });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
      {
        Description = @"Example: 'Bearer eyASDsddw....'",
         Name = "Authorization",
         In = ParameterLocation.Header,
         Type = SecuritySchemeType.ApiKey,
         Scheme = "Bearer"
       });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement()
      {
        {
          new OpenApiSecurityScheme
          {
            Reference = new OpenApiReference
              {
                Type = ReferenceType.SecurityScheme,
                Id = "Bearer"
              },
              Scheme = "oauth2",
              Name = "Bearer",
              In = ParameterLocation.Header,

            },
            new List<string>()
          }
      });
});

builder.Services.ConfigureAutoMapper();
builder.Services.AddValidators();
builder.Services.AddJwtAuth(builder.Configuration);

builder.Services.AddSignalR();

var frontCorsPolicy = "frontCorsPolicy";
builder.Services.AddCors(options =>
{
  options.AddPolicy(
    name : frontCorsPolicy,
    policy =>
    {
      var clients = builder.Configuration.GetSection("Clients").Get<List<string>>();

      if(clients?.Count != 0)
      {
        foreach (var client in clients!)
        {
          policy.WithOrigins(client);
        }
      }

      policy.AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

builder.Services.ConfigureLocalization();

var app = builder.Build();

app.UseRequestLocalization();

app.UseMiddleware<ExceptionMiddleware>();
app.UseMiddleware<QueryTokenMiddleware>();

//check for default avatar
if(!File.Exists($"{imageSettings.Folder}/{imageSettings.AvatarDefault}"))
{
  app.Logger.LogWarning($"Default avatar in {imageSettings.Folder}/{imageSettings.AvatarDefault} not found.");
}

app.UseCors(frontCorsPolicy);
app.UseStaticFiles();

app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

app.UseSwagger();
app.UseSwaggerUI( options => {
  options.SwaggerEndpoint("/swagger/v1/swagger.json", "v1");
  options.RoutePrefix = "";
});

app.MapControllers();
app.MapHub<MainHub>("/api/v1/signalr");

app.Run();
