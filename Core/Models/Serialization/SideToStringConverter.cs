using System;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace Core.Models.Serialization
{
	public class SideToStringConverter : JsonConverter
	{
		public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer)
		{
			string sideAsString = string.Empty;
			Side side = (Side)value;
			switch (side)
			{
				case Side.CounterTerrorist:
					sideAsString = "CT";
					break;
				case Side.Terrorist:
					sideAsString = "T";
					break;
				case Side.Spectate:
					sideAsString = "SPEC";
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
					return Side.CounterTerrorist;
				case "T":
					return Side.Terrorist;
				case "SPEC":
					return Side.Spectate;
				default:
					return Side.None;
			}
		}

		public override bool CanConvert(Type objectType)
		{
			return typeof(Side) == objectType;
		}
	}
}
