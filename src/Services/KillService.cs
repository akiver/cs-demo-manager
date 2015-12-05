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
					Dictionary<PlayerExtended, int> playerKillStats = new Dictionary<PlayerExtended, int>();

					foreach (PlayerExtended pl in Demo.Players)
					{
						if (!playerKillStats.ContainsKey(pl))
							playerKillStats.Add(pl, 0);
					}

					foreach (KillEvent e in Demo.Kills)
					{
						if (player.Equals(e.Killer))
						{
							playerKillStats[e.DeathPerson]++;
						}
					}

					data.AddRange(playerKillStats.Select(playerStats => new KillDataPoint
					{
						Killer = player.Name,
						Victim = playerStats.Key.Name,
						Count = playerStats.Value
					}));
				}
			});

			return data;
		}
	}
}
