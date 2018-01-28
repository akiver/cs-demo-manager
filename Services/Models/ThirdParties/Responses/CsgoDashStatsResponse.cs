using Newtonsoft.Json;

namespace Services.Models.ThirdParties.Responses
{
	public class CsgoDashStatsResponse
	{
		[JsonProperty("status")]
		public string Status { get; set; }

		[JsonProperty("progress")]
		public int Progress { get; set; }

		[JsonProperty("matchid")]
		public int MatchId { get; set; }

		[JsonProperty("url")]
		public string Url { get; set; }
	}
}
