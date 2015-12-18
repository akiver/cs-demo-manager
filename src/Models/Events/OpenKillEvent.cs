using DemoInfo;
using Newtonsoft.Json;

namespace CSGO_Demos_Manager.Models.Events
{
	public class OpenKillEvent : BaseEvent
	{
		[JsonProperty("killer_steamid")]
		public long KillerSteamId { get; set; }

		[JsonProperty("killer_name")]
		public string KillerName { get; set; }

		[JsonProperty("killer_side")]
		public Team KillerSide { get; set; }

		[JsonProperty("killed_steamid")]
		public long KilledSteamId { get; set; }

		[JsonProperty("killed_name")]
		public string KilledName { get; set; }

		[JsonProperty("killed_side")]
		public Team KilledSide { get; set; }

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

		public OpenKillEvent(int tick, float seconds) : base(tick, seconds) { }
	}
}