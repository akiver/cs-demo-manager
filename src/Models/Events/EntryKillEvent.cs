using DemoInfo;
using Newtonsoft.Json;

namespace CSGO_Demos_Manager.Models.Events
{
	public class EntryKillEvent : BaseEvent
	{
		[JsonProperty("killer")]
		public PlayerExtended Killer { get; set; }

		[JsonProperty("killer_side")]
		public Team KillerTeam { get; set; }

		[JsonProperty("killed")]
		public PlayerExtended Killed { get; set; }

		[JsonProperty("killed_side")]
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