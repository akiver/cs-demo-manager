using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CSGO_Demos_Manager.Models;
using CSGO_Demos_Manager.Models.Timeline;
using CSGO_Demos_Manager.Services.Interfaces;

namespace CSGO_Demos_Manager.Services.Design
{
	public class RoundServiceDesign : IRoundService
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
	}
}
