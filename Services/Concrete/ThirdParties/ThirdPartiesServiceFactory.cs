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
			}
		};

		public static IThirdPartyInterface Factory(string service)
		{
			switch (service)
			{
				case "csgostats":
					return new CsgoStatsService();
				default:
					throw new Exception("Third party service not found.");
			}
		}
	}
}
