using System;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace Core.Models.Serialization
{
	public class SideToStringConverter : JsonConverter
	{
		public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer)
		{
			DemoInfo.Team side = (DemoInfo.Team)value;
			string sideAsString = "Unknown";
			switch (side)
			{
				case DemoInfo.Team.CounterTerrorist:
					sideAsString = "CT";
					break;
				case DemoInfo.Team.Terrorist:
					sideAsString = "T";
					break;
			}
			serializer.Serialize(writer, sideAsString);
		}

		public override object ReadJson(JsonReader reader, Type objectType, object existingValue, JsonSerializer serializer)
		{
			JToken jt = JToken.ReadFrom(reader);
			switch ((string)jt)
			{
				case "CT":
					return DemoInfo.Team.CounterTerrorist;
				case "T":
					return DemoInfo.Team.Terrorist;
				default:
					return DemoInfo.Team.Spectate;
			}
		}

		public override bool CanConvert(Type objectType)
		{
			return typeof(DemoInfo.Team) == objectType;
		}
	}
}
