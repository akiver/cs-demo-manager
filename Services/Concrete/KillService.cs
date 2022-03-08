using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Core.Models;
using Core.Models.Events;
using Services.Interfaces;
using Services.Models.Stats;

namespace Services.Concrete
{
    public class KillService : IKillService
    {
        public Demo Demo { get; set; }

        public async Task<List<KillDataPoint>> GetPlayersKillsMatrix()
        {
            List<KillDataPoint> data = new List<KillDataPoint>();
            await Task.Factory.StartNew(() =>
            {
                foreach (Player player in Demo.Players)
                {
                    Dictionary<long, int> playerKillStats = new Dictionary<long, int>();

                    foreach (Player pl in Demo.Players)
                    {
                        if (!playerKillStats.ContainsKey(pl.SteamId))
                        {
                            playerKillStats.Add(pl.SteamId, 0);
                        }
                    }

                    foreach (KillEvent e in Demo.Kills)
                    {
                        if (player.SteamId == e.KillerSteamId && e.KilledSteamId != 0)
                        {
                            if (!playerKillStats.ContainsKey(e.KilledSteamId))
                            {
                                playerKillStats.Add(e.KilledSteamId, 0);
                            }

                            playerKillStats[e.KilledSteamId]++;
                        }
                    }

                    data.AddRange(playerKillStats.Select(playerStats => new KillDataPoint
                    {
                        Killer = player.Name,
                        Victim = Demo.Players.First(p => p.SteamId == playerStats.Key).Name,
                        Count = playerStats.Value,
                    }));
                }
            });

            return data;
        }
    }
}
