using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Core.Models;
using NPOI.SS.UserModel;

namespace Services.Concrete.Excel.Sheets.Single
{
    public class KillMatrixSheet : AbstractSingleSheet
    {
        public KillMatrixSheet(IWorkbook workbook, Demo demo)
        {
            Headers = new Dictionary<string, CellType> { { string.Empty, CellType.String } };
            Demo = demo;
            Sheet = workbook.CreateSheet("Kill matrix");
        }

        public override async Task GenerateContent()
        {
            await Task.Run(() =>
            {
                // store players row and columns index
                Dictionary<long, int> playersRow = new Dictionary<long, int>();
                Dictionary<long, int> playersColumn = new Dictionary<long, int>();

                // first row containing victims name
                IRow firstRow = Sheet.CreateRow(0);
                SetCellValue(firstRow, 0, CellType.String, "Killer\\Victim");

                // concat teams players to have a more logic matrix pattern
                List<Player> players = new List<Player>(Demo.TeamCT.Players).Concat(Demo.TeamT.Players).ToList();

                int columnCount = 1;
                int rowCount = 1;
                // create rows and columns with only players name
                foreach (Player player in players)
                {
                    // add a column for this player in the first row
                    SetCellValue(firstRow, columnCount, CellType.String, player.Name);
                    playersRow.Add(player.SteamId, rowCount);
                    // create a row for this player
                    IRow row = Sheet.CreateRow(rowCount++);
                    SetCellValue(row, 0, CellType.String, player.Name);
                    playersColumn.Add(player.SteamId, columnCount++);
                }

                // insert kills value
                foreach (Player player in players)
                {
                    if (playersRow.ContainsKey(player.SteamId))
                    {
                        int rowIndex = playersRow[player.SteamId];
                        foreach (Player pl in Demo.Players)
                        {
                            if (playersColumn.ContainsKey(pl.SteamId))
                            {
                                int columnIndex = playersColumn[pl.SteamId];
                                int killCount = Demo.Kills.Count(e => e.KillerSteamId == player.SteamId && e.KilledSteamId == pl.SteamId);
                                IRow row = Sheet.GetRow(rowIndex);
                                SetCellValue(row, columnIndex, CellType.Numeric, killCount);
                            }
                        }
                    }
                }
            });
        }
    }
}
