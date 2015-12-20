using System;
using System.Collections.Generic;
using System.Text.RegularExpressions;
using CSGO_Demos_Manager.Models;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace CSGO_Demos_Manager.Services.Serialization
{
	/// <summary>
	/// JSON Converter to write / read a list of demos with only custom data that we need for a backup
	/// </summary>
	public class DemoListBackupConverter: JsonConverter
	{
		private readonly Regex _oldDemoIdPattern = new Regex("^(?<mapName>.*?_([^_0-9]+))(?<identifier>([0-9]*))$");


		public override bool CanConvert(Type objectType)
		{
			return objectType.IsGenericType;
		}

		public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer)
		{
			// The demos list is stored in an JSON array
			writer.WriteStartArray();
			foreach (Demo demo in (List<Demo>)value)
			{
				writer.WriteStartObject();
				Match matchId = _oldDemoIdPattern.Match(demo.Id);
				if (matchId.Success)
				{
					// Add a "_" for new id formatting
					demo.Id = matchId.Groups["mapName"] + "_" + matchId.Groups["identifier"];
				}
				writer.WritePropertyName("Id");
				writer.WriteValue(demo.Id);
				writer.WritePropertyName("Comment");
				writer.WriteValue(demo.Comment);
				writer.WritePropertyName("status");
				writer.WriteValue(demo.Status);
				writer.WriteEndObject();
			}
			writer.WriteEndArray();
		}

		public override object ReadJson(JsonReader reader, Type objectType, object existingValue, JsonSerializer serializer)
		{
			List<Demo> demos = new List<Demo>();

			while (reader.Read())
			{
				if (reader.TokenType != JsonToken.StartObject) break;

				JObject obj = (JObject)serializer.Deserialize(reader);

				Demo demo = new Demo
				{
					Id = Convert.ToString(((JValue) obj["Id"]).Value),
					Comment = Convert.ToString(((JValue) obj["Comment"]).Value),
					Status = Convert.ToString(((JValue)obj["status"]).Value)
				};
				if(!string.IsNullOrEmpty(demo.Comment) || !string.IsNullOrEmpty(demo.Status)) demos.Add(demo);
			}

			return demos;
		}
	}
}