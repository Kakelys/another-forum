using AutoMapper;
using ForumApi.Data.Models;
using ForumApi.Data.Repository.Interfaces;
using ForumApi.DTO.DForum;
using ForumApi.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ForumApi.Services
{
    public class ForumService : IForumService
    {
        private readonly IRepositoryManager _rep;
        private readonly IMapper _mapper;

        public ForumService(
            IRepositoryManager rep,
            IMapper mapper)
        {
            _rep = rep;
            _mapper = mapper;
        }

        public async Task<Forum> Create(ForumDto forumDto)
        {
            var forum = _rep.Forum.Create(_mapper.Map<Forum>(forumDto));
            await _rep.Save();
            
            return forum;
        }

        public async Task<ForumResponse?> Get(int forumId)
        {
            return await _rep.Forum
                .FindByCondition(f => f.Id == forumId && f.DeletedAt == null)
                .Include(f => f.Topics.Where(t => t.DeletedAt == null))
                .ThenInclude(t => t.Posts.Where(p => p.DeletedAt == null))
                .Select(f => new ForumResponse
                {
                    Id = f.Id,
                    Title = f.Title,
                    MsgsCount = f.Topics.SelectMany(t => t.Posts).Count(),
                    TopicsCount = f.Topics.Count
                }).FirstOrDefaultAsync();
        }
    }
}