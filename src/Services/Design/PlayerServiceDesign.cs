using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CSGO_Demos_Manager.Models;
using CSGO_Demos_Manager.Models.Charts;
using CSGO_Demos_Manager.Models.Stats;
using CSGO_Demos_Manager.Services.Interfaces;

namespace CSGO_Demos_Manager.Services.Design
{
	public class PlayerServiceDesign : IPlayerService
	{
		public Task<List<PlayerRoundStats>> GetPlayerRoundStatsListAsync(Demo demo, Round round)
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

		public Task<List<PlayerRoundStats>> GetRoundListStatsAsync(Demo demo, PlayerExtended player)
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

		public Task<List<GenericDoubleChart>> GetEquipmentValueChartAsync(Demo demo, PlayerExtended player)
		{
			List<GenericDoubleChart> data = new List<GenericDoubleChart>();
			Random r = new Random();
			for (int i = 1; i < 20; i++)
			{
				data.Add(new GenericDoubleChart
				{
					Label = i.ToString(),
					Value = r.Next(800, 7000)
				});
			}

			return Task.FromResult(data);
		}

		public Task<List<GenericDoubleChart>> GetCashEarnedChartAsync(Demo demo, PlayerExtended player)
		{
			List<GenericDoubleChart> data = new List<GenericDoubleChart>();
			Random r = new Random();
			for (int i = 1; i < 20; i++)
			{
				data.Add(new GenericDoubleChart
				{
					Label = i.ToString(),
					Value = r.Next(2250, 3500)
				});
			}

			return Task.FromResult(data);
		}

		public Task<List<GenericDoubleChart>> GetDamageHealthChartAsync(Demo demo, PlayerExtended player)
		{
			List<GenericDoubleChart> data = new List<GenericDoubleChart>();
			Random r = new Random();
			for (int i = 1; i < 20; i++)
			{
				data.Add(new GenericDoubleChart
				{
					Label = i.ToString(),
					Value = r.Next(0, 200)
				});
			}

			return Task.FromResult(data);
		}

		public Task<List<GenericDoubleChart>> GetDamageArmorChartAsync(Demo demo, PlayerExtended player)
		{
			List<GenericDoubleChart> data = new List<GenericDoubleChart>();
			Random r = new Random();
			for (int i = 1; i < 20; i++)
			{
				data.Add(new GenericDoubleChart
				{
					Label = i.ToString(),
					Value = r.Next(0, 100)
				});
			}

			return Task.FromResult(data);
		}

		public Task<List<GenericDoubleChart>> GetTotalDamageHealthChartAsync(Demo demo, PlayerExtended player)
		{
			List<GenericDoubleChart> data = new List<GenericDoubleChart>();
			for (int i = 1; i < 20; i++)
			{
				data.Add(new GenericDoubleChart
				{
					Label = i.ToString(),
					Value = i * 100
				});
			}

			return Task.FromResult(data);
		}

		public Task<List<GenericDoubleChart>> GetTotalDamageArmorChartAsync(Demo demo, PlayerExtended player)
		{
			List<GenericDoubleChart> data = new List<GenericDoubleChart>();
			for (int i = 1; i < 20; i++)
			{
				data.Add(new GenericDoubleChart
				{
					Label = i.ToString(),
					Value = i * 20
				});
			}

			return Task.FromResult(data);
		}

		public Task<List<GenericDoubleChart>> GetWeaponKillChartAsync(Demo demo, PlayerExtended player)
		{
			List<GenericDoubleChart> data = new List<GenericDoubleChart>();
			Random r = new Random();
			data.Add(new GenericDoubleChart
			{
				Label = Weapon.P250,
				Value = r.Next(6)
			});
			data.Add(new GenericDoubleChart
			{
				Label = Weapon.AK_47,
				Value = r.Next(10)
			});
			data.Add(new GenericDoubleChart
			{
				Label = Weapon.AWP,
				Value = r.Next(5)
			});
			data.Add(new GenericDoubleChart
			{
				Label = Weapon.MP7,
				Value = r.Next(5)
			});

			return Task.FromResult(data);
		}
	}
}
