using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CSGO_Demos_Manager.Models;
using CSGO_Demos_Manager.Models.Stats;
using CSGO_Demos_Manager.Services.Interfaces;

namespace CSGO_Demos_Manager.Services.Design
{
	public class PlayerServiceDesign : IPlayerService
	{
		public Task<List<PlayerRoundStats>> GetRoundStats(Demo demo, Round round)
		{
			List<PlayerRoundStats> stats = new List<PlayerRoundStats>();
			Random ran = new Random();
			for (int i = 0; i < 10; i++)
			{
				stats.Add(new PlayerRoundStats
				{
					Name = "Player " + (i + 1),
					DamageArmorCount = ran.Next(300),
					DamageHealthCount = ran.Next(300),
					EquipementValue = ran.Next(8000),
					HitCount = ran.Next(8),
					JumpKillCount = 0,
					KillCount = ran.Next(9),
					ShotCount = ran.Next(200),
					StartMoneyValue = ran.Next(16000)
				});
			}

			return Task.FromResult(stats);
		}
	}
}
