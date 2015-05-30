using System;
using CSGO_Demos_Manager.Models;
using Newtonsoft.Json.Linq;

namespace CSGO_Demos_Manager.Services.Serialization
{
	/// <summary>
	/// Create a Demo instance with only custom data from user
	/// </summary>
	public class DemoBackupConverter : JsonCreationConverter<Demo>
	{
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
				return new Demo()
				{
					Id = jObject["id"].ToString(),
					Comment = jObject["comment"].ToString()
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