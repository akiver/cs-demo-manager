using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CSGO_Demos_Manager.Models;
using CSGO_Demos_Manager.Models.Events;
using CSGO_Demos_Manager.Models.Stats;
using CSGO_Demos_Manager.Services.Interfaces;

namespace CSGO_Demos_Manager.Services.Stats
{
	public class PlayerService : IPlayerService
	{
		public async Task<List<PlayerRoundStats>> GetRoundStats(Demo demo, Round round)
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
	}
}
