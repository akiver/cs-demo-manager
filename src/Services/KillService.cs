using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CSGO_Demos_Manager.Models;
using CSGO_Demos_Manager.Models.Events;
using CSGO_Demos_Manager.Models.Stats;
using CSGO_Demos_Manager.Services.Interfaces;

namespace CSGO_Demos_Manager.Services
{
	public class KillService : IKillService
	{
		public Demo Demo { get; set; }

		public async Task<List<KillDataPoint>> GetPlayersKillsMatrix()
		{
			List<KillDataPoint> data = new List<KillDataPoint>();
			await Task.Factory.StartNew(() =>
			{
				foreach (PlayerExtended player in Demo.Players)
				{
					Dictionary<long, int> playerKillStats = new Dictionary<long, int>();

					foreach (PlayerExtended pl in Demo.Players)
					{
						if (!playerKillStats.ContainsKey(pl.SteamId))
							playerKillStats.Add(pl.SteamId, 0);
					}

					foreach (KillEvent e in Demo.Kills)
					{
						if (player.SteamId == e.KillerSteamId)
						{
							if (!playerKillStats.ContainsKey(e.KilledSteamId))
								playerKillStats.Add(e.KilledSteamId, 0);
							playerKillStats[e.KilledSteamId]++;
						}
					}

					data.AddRange(playerKillStats.Select(playerStats => new KillDataPoint
					{
						Killer = player.Name,
						Victim = Demo.Players.First(p => p.SteamId == playerStats.Key).Name,
						Count = playerStats.Value
					}));
				}
			});

			return data;
		}
	}
}
