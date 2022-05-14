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
                Name = "csgo-stats-com",
                Url = "csgo-stats.com",
            },
        };

        public static IThirdPartyInterface Factory(string service)
        {
            switch (service)
            {
                case "csgo-stats-com":
                    return new CsgoDashStatsComService();
                default:
                    throw new Exception("Third party service not found.");
            }
        }
    }
}
