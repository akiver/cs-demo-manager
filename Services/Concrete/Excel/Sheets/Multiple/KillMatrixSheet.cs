using System.Collections.Generic;
using System.Linq;
using Core.Models;

namespace Services.Concrete.Excel.Sheets.Multiple
{
    internal class PlayerKillEntry
    {
        public long SteamId { get; set; }
        public string Name { get; set; }

        public Dictionary<long, int> Kills { get; set; }
    }

    internal class KillMatrixSheet: MultipleDemoSheet
    {
        private readonly List<PlayerKillEntry> _playerEntries = new List<PlayerKillEntry>();
        private Dictionary<long, string> _playerNamePerSteamId = new Dictionary<long, string>();

        protected override string GetName()
        {
            return "Kill matrix";
        }

        protected override string[] GetColumnNames()
        {
            return new string[]{};
        }

        public KillMatrixSheet(Workbook workbook): base(workbook)
        {
        }

        public override void AddDemo(Demo demo)
        {
            foreach (var player in demo.Players)
            {
                if (IsMaxPlayerLimitReached())
                {
                    break;
                }

                if (player.IsBot || _playerNamePerSteamId.ContainsKey(player.SteamId))
                {
                    continue;
                }

                _playerNamePerSteamId.Add(player.SteamId, player.Name);
            }

            foreach (var kill in demo.Kills)
            {
                if (kill.IsKillerBot || kill.IsVictimBot || !_playerNamePerSteamId.ContainsKey(kill.KillerSteamId))
                {
                    continue;
                }

                var killerEntry = _playerEntries.Find(entry => entry.SteamId == kill.KillerSteamId);
                if (killerEntry == null)
                {
                    killerEntry = new PlayerKillEntry
                    {
                        SteamId = kill.KillerSteamId,
                        Name = _playerNamePerSteamId[kill.KillerSteamId],
                        Kills = new Dictionary<long, int>(),
                    };
                    _playerEntries.Add(killerEntry);
                }

                if (killerEntry.Kills.ContainsKey(kill.KilledSteamId))
                {
                    killerEntry.Kills[kill.KilledSteamId]++;
                }
                else
                {
                    killerEntry.Kills.Add(kill.KilledSteamId, 1);
                }
            }
        }

        public override void Generate()
        {
            _playerNamePerSteamId = _playerNamePerSteamId.OrderBy(k => k.Value).ToDictionary(x => x.Key, x => x.Value);

            var firstRowCells = new List<object> { "Killer\\Victim" };
            foreach (var player in _playerNamePerSteamId)
            {
                firstRowCells.Add(player.Value);
            }
            WriteRow(firstRowCells);

            foreach (var killer in _playerNamePerSteamId)
            {
                var cells = new List<object> { killer.Value };
                foreach (var victim in _playerNamePerSteamId)
                {
                    var playerEntry = _playerEntries.Find(p => p.SteamId == killer.Key);
                    var killCount = 0;
                    if (playerEntry != null && playerEntry.Kills.ContainsKey(victim.Key))
                    {
                        killCount = playerEntry.Kills[victim.Key];
                    }
                    cells.Add(killCount);
                }

                WriteRow(cells);
            }
        }

        private bool IsMaxPlayerLimitReached()
        {
            return _playerNamePerSteamId.Count >= 256;
        }
    }
}
