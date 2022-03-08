using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Core.Models;
using NPOI.SS.UserModel;

namespace Services.Concrete.Excel.Sheets.Multiple
{
    public class FlashMatrixPlayersSheet : AbstractMultipleSheet
    {
        public FlashMatrixPlayersSheet(IWorkbook workbook, List<Demo> demos)
        {
            Headers = new Dictionary<string, CellType> { { string.Empty, CellType.String } };
            Demos = demos;
            Sheet = workbook.CreateSheet("Flash matrix players");
        }

        public override async Task GenerateContent()
        {
            // store players row and columns index
            Dictionary<long, int> playersRow = new Dictionary<long, int>();
            Dictionary<long, int> playersColumn = new Dictionary<long, int>();

            // first row containing victims name
            IRow firstRow = Sheet.CreateRow(0);
            SetCellValue(firstRow, 0, CellType.String, "Flasher\\Flashed");

            int columnCount = 1;
            int rowCount = 1;

            // current row
            IRow row;
            foreach (Demo demo in Demos)
            {
                CacheService cacheService = new CacheService();
                demo.PlayerBlinded = await cacheService.GetDemoPlayerBlindedAsync(demo);

                // create rows and columns with only players name
                foreach (Player player in demo.Players)
                {
                    if (!playersRow.ContainsKey(player.SteamId))
                    {
                        // add a column for this player in the first row
                        SetCellValue(firstRow, columnCount, CellType.String, player.Name);
                        playersRow.Add(player.SteamId, rowCount);
                        // create a row for this player
                        row = Sheet.CreateRow(rowCount++);
                        SetCellValue(row, 0, CellType.String, player.Name);
                        playersColumn.Add(player.SteamId, columnCount++);
                    }
                }

                foreach (Player player in demo.Players)
                {
                    if (playersRow.ContainsKey(player.SteamId))
                    {
                        int rowIndex = playersRow[player.SteamId];
                        foreach (Player pl in demo.Players)
                        {
                            if (playersColumn.ContainsKey(pl.SteamId))
                            {
                                int columnIndex = playersColumn[pl.SteamId];
                                float duration = demo.PlayerBlinded.Where(e => e.ThrowerSteamId == player.SteamId && e.VictimSteamId == pl.SteamId)
                                    .Sum(e => e.Duration);
                                row = Sheet.GetRow(rowIndex);
                                ICell cell = row.GetCell(columnIndex);
                                if (cell == null)
                                {
                                    SetCellValue(row, columnIndex, CellType.Numeric, Math.Round(duration, 2));
                                }
                                else
                                {
                                    cell.SetCellValue(cell.NumericCellValue + Math.Round(duration, 2));
                                }
                            }
                        }
                    }
                }

                FillEmptyCells(rowCount, columnCount);
                demo.PlayerBlinded.Clear();
            }
        }
    }
}
