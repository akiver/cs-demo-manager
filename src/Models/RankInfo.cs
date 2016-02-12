using System;
using Newtonsoft.Json;

namespace CSGO_Demos_Manager.Models
{
	public class RankInfo
	{
		[JsonProperty("steamid")]
		public long SteamId { get; set; }

		[JsonProperty("number")]
		public int Number { get; set; }

		[JsonProperty("date")]
		public DateTime LastDate { get; set; }
	}
}
