using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CSGO_Demos_Manager.Models;
using CSGO_Demos_Manager.Models.Charts;
using CSGO_Demos_Manager.Models.Events;
using CSGO_Demos_Manager.Models.Stats;
using CSGO_Demos_Manager.Services.Interfaces;

namespace CSGO_Demos_Manager.Services.Stats
{
	public class PlayerService : IPlayerService
	{
		public async Task<List<PlayerRoundStats>> GetPlayerRoundStatsListAsync(Demo demo, Round round)
		{
			List<PlayerRoundStats> data = new List<PlayerRoundStats>();
			Dictionary<PlayerExtended, PlayerRoundStats> playerRoundStats = new Dictionary<PlayerExtended, PlayerRoundStats>();

			await Task.Factory.StartNew(() =>
			{
				foreach (PlayerExtended player in demo.Players)
				{
					if (!playerRoundStats.ContainsKey(player))
					{
						playerRoundStats.Add(player, new PlayerRoundStats());
						playerRoundStats[player].Name = player.Name;
						if (!player.StartMoneyRounds.ContainsKey(round.Number)) player.StartMoneyRounds[round.Number] = 0;
						if (!player.EquipementValueRounds.ContainsKey(round.Number)) player.EquipementValueRounds[round.Number] = 0;
						playerRoundStats[player].StartMoneyValue = player.StartMoneyRounds[round.Number];
						playerRoundStats[player].EquipementValue = player.EquipementValueRounds[round.Number];
					}

					foreach (WeaponFire e in demo.WeaponFired)
					{
						if (e.RoundNumber == round.Number && e.ShooterSteamId == player.SteamId)
						{
							playerRoundStats[player].ShotCount++;
						}
					}

					foreach (PlayerHurtedEvent e in demo.PlayersHurted)
					{
						if (e.RoundNumber == round.Number && e.AttackerSteamId != 0 && e.AttackerSteamId == player.SteamId)
						{
							playerRoundStats[player].DamageArmorCount += e.ArmorDamage;
							playerRoundStats[player].DamageHealthCount += e.HealthDamage;
							playerRoundStats[player].HitCount++;
						}
					}

					foreach (KillEvent e in round.Kills)
					{
						if (e.KillerSteamId == player.SteamId)
						{
							playerRoundStats[player].KillCount++;
							if (e.KillerVelocityZ > 0) playerRoundStats[player].JumpKillCount++;
						}
					}
				}

				data.AddRange(playerRoundStats.Select(keyValuePair => keyValuePair.Value));
			});
			return data;
		}

		public async Task<List<PlayerRoundStats>> GetRoundListStatsAsync(Demo demo, PlayerExtended player)
		{
			List<PlayerRoundStats> data = new List<PlayerRoundStats>();

			CacheService cacheService = new CacheService();
			demo.WeaponFired = await cacheService.GetDemoWeaponFiredAsync(demo);
			foreach (Round round in demo.Rounds)
			{
				PlayerRoundStats stats = new PlayerRoundStats
				{
					Number = round.Number,
					Tick = round.Tick,
					KillCount = round.Kills.Count(k => k.KillerSteamId == player.SteamId),
					AssistCount = round.Kills.Count(k => k.AssisterSteamId == player.SteamId),
					DeathCount = round.Kills.Count(k => k.KilledSteamId == player.SteamId),
					HeadshotCount = round.Kills.Count(k => k.KillerSteamId == player.SteamId && k.IsHeadshot),
					ShotCount = demo.WeaponFired.Where(w => w.RoundNumber == round.Number).Count(k => k.ShooterSteamId == player.SteamId),
					HitCount = round.PlayersHurted.Count(k => k.AttackerSteamId == player.SteamId),
					DamageHealthCount = round.PlayersHurted.Where(e => e.AttackerSteamId == player.SteamId).Sum(e => e.HealthDamage),
					DamageArmorCount = round.PlayersHurted.Where(e => e.AttackerSteamId == player.SteamId).Sum(e => e.ArmorDamage),
					JumpKillCount = round.Kills.Count(k => k.KillerSteamId == player.SteamId && k.KillerVelocityZ > 0),
					CrouchKillCount = round.Kills.Count(k => k.KillerSteamId == player.SteamId && k.IsKillerCrouching),
					OneKillCount = round.Kills.Count(k => k.KillerSteamId == player.SteamId) == 1 ? 1 : 0,
					TwoKillCount = round.Kills.Count(k => k.KillerSteamId == player.SteamId) == 2 ? 1 : 0,
					ThreeKillCount = round.Kills.Count(k => k.KillerSteamId == player.SteamId) == 3 ? 1 : 0,
					FourKillCount = round.Kills.Count(k => k.KillerSteamId == player.SteamId) == 4 ? 1 : 0,
					FiveKillCount = round.Kills.Count(k => k.KillerSteamId == player.SteamId) == 5 ? 1 : 0,
					TradeKillCount = round.Kills.Count(k => k.KillerSteamId == player.SteamId && k.IsTradeKill),
					TradeDeathCount = round.Kills.Count(k => k.KilledSteamId == player.SteamId && k.IsTradeKill),
					StartMoneyValue = player.StartMoneyRounds[round.Number],
					EquipementValue = player.EquipementValueRounds[round.Number],
					TeamKillCount = round.Kills.Count(k => k.KillerSteamId == player.SteamId && k.KillerSide == k.KilledSide),
					BombPlantedCount = round.BombPlanted != null && round.BombPlanted.PlanterSteamId == player.SteamId ? 1 : 0,
					BombDefusedCount = round.BombDefused != null && round.BombDefused.DefuserSteamId == player.SteamId ? 1 : 0,
					BombExplodedCount = round.BombExploded != null && round.BombExploded.PlanterSteamId == player.SteamId ? 1 : 0,
				};
				data.Add(stats);
			}

			return data;
		}

