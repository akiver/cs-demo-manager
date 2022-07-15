using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Core.Models;
using NPOI.SS.UserModel;

namespace Services.Concrete.Excel.Sheets.Single
{
    public class FlashMatrixPlayersSheet : AbstractSingleSheet
    {
        public FlashMatrixPlayersSheet(IWorkbook workbook, Demo demo)
        {
            Headers = new Dictionary<string, CellType> { { string.Empty, CellType.String } };
            Demo = demo;
            Sheet = workbook.CreateSheet("Flash matrix players");
        }

        protected override async Task GenerateContent()
        {
            CacheService cacheService = new CacheService();
            Demo.PlayerBlinded = await cacheService.GetDemoPlayerBlindedAsync(Demo);

            // store players row and columns index
            Dictionary<long, int> playersRow = new Dictionary<long, int>();
            Dictionary<long, int> playersColumn = new Dictionary<long, int>();

            // first row containing players name
            IRow firstRow = Sheet.CreateRow(0);
            SetCellValue(firstRow, 0, CellType.String, "Flasher\\Flashed");

            // current row
            IRow row;

            int columnCount = 1;
            int rowCount = 1;
            // create rows and columns with only players name
            foreach (Player player in Demo.Players)
            {
                // add a column for this player in the first row
                SetCellValue(firstRow, columnCount, CellType.String, player.Name);
                playersRow.Add(player.SteamId, rowCount);
                // create a row for this player
                row = Sheet.CreateRow(rowCount++);
                SetCellValue(row, 0, CellType.String, player.Name);
                playersColumn.Add(player.SteamId, columnCount++);
            }

            foreach (Player player in Demo.Players)
            {
                if (playersRow.ContainsKey(player.SteamId))
                {
                    int rowIndex = playersRow[player.SteamId];
                    foreach (Player pl in Demo.Players)
                    {
                        if (playersColumn.ContainsKey(pl.SteamId))
                        {
                            int columnIndex = playersColumn[pl.SteamId];
                            float duration = Demo.PlayerBlinded.Where(e => e.ThrowerSteamId == player.SteamId && e.VictimSteamId == pl.SteamId)
                                .Sum(e => e.Duration);
                            row = Sheet.GetRow(rowIndex);
                            SetCellValue(row, columnIndex, CellType.Numeric, Math.Round(duration, 2));
                        }
                    }
                }
            }
        }
    }
}
