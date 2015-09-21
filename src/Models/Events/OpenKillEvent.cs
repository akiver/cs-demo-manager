using DemoInfo;
using Newtonsoft.Json;

namespace CSGO_Demos_Manager.Models.Events
{
	public class OpenKillEvent : BaseEvent
	{
		[JsonProperty("killer_player")]
		public PlayerExtended Killer { get; set; }

		[JsonProperty("killer_player_team")]
		public Team KillerTeam { get; set; }

		[JsonProperty("killed_player")]
		public PlayerExtended Killed { get; set; }

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

		public OpenKillEvent(int tick) : base(tick)
		{
		} 
	}
}