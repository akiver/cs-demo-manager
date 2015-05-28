using Newtonsoft.Json;

namespace CSGO_Demos_Manager.Models.Events
{
	public class BombDefusedEvent : BaseEvent
	{
		[JsonProperty("defuser")]
		public PlayerExtended Player { get; set; }

		[JsonProperty("bomb_site")]
		public string Site { get; set; }

		[JsonIgnore]
		public override string Message => "Bomb defused on BP " + Site + " by " + Player.Name;

		public BombDefusedEvent(int tick)
			: base(tick)
		{
			Player = new PlayerExtended();
		}
	}
}
