using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Core.Models;
using Core.Models.Events;
using NPOI.SS.UserModel;
using static System.String;
using CellType = NPOI.SS.UserModel.CellType;

namespace Services.Concrete.Excel.Sheets.Multiple
{
    internal class PlayerKillEntry
    {
        public long SteamId { get; set; }
        public string Name { get; set; }

        public Dictionary<long, int> Kills { get; set; }
    }

    public class KillMatrixSheet : AbstractMultipleSheet
    {
        private readonly List<PlayerKillEntry> _playerEntries = new List<PlayerKillEntry>();
        private Dictionary<long, string> _playerNamePerSteamId = new Dictionary<long, string>();

        public KillMatrixSheet(IWorkbook workbook)
        {
            Headers = new Dictionary<string, CellType> { { Empty, CellType.String } };
            Sheet = workbook.CreateSheet("Kill matrix");
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

            foreach (KillEvent kill in demo.Kills)
            {
                if (kill.IsKillerBot || kill.IsVictimBot || !_playerNamePerSteamId.ContainsKey(kill.KillerSteamId))
                {
                    continue;
                }

                PlayerKillEntry killerEntry = _playerEntries.Find(entry => entry.SteamId == kill.KillerSteamId);
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

        protected override Task GenerateContent()
        {
            _playerNamePerSteamId = _playerNamePerSteamId.OrderBy(k => k.Value).ToDictionary(x => x.Key, x => x.Value);

            IRow firstRow = Sheet.CreateRow(0);
            SetCellValue(firstRow, 0, CellType.String, "Killer\\Victim");

            int rowNumber = 1;
            int firstRowColumnNumber = 1;
            foreach (KeyValuePair<long, string> player in _playerNamePerSteamId)
            {
                string playerName = player.Value;
                SetCellValue(firstRow, firstRowColumnNumber++, CellType.String, playerName);

                IRow row = Sheet.CreateRow(rowNumber++);
                SetCellValue(row, 0, CellType.String, playerName);

                int killColumnNumber = 1;
                foreach (KeyValuePair<long, string> namePerSteamId in _playerNamePerSteamId)
                {
                    PlayerKillEntry playerEntry = _playerEntries.Find(p => p.SteamId == player.Key);
                    int killCount = 0;
                    if (playerEntry != null && playerEntry.Kills.ContainsKey(namePerSteamId.Key))
                    {
                        killCount = playerEntry.Kills[namePerSteamId.Key];
                    }
                    SetCellValue(row, killColumnNumber++, CellType.Numeric, killCount);
                }
            }

            return Task.CompletedTask;
        }

        private bool IsMaxPlayerLimitReached()
        {
            return _playerNamePerSteamId.Count >= 256;
        }
    }
}
