using System;
using System.Collections.Generic;
using Services.Interfaces;

namespace Services.Concrete.ThirdParties
{
	public struct ThirdParty
	{
		public string Name;
		public string Url;
	}

	public static class ThirdPartiesServiceFactory
	{
		public static List<ThirdParty> ThirdParties = new List<ThirdParty>
		{
			new ThirdParty
			{
				Name = "csgostats",
				Url = "csgostats.gg"
			},
			new ThirdParty
			{
				Name = "csgo-stats-net",
				Url = "csgo-stats.net",
			},
			new ThirdParty
			{
				Name = "csgo-stats-com",
				Url = "csgo-stats.com",
			}
		};

		public static IThirdPartyInterface Factory(string service)
		{
			switch (service)
			{
				case "csgostats":
					return new CsgoStatsService();
				case "csgo-stats-net":
					return new CsgoDashStatsService();
				case "csgo-stats-com":
					return new CsgoDashStatsComService();
				default:
					throw new Exception("Third party service not found.");
			}
		}
	}
}
