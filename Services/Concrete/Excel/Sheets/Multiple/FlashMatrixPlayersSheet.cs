using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Core.Models;
using Core.Models.Events;
using NPOI.SS.UserModel;

namespace Services.Concrete.Excel.Sheets.Multiple
{
    internal class PlayerFlashEntry
    {
        public long SteamId { get; set; }
        public string Name { get; set; }

        public Dictionary<long, float> Durations { get; set; }
    }

    public class FlashMatrixPlayersSheet : AbstractMultipleSheet
    {
        private readonly List<PlayerFlashEntry> _playerEntries = new List<PlayerFlashEntry>();
        private Dictionary<long, string> _playerNamePerSteamId = new Dictionary<long, string>();

        public FlashMatrixPlayersSheet(IWorkbook workbook, List<Demo> demos)
        {
            Headers = new Dictionary<string, CellType> { { string.Empty, CellType.String } };
            Demos = demos;
            Sheet = workbook.CreateSheet("Flash matrix players");
        }

        public override Task GenerateContent()
        {
            ComputePlayerNamePerSteamId();
            InitializePlayerEntries();
            PopulatePlayerEntries();
            GenerateSheet();

            return Task.CompletedTask;
        }

        private void ComputePlayerNamePerSteamId()
        {
            foreach (Demo demo in Demos)
            {
                foreach (Player player in demo.Players)
                {
                    if (player.IsBot || _playerNamePerSteamId.ContainsKey(player.SteamId))
                    {
                        continue;
                    }

                    _playerNamePerSteamId.Add(player.SteamId, player.Name);

                    if (IsMaxPlayerLimitReached())
                    {
                        break;
                    }
                }

                if (IsMaxPlayerLimitReached())
                {
                    break;
                }
            }

            _playerNamePerSteamId = _playerNamePerSteamId.OrderBy(k => k.Value).ToDictionary(x => x.Key, x => x.Value);
        }

        private void InitializePlayerEntries()
        {
            foreach (var playerName in _playerNamePerSteamId)
            {
                var durations = new Dictionary<long, float>();
                foreach (var sortedPlayerName in _playerNamePerSteamId)
                {
                    durations.Add(sortedPlayerName.Key, 0);
                }

                _playerEntries.Add(new PlayerFlashEntry()
                {
                    SteamId = playerName.Key,
                    Name = playerName.Value,
                    Durations = durations,
                });
            }
        }

        private void PopulatePlayerEntries()
        {
            foreach (Demo demo in Demos)
            {
                foreach (PlayerBlindedEvent blindEvent in demo.PlayerBlinded)
                {
                    if (blindEvent.IsThrowerBot || blindEvent.IsVictimBot)
                    {
                        continue;
                    }

                    var throwerEntry = _playerEntries.Find(entry => entry.SteamId == blindEvent.ThrowerSteamId);
                    if (throwerEntry == null)
                    {
                        continue;
                    }

                    var victimEntry = _playerEntries.Find(entry => entry.SteamId == blindEvent.VictimSteamId);
                    if (victimEntry == null)
                    {
                        continue;
                    }

                    throwerEntry.Durations[victimEntry.SteamId] += blindEvent.Duration;
                }
            }
        }

        private void GenerateSheet()
        {
            IRow firstRow = Sheet.CreateRow(0);
            SetCellValue(firstRow, 0, CellType.String, "Flasher\\Flashed");

            for (int playerIndex = 0; playerIndex < _playerEntries.Count; playerIndex++)
            {
                var playerEntry = _playerEntries[playerIndex];
                SetCellValue(firstRow, playerIndex + 1, CellType.String, playerEntry.Name);

                IRow row = Sheet.CreateRow(playerIndex + 1);
                SetCellValue(row, 0, CellType.String, playerEntry.Name);

                for (int durationIndex = 0; durationIndex < playerEntry.Durations.Count; durationIndex++)
                {
                    var duration = playerEntry.Durations.ElementAt(durationIndex);
                    SetCellValue(row, durationIndex + 1, CellType.Numeric, Math.Round(duration.Value, 2));
                }
            }
        }

        private bool IsMaxPlayerLimitReached()
        {
            return _playerNamePerSteamId.Count >= 256;
        }
    }
}
