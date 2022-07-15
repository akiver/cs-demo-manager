using System;
using System.Collections.Generic;
using System.Linq;
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

        public FlashMatrixPlayersSheet(IWorkbook workbook)
        {
            Headers = new Dictionary<string, CellType> { { string.Empty, CellType.String } };
            Sheet = workbook.CreateSheet("Flash matrix players");
        }

        public override void AddDemo(Demo demo)
        {
            foreach (Player player in demo.Players)
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


            foreach (PlayerBlindedEvent blindEvent in demo.PlayerBlinded)
            {
                if (blindEvent.IsThrowerBot || blindEvent.IsVictimBot || !_playerNamePerSteamId.ContainsKey(blindEvent.ThrowerSteamId))
                {
                    continue;
                }

                PlayerFlashEntry throwerEntry = _playerEntries.Find(entry => entry.SteamId == blindEvent.ThrowerSteamId);
                if (throwerEntry == null)
                {
                    throwerEntry = new PlayerFlashEntry
                    {
                        SteamId = blindEvent.ThrowerSteamId,
                        Name = _playerNamePerSteamId[blindEvent.ThrowerSteamId],
                        Durations = new Dictionary<long, float>(),
                    };
                    _playerEntries.Add(throwerEntry);
                }

                if (throwerEntry.Durations.ContainsKey(blindEvent.VictimSteamId))
                {
                    throwerEntry.Durations[blindEvent.VictimSteamId] += blindEvent.Duration;
                }
                else
                {
                    throwerEntry.Durations.Add(blindEvent.VictimSteamId, blindEvent.Duration);
                }
            }
        }

        protected override void GenerateContent()
        {
            _playerNamePerSteamId = _playerNamePerSteamId.OrderBy(k => k.Value).ToDictionary(x => x.Key, x => x.Value);

            IRow firstRow = Sheet.CreateRow(0);
            SetCellValue(firstRow, 0, CellType.String, "Flasher\\Flashed");

            int rowNumber = 1;
            int firstRowColumnNumber = 1;
            foreach (KeyValuePair<long, string> player in _playerNamePerSteamId)
            {
                string playerName = player.Value;
                SetCellValue(firstRow, firstRowColumnNumber++, CellType.String, playerName);

                IRow row = Sheet.CreateRow(rowNumber++);
                SetCellValue(row, 0, CellType.String, playerName);

                int columnNumber = 1;
                foreach (KeyValuePair<long, string> namePerSteamId in _playerNamePerSteamId)
                {
                    double duration = 0;
                    PlayerFlashEntry playerEntry = _playerEntries.Find(p => p.SteamId == player.Key);
                    if (playerEntry != null && playerEntry.Durations.ContainsKey(namePerSteamId.Key))
                    {
                        duration = Math.Round(playerEntry.Durations[namePerSteamId.Key], 2);
                    }
                    SetCellValue(row, columnNumber++, CellType.Numeric, duration);
                }
            }
        }

        private bool IsMaxPlayerLimitReached()
        {
            return _playerNamePerSteamId.Count >= 256;
        }
    }
}
