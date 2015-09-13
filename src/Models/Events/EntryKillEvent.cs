using DemoInfo;
using Newtonsoft.Json;

namespace CSGO_Demos_Manager.Models.Events
{
	public class EntryKillEvent : BaseEvent
	{
		[JsonProperty("killer_player_name")]
		public string KillerName { get; set; }

		[JsonProperty("killer_player_steamid")]
		public long KillerSteamId { get; set; }

		[JsonProperty("killer_player_team")]
		public Team KillerTeam { get; set; }

		[JsonProperty("killed_player_name")]
		public string KilledName { get; set; }

		[JsonProperty("killed_player_steamid")]
		public long KilledSteamId { get; set; }

		[JsonProperty("killed_player_team")]
		public Team KilledTeam { get; set; }

		[JsonProperty("weapon")]
		public Weapon Weapon { get; set; }

		private bool _hasWin;

		[JsonProperty("has_win")]
		public bool HasWin
		{
			get { return _hasWin; }
			set
			{
				_hasWin = value;
				RaisePropertyChanged(() => Result);
			}
		}

		[JsonIgnore]
		public string Result => HasWin ? "Win" : "Loss";

		public EntryKillEvent(int tick) : base(tick)
		{
		}
	}
}