using System;
using System.Collections.Generic;
using System.Linq;
using Core.Models;

namespace Services.Concrete.Excel.Sheets.Single
{
    internal class FlashbangMatrixEntry
    {
        public long SteamId { get; set; }
        public string Name { get; set; }

        public Dictionary<long, float> Durations { get; set; }
    }

    internal class FlashMatrixPlayersSheet: SingleDemoSheet
    {
        private readonly List<FlashbangMatrixEntry> _playerEntries = new List<FlashbangMatrixEntry>();
        private Dictionary<long, string> _playerNamePerSteamId = new Dictionary<long, string>();

        public FlashMatrixPlayersSheet(Workbook workbook, Demo demo): base(workbook, demo)
        {
        }

        protected override string GetName()
        {
            return "Flash matrix players";
        }

        protected override string[] GetColumnNames()
        {
            return new string[]{};
        }

        public override void Generate()
        {
            foreach (var player in Demo.Players)
            {
                if (player.IsBot || _playerNamePerSteamId.ContainsKey(player.SteamId))
                {
                    continue;
                }

                _playerNamePerSteamId.Add(player.SteamId, player.Name);
            }

            foreach (var blind in Demo.PlayerBlinded)
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
    }
}
