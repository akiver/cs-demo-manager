using System;
using System.Text.RegularExpressions;
using CSGO_Demos_Manager.Models;
using Newtonsoft.Json.Linq;

namespace CSGO_Demos_Manager.Services.Serialization
{
	/// <summary>
	/// Create a Demo instance with only custom data from user
	/// </summary>
	public class DemoBackupConverter : JsonCreationConverter<Demo>
	{
		private readonly Regex _oldDemoIdPattern = new Regex("^(?<mapName>.*?)(?<identifier>([0-9]*))$");

		/// <summary>
		/// Get the custom data from jObject and return a new Demo with its ID and custom data
		/// </summary>
		/// <param name="objectType"></param>
		/// <param name="jObject"></param>
		/// <returns></returns>
		protected override Demo Create(Type objectType, JObject jObject)
		{
			if (FieldExists("comment", jObject) && FieldExists("id", jObject))
			{
				string currentId = jObject["id"].ToString();
				string newId = currentId;
				Match matchId = _oldDemoIdPattern.Match(currentId);
				if (matchId.Success)
				{
					// Add a "_" for new id formatting
					newId = matchId.Groups["mapName"] + "_" + matchId.Groups["identifier"];
				}
				
				return new Demo
				{
					Id = newId,
					Comment = jObject["comment"].ToString(),
					Status = jObject["status"].ToString()
				};
			}
			return null;
		}

		private bool FieldExists(string fieldName, JObject jObject)
		{
			return jObject[fieldName] != null;
		}
	}
}