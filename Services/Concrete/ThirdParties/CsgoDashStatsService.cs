using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Core;
using Core.Models;
using Newtonsoft.Json;
using Services.Interfaces;
using Services.Models.ThirdParties;
using Services.Models.ThirdParties.Responses;

namespace Services.Concrete.ThirdParties
{
	public class CsgoDashStatsService : IThirdPartyInterface
	{
		private const string ENDPOINT = "https://csgo-stats.net/api/match/status";

		public async Task<ThirdPartyData> SendShareCode(Demo demo, string shareCode)
		{
			ThirdPartyData data = new ThirdPartyData { Success = false };

			using (var client = new HttpClient())
			{
				ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12;
				try
				{
					Dictionary<string, string> parameters = new Dictionary<string, string> {
						{ "sharecode", shareCode }
					};

					var content = new FormUrlEncodedContent(parameters);

					HttpResponseMessage response = await client.PostAsync(ENDPOINT, content);

					if (response.StatusCode == HttpStatusCode.OK && response.Content != null)
					{
						string responseString = await response.Content.ReadAsStringAsync();

						CsgoDashStatsResponse jsonObject = JsonConvert.DeserializeObject<CsgoDashStatsResponse>(responseString);
						if (jsonObject != null)
						{
							data.Success = true;
							data.DemoUrl = $"https://csgo-stats.net/search?q={shareCode}";
						}
					}

				}
				catch (Exception e)
				{
					Logger.Instance.Log(e);
				}
			}

			return data;
		}
	}
}
