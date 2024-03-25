using ForumApi.Services.Auth;
using ForumApi.Services.Auth.Interfaces;
using ForumApi.Services.FileS;
using ForumApi.Services.FileS.Interfaces;
using ForumApi.Services.ForumS;
using ForumApi.Services.ForumS.Interfaces;
using ForumApi.Services.Utils;
using ForumApi.Services.Utils.Interfaces;

namespace ForumApi.Utils.Extensions
{
    public static class ServicesExtension
    {
        public static IServiceCollection AddAppServices(this IServiceCollection services)
        {
            //auth services
            services.AddScoped<ITokenService, TokenService>();
            services.AddScoped<IAccountService, AccountService>();
            services.AddScoped<IAuthService, AuthService>();

            // forum services
            services.AddScoped<ISectionService, SectionService>();
            services.AddScoped<IForumService, ForumService>();
            services.AddScoped<ITopicService, TopicService>();
            services.AddScoped<IPostService, PostService>();
            services.AddScoped<IBanService, BanService>();
            services.AddScoped<ISearchService, SearchService>();
            services.AddScoped<IImageService, ImageService>();
            services.AddScoped<INamesService, NamesService>();

            // work with files services
            services.AddScoped<IFileService, FileService>();
            services.AddScoped<IUploadService, UploadService>();

            services.AddSingleton<ISessionStorage, SessionStorage>();

            return services;
        }
    }
}