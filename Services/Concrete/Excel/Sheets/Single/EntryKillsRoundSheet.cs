using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Models;
using NPOI.SS.UserModel;

namespace Services.Concrete.Excel.Sheets.Single
{
    public class EntryKillsRoundSheet : AbstractSingleSheet
    {
        public EntryKillsRoundSheet(IWorkbook workbook, Demo demo)
        {
            Headers = new Dictionary<string, CellType>()
            {
                { "Number", CellType.Numeric },
                { "Killer Name", CellType.String },
                { "Killer SteamID", CellType.String },
                { "Victim Name", CellType.String },
                { "Victim SteamID", CellType.String },
                { "Weapon", CellType.String },
                { "Round Won", CellType.String },
            };
            Demo = demo;
            Sheet = workbook.CreateSheet("Entry Kills Rounds");
        }

        protected override async Task GenerateContent()
        {
            await Task.Factory.StartNew(() =>
            {
                int rowNumber = 1;

                foreach (Round round in Demo.Rounds)
                {
                    IRow row = Sheet.CreateRow(rowNumber);
                    int columnNumber = 0;
                    SetCellValue(row, columnNumber++, CellType.Numeric, round.Number);
                    if (round.EntryKillEvent != null)
                    {
                        SetCellValue(row, columnNumber++, CellType.String, round.EntryKillEvent.KillerName);
                        SetCellValue(row, columnNumber++, CellType.String, round.EntryKillEvent.KillerSteamId.ToString());
                        SetCellValue(row, columnNumber++, CellType.String, round.EntryKillEvent.KilledName);
                        SetCellValue(row, columnNumber++, CellType.String, round.EntryKillEvent.KilledSteamId.ToString());
                        SetCellValue(row, columnNumber++, CellType.String, round.EntryKillEvent.Weapon.Name);
                        SetCellValue(row, columnNumber, CellType.String, round.EntryKillEvent.HasWonRound ? "yes" : "no");
                    }

                    rowNumber++;
                }
            });
        }
    }
}
