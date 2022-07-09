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

        public KillMatrixSheet(IWorkbook workbook, List<Demo> demos)
        {
            Headers = new Dictionary<string, CellType> { { Empty, CellType.String } };
            Demos = demos;
            Sheet = workbook.CreateSheet("Kill matrix");
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
                var kills = new Dictionary<long, int>();
                foreach (var sortedPlayerName in _playerNamePerSteamId)
                {
                    kills.Add(sortedPlayerName.Key, 0);
                }

                _playerEntries.Add(new PlayerKillEntry
                {
                    SteamId = playerName.Key,
                    Name = playerName.Value,
                    Kills = kills,
                });
            }
        }

        private void PopulatePlayerEntries()
        {
            foreach (Demo demo in Demos)
            {
                foreach (KillEvent kill in demo.Kills)
                {
                    if (kill.IsKillerBot || kill.IsVictimBot)
                    {
                        continue;
                    }

                    PlayerKillEntry killerEntry = _playerEntries.Find(entry => entry.SteamId == kill.KillerSteamId);
                    if (killerEntry == null)
                    {
                        continue;
                    }

                    PlayerKillEntry victimEntry = _playerEntries.Find(entry => entry.SteamId == kill.KilledSteamId);
                    if (victimEntry == null)
                    {
                        continue;
                    }

                    killerEntry.Kills[victimEntry.SteamId]++;
                }
            }
        }

        private void GenerateSheet()
        {
            IRow firstRow = Sheet.CreateRow(0);
            SetCellValue(firstRow, 0, CellType.String, "Killer\\Victim");

            for (int playerIndex = 0; playerIndex < _playerEntries.Count; playerIndex++)
            {
                PlayerKillEntry playerEntry = _playerEntries[playerIndex];
                SetCellValue(firstRow, playerIndex + 1, CellType.String, playerEntry.Name);

                IRow row = Sheet.CreateRow(playerIndex + 1);
                SetCellValue(row, 0, CellType.String, playerEntry.Name);

                for (int killIndex = 0; killIndex < playerEntry.Kills.Count; killIndex++)
                {
                    var killEntry = playerEntry.Kills.ElementAt(killIndex);
                    SetCellValue(row, killIndex + 1, CellType.Numeric, killEntry.Value);
                }
            }
        }

        private bool IsMaxPlayerLimitReached()
        {
            return _playerNamePerSteamId.Count >= 256;
        }
    }
}
