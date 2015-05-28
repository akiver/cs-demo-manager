using Newtonsoft.Json;

namespace CSGO_Demos_Manager.Models.Events
{
	public class BombPlantedEvent : BaseEvent
	{
		[JsonProperty("planter")]
		public PlayerExtended Player { get; set; }

		[JsonProperty("bomb_site")]
		public string Site { get; set; }

		[JsonIgnore]
		public float X { get; set; }

		[JsonIgnore]
		public float Y { get; set; }

		[JsonIgnore]
		public override string Message => "Bomb planted by " + Player.Name + " on BP " + Site;

		public BombPlantedEvent(int tick) : base(tick)
		{
			Player = new PlayerExtended();
		}
	}
}
