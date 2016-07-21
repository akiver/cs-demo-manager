using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Models;
using Services.Interfaces;
using Services.Models.Timelines;

namespace Services.Design
{
	public class RoundDesignService : IRoundService
	{
		public Task<List<RoundEvent>> GetTimeLineEventList(Demo demo, Round round)
		{
			List<RoundEvent> roundEventList = new List<RoundEvent>();
			Random ran = new Random();
			for (int i = 0; i < 7; i++)
			{
				int timeEvent = ran.Next(1, 100);
				roundEventList.Add(new RoundEvent
				{
					StartTime = DateTime.Today.AddSeconds(timeEvent),
					EndTime = DateTime.Today.AddSeconds(timeEvent + 1),
					Category = "Kill",
					Message = "Player killed Player",
					Type = "kill"
				});
			}

			return Task.FromResult(roundEventList);
		}

		public Task<Round> MapRoundValuesToSelectedPlayer(Demo demo, Round round, long playerSteamId = 0)
		{
			return Task.FromResult(round);
		}
	}
}
