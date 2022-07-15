using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Models;
using NPOI.SS.UserModel;

namespace Services.Concrete.Excel.Sheets.Single
{
    public class EntryKillsPlayerSheet : AbstractSingleSheet
    {
        public EntryKillsPlayerSheet(IWorkbook workbook, Demo demo)
        {
            Headers = new Dictionary<string, CellType>()
            {
                { "Name", CellType.String },
                { "SteamID", CellType.String },
                { "Total", CellType.Numeric },
                { "Win", CellType.Numeric },
                { "Loss", CellType.Numeric },
                { "Rate", CellType.Numeric },
            };
            Demo = demo;
            Sheet = workbook.CreateSheet("Entry Kills Players");
        }

        protected override async Task GenerateContent()
        {
            await Task.Factory.StartNew(() =>
            {
                int rowNumber = 1;

                foreach (Player player in Demo.Players)
                {
                    IRow row = Sheet.CreateRow(rowNumber);
                    int columnNumber = 0;
                    SetCellValue(row, columnNumber++, CellType.String, player.Name);
                    SetCellValue(row, columnNumber++, CellType.String, player.SteamId.ToString());
                    SetCellValue(row, columnNumber++, CellType.Numeric, player.EntryKills.Count);
                    SetCellValue(row, columnNumber++, CellType.Numeric, player.EntryKillWonCount);
                    SetCellValue(row, columnNumber++, CellType.Numeric, player.EntryKillLossCount);
                    SetCellValue(row, columnNumber, CellType.Numeric, player.RatioEntryKill);

                    rowNumber++;
                }
            });
        }
    }
}