		public async Task<List<GenericDoubleChart>> GetEquipmentValueChartAsync(Demo demo, PlayerExtended player)
		{
			List<GenericDoubleChart> data  = new List<GenericDoubleChart>();

			await Task.Factory.StartNew(() =>
			{
				data.AddRange(demo.Rounds.Select(round => new GenericDoubleChart
				{
					Label = round.Number.ToString(),
					Value = player.EquipementValueRounds[round.Number]
				}));
			});

			return data;
		}

		public async Task<List<GenericDoubleChart>> GetCashEarnedChartAsync(Demo demo, PlayerExtended player)
		{
			List<GenericDoubleChart> data = new List<GenericDoubleChart>();

			await Task.Factory.StartNew(() =>
			{
				int total = 0;
				foreach (Round round in demo.Rounds)
				{
					total += player.RoundsMoneyEarned[round.Number];
					data.Add(new GenericDoubleChart
					{
						Label = round.Number.ToString(),
						Value = total
					});
				}
			});

			return data;
		}

		public async Task<List<GenericDoubleChart>> GetDamageHealthChartAsync(Demo demo, PlayerExtended player)
		{
			List<GenericDoubleChart> data = new List<GenericDoubleChart>();

			await Task.Factory.StartNew(() =>
			{
				foreach (Round round in demo.Rounds)
				{
					int total = demo.PlayersHurted.Where(
							e => e.RoundNumber == round.Number && e.AttackerSteamId == player.SteamId
						).Sum(e => e.HealthDamage);
					data.Add(new GenericDoubleChart
					{
						Label = round.Number.ToString(),
						Value = total
					});
				}
			});

			return data;
		}

		public async Task<List<GenericDoubleChart>> GetDamageArmorChartAsync(Demo demo, PlayerExtended player)
		{
			List<GenericDoubleChart> data = new List<GenericDoubleChart>();

			await Task.Factory.StartNew(() =>
			{
				foreach (Round round in demo.Rounds)
				{
					int total = demo.PlayersHurted.Where(
							e => e.RoundNumber == round.Number && e.AttackerSteamId == player.SteamId
						).Sum(e => e.ArmorDamage);
					data.Add(new GenericDoubleChart
					{
						Label = round.Number.ToString(),
						Value = total
					});
				}
			});

			return data;
		}

		public async Task<List<GenericDoubleChart>> GetTotalDamageHealthChartAsync(Demo demo, PlayerExtended player)
		{
			List<GenericDoubleChart> data = new List<GenericDoubleChart>();

			await Task.Factory.StartNew(() =>
			{
				int total = 0;
				foreach (Round round in demo.Rounds)
				{
					total += demo.PlayersHurted.Where(
							e => e.RoundNumber == round.Number && e.AttackerSteamId == player.SteamId
						).Sum(e => e.HealthDamage);
					data.Add(new GenericDoubleChart
					{
						Label = round.Number.ToString(),
						Value = total
					});
				}
			});

			return data;
		}

		public async Task<List<GenericDoubleChart>> GetTotalDamageArmorChartAsync(Demo demo, PlayerExtended player)
		{
			List<GenericDoubleChart> data = new List<GenericDoubleChart>();

			await Task.Factory.StartNew(() =>
			{
				int total = 0;
				foreach (Round round in demo.Rounds)
				{
					total += demo.PlayersHurted.Where(
							e => e.RoundNumber == round.Number && e.AttackerSteamId == player.SteamId
						).Sum(e => e.ArmorDamage);
					data.Add(new GenericDoubleChart
					{
						Label = round.Number.ToString(),
						Value = total
					});
				}
			});

			return data;
		}

		public async Task<List<GenericDoubleChart>> GetWeaponKillChartAsync(Demo demo, PlayerExtended player)
		{
			List<GenericDoubleChart> data = new List<GenericDoubleChart>();

			await Task.Factory.StartNew(() =>
			{
				foreach (KillEvent kill in demo.Kills)
				{
					if (kill.KillerSteamId == player.SteamId)
					{
						GenericDoubleChart weaponData = data.FirstOrDefault(d => d.Label == kill.Weapon.Name);
						if (weaponData != null)
						{
							weaponData.Value++;
						}
						else
						{
							data.Add(new GenericDoubleChart
							{
								Label = kill.Weapon.Name,
								Value = 1
							});
						}
					}
				}
			});

			return data;
		}
	}
}
