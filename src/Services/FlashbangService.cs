using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CSGO_Demos_Manager.Models;
using CSGO_Demos_Manager.Models.Events;
using CSGO_Demos_Manager.Models.Stats;

namespace CSGO_Demos_Manager.Services
{
	public class FlashbangService : IFlashbangService
	{
		public Demo Demo { get; set; }

		/// <summary>
		/// Generate data for the heatmap that display flash times for each player
		/// </summary>
		/// <returns></returns>
		public async Task<List<FlashbangDataPoint>> GetPlayersFlashTimesData()
		{
			List<FlashbangDataPoint> data = new List<FlashbangDataPoint>();
			await Task.Factory.StartNew(() =>
			{
				foreach (PlayerExtended player in Demo.Players)
				{
					Dictionary<PlayerExtended, float> playerFlashStats = new Dictionary<PlayerExtended, float>();

					foreach (PlayerBlindedEvent e in Demo.PlayerBlindedEvents)
					{
						if (player.Equals(e.Thrower))
						{
							if (!playerFlashStats.ContainsKey(e.Victim))
								playerFlashStats.Add(e.Victim, 0);
							playerFlashStats[e.Victim] += e.Duration;
						}
					}

					data.AddRange(playerFlashStats.Select(playerStats => new FlashbangDataPoint
					{
						Flasher = player.Name,
						Flashed = playerStats.Key.Name,
						Duration = Math.Round((decimal)playerStats.Value, 2, MidpointRounding.AwayFromZero)
					}));
				}
			});

			return data;
		}

		/// <summary>
		/// Generate data for the heatmap that display flash times by team
		/// </summary>
		/// <returns></returns>
		public async Task<List<FlashbangDataPoint>> GetTeamsFlashTimesData()
		{
			List<FlashbangDataPoint> data = new List<FlashbangDataPoint>();

			await Task.Factory.StartNew(() =>
			{
				Dictionary<TeamExtended, float> teamCtStats = new Dictionary<TeamExtended, float>();
				Dictionary<TeamExtended, float> teamTStats = new Dictionary<TeamExtended, float>();

				foreach (PlayerBlindedEvent e in Demo.PlayerBlindedEvents)
				{
					if (e.Thrower.Team.Equals(Demo.TeamCT))
					{
						if (!teamCtStats.ContainsKey(e.Victim.Team))
							teamCtStats.Add(e.Victim.Team, 0);
						teamCtStats[e.Victim.Team] += e.Duration;
					}
					else
					{
						if (!teamTStats.ContainsKey(e.Victim.Team))
							teamTStats.Add(e.Victim.Team, 0);
						teamTStats[e.Victim.Team] += e.Duration;
					}
				}

				data.AddRange(teamCtStats.Select(ctStats => new FlashbangDataPoint
				{
					Flasher = Demo.TeamCT.Name,
					Flashed = ctStats.Key.Name,
					Duration = Math.Round((decimal)ctStats.Value, 2, MidpointRounding.AwayFromZero)
				}));

				data.AddRange(teamTStats.Select(tStats => new FlashbangDataPoint
				{
					Flasher = Demo.TeamT.Name,
					Flashed = tStats.Key.Name,
					Duration = Math.Round((decimal)tStats.Value, 2, MidpointRounding.AwayFromZero)
				}));
			});

			return data;
		}

		/// <summary>
		/// Generate data for the heatmap that display average flash times for each player
		/// </summary>
		/// <returns></returns>
		public async Task<List<FlashbangDataPoint>> GetAverageFlashTimesPlayersData()
		{
			List<FlashbangDataPoint> data = new List<FlashbangDataPoint>();

			await Task.Factory.StartNew(() =>
			{
				Dictionary<PlayerExtended, float> playerFlashStats = new Dictionary<PlayerExtended, float>();

				foreach (PlayerExtended player in Demo.Players)
				{
					float totalDuration = Demo.PlayerBlindedEvents
						.Where(e => e.Thrower.Equals(player))
						.Sum(e => e.Duration);

					if (!playerFlashStats.ContainsKey(player))
						playerFlashStats.Add(player, 0);
					playerFlashStats[player] = totalDuration;
				}

				data.AddRange(from playersValue in playerFlashStats
					let total = playersValue.Key.FlashbangThrowedCount > 0
					? Math.Round((decimal)(playersValue.Value/playersValue.Key.FlashbangThrowedCount),
					2, MidpointRounding.AwayFromZero)
					: 0
					select new FlashbangDataPoint
					{
						Flasher = playersValue.Key.Name,
						Flashed = "fakeplayer",
						Duration = total
					});
			});

			return data;
		}
	}
}
