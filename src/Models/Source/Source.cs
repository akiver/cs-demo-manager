using System.Drawing;
using Newtonsoft.Json;

namespace CSGO_Demos_Manager.Models.Source
{
	public abstract class Source
	{
		[JsonProperty("name")]
		public string Name { get; set; }

		[JsonIgnore]
		public Image Logo { get; set; }

		public static Source Factory(string name)
		{
			switch (name)
			{
				case "valve":
					return new Valve();
				case "esea":
					return new Esea();
				case "ebot":
					return new Ebot();
				case "pov":
					return new Pov();
                case "faceit":
                    return new Faceit();
				default:
					return null;
			}
		}
	}
}