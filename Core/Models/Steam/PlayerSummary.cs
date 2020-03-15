namespace Core.Models.Steam
{
	public class PlayerSummary
	{
		public string SteamId { get; set; }

		public int CommunityVisibilityState { get; set; }

		public int ProfileState { get; set; }

		public string PersonaName { get; set; }

		public string RealName { get; set; }

		public int CommentPermission { get; set; }

		public string ProfileUrl { get; set; }

		public string Avatar { get; set; }

		public string AvatarMedium { get; set; }

		public string AvatarFull { get; set; }

		public int PersonaState { get; set; }

		public string PrimaryClanId { get; set; }

		public int TimeCreated { get; set; }

		public int PersonaStateFlags { get; set; }
	}
}
