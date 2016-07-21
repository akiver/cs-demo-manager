using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Models;
using Services.Interfaces;
using Services.Models.Stats;

namespace Services.Design
{
	public class KillDesignService : IKillService
	{
		public Demo Demo { get; set; }

		public Task<List<KillDataPoint>> GetPlayersKillsMatrix()
		{
			List<KillDataPoint> data = new List<KillDataPoint>();

			Random rand = new Random();

			for (int i = 1; i <= 10; i++)
			{
				for (int j = 1; j <= 10; j++)
				{
					data.Add(new KillDataPoint
					{
						Killer = "Player " + i,
						Victim = "Player " + j,
						Count = rand.Next(0, 20)
					});
				}
			}

			return Task.FromResult(data);
		}
	}
}
