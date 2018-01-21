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
		public Task<List<TimelineEvent>> GetTimeLineEventList(Demo demo, Round round)
		{
			List<TimelineEvent> roundEventList = new List<TimelineEvent>();
			Random ran = new Random();
			for (int i = 0; i < 7; i++)
			{
				int timeEvent = ran.Next(1, 100);
				roundEventList.Add(new KillEventTimeline(demo.ServerTickrate, timeEvent, (int)(timeEvent + demo.ServerTickrate)));
			}

			return Task.FromResult(roundEventList);
		}

		public Task<Round> MapRoundValuesToSelectedPlayer(Demo demo, Round round, long playerSteamId = 0)
		{
			return Task.FromResult(round);
		}
	}
}
