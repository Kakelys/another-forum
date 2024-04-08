namespace ForumApi.DTO.DTopic
{
    public class TopicEdit
    {
        public int ForumId { get; set; }
        public string Title { get; set; } = null!;
        public bool IsPinned { get; set; }
        public bool IsClosed { get; set; }
    }
}