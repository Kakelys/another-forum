using ForumApi.Data.Models;
using ForumApi.DTO.DBan;
using ForumApi.DTO.Utils;

namespace ForumApi.Services.Auth.Interfaces
{
    public interface IBanService
    {
        Task<List<BanResponse>> GetBans(Page page);
        Task<Ban> Create(int moderId, BanDto ban);
        Task<Ban> Update(int moderId, int banId, BanDto ban);
        Task Delete(int moderId, int accountId);
    }
}