using System;
using System.Collections.Generic;
using System.Linq;
using Core.Models;
using Services.Concrete.Excel.Sheets.Single;

namespace Services.Concrete.Excel.Sheets.Multiple
{
    internal class FlashMatrixPlayersSheet: MultipleDemoSheet
    {
        private readonly List<FlashbangMatrixEntry> _playerEntries = new List<FlashbangMatrixEntry>();
        private Dictionary<long, string> _playerNamePerSteamId = new Dictionary<long, string>();

        protected override string GetName()
        {
            return "Flash matrix players";
        }

        protected override string[] GetColumnNames()
        {
            return new string[]{};
        }

        public FlashMatrixPlayersSheet(Workbook workbook): base(workbook)
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

            foreach (var blind in demo.PlayerBlinded)
            {
                if (blind.IsThrowerBot || blind.IsVictimBot || !_playerNamePerSteamId.ContainsKey(blind.ThrowerSteamId))
                {
                    continue;
                }

                var entry = _playerEntries.Find(player => player.SteamId == blind.ThrowerSteamId);
                if (entry == null)
                {
                    entry = new FlashbangMatrixEntry
                    {
                        SteamId = blind.ThrowerSteamId,
                        Name = _playerNamePerSteamId[blind.ThrowerSteamId],
                        Durations = new Dictionary<long, float>(),
                    };
                    _playerEntries.Add(entry);
                }

                if (entry.Durations.ContainsKey(blind.VictimSteamId))
                {
                    entry.Durations[blind.VictimSteamId] += blind.Duration;
                }
                else
                {
                    entry.Durations.Add(blind.VictimSteamId, blind.Duration);
                }
            }
        }

        public override void Generate()
        {
            _playerNamePerSteamId = _playerNamePerSteamId.OrderBy(k => k.Value).ToDictionary(x => x.Key, x => x.Value);

            var firstRowCells = new List<object> { "Flasher\\Flashed" };
            foreach (var player in _playerNamePerSteamId)
            {
                firstRowCells.Add(player.Value);
            }
            WriteRow(firstRowCells);

            foreach (var flasher in _playerNamePerSteamId)
            {
                var cells = new List<object> { flasher.Value };
                foreach (var flashed in _playerNamePerSteamId)
                {
                    var playerEntry = _playerEntries.Find(p => p.SteamId == flasher.Key);
                    var duration = 0d;
                    if (playerEntry != null && playerEntry.Durations.ContainsKey(flashed.Key))
                    {
                        duration = Math.Round(playerEntry.Durations[flashed.Key], 2);
                    }
                    cells.Add(duration);
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
