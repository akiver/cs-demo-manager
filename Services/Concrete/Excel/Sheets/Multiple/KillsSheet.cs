using System.Collections.Generic;
using System.Linq;
using Core.Models;
using Core.Models.Events;
using NPOI.SS.UserModel;

namespace Services.Concrete.Excel.Sheets.Multiple
{
    public class KillsSheet : AbstractMultipleSheet
    {
        private readonly Dictionary<string, KillEvent[]> _KillsPerDemoId = new Dictionary<string, KillEvent[]>();

        public KillsSheet(IWorkbook workbook)
        {
            Headers = new Dictionary<string, CellType>()
            {
                { "Demo ID", CellType.String },
                { "Tick", CellType.Numeric },
                { "Round", CellType.Numeric },
                { "Time death (s)", CellType.Numeric },
                { "Killer", CellType.String },
                { "Killer SteamID", CellType.String },
                { "Killer side", CellType.String },
                { "Killer team", CellType.String },
                { "Killer bot", CellType.Boolean },
                { "Killer blinded", CellType.Boolean },
                { "Killer vel X", CellType.Numeric },
                { "Killer vel Y", CellType.Numeric },
                { "Killer vel Z", CellType.Numeric },
                { "Victim", CellType.String },
                { "Victim SteamId", CellType.String },
                { "Victim side", CellType.String },
                { "Victim team", CellType.String },
                { "Victim bot", CellType.Boolean },
                { "Victim blinded", CellType.Boolean },
                { "Assister", CellType.String },
                { "Assister SteamID", CellType.String },
                { "assister bot", CellType.Boolean },
                { "Weapon", CellType.String },
                { "Headshot", CellType.Boolean },
                { "Crouching", CellType.Boolean },
                { "Trade kill", CellType.Boolean },
                { "Killer X", CellType.Numeric },
                { "Killer Y", CellType.Numeric },
                { "Killer Z", CellType.Numeric },
                { "Victim X", CellType.Numeric },
                { "Victim Y", CellType.Numeric },
                { "Victim Z", CellType.Numeric },
            };
            Sheet = workbook.CreateSheet("Kills");
        }

        public override void AddDemo(Demo demo)
        {
            if (!_KillsPerDemoId.ContainsKey(demo.Id))
            {
                _KillsPerDemoId.Add(demo.Id, demo.Kills.ToArray());
            }
        }

        protected override void GenerateContent()
        {
            int rowNumber = 1;
            foreach (KeyValuePair<string, KillEvent[]> kvp in _KillsPerDemoId)
            {
                string demoId = kvp.Key;
                foreach (KillEvent kill in kvp.Value)
                {
                    IRow row = Sheet.CreateRow(rowNumber++);
                    int columnNumber = 0;
                    SetCellValue(row, columnNumber++, CellType.String, demoId);
                    SetCellValue(row, columnNumber++, CellType.Numeric, kill.Tick);
                    SetCellValue(row, columnNumber++, CellType.Numeric, kill.RoundNumber);
                    SetCellValue(row, columnNumber++, CellType.Numeric, kill.TimeDeathSeconds);
                    SetCellValue(row, columnNumber++, CellType.String, kill.KillerName);
                    SetCellValue(row, columnNumber++, CellType.String, kill.KillerSteamId);
                    SetCellValue(row, columnNumber++, CellType.String, kill.KillerSide.AsString());
                    SetCellValue(row, columnNumber++, CellType.String, kill.KillerTeam);
                    SetCellValue(row, columnNumber++, CellType.Boolean, kill.KillerIsControllingBot);
                    SetCellValue(row, columnNumber++, CellType.Boolean, kill.KillerIsBlinded);
                    SetCellValue(row, columnNumber++, CellType.Numeric, kill.KillerVelocityX);
                    SetCellValue(row, columnNumber++, CellType.Numeric, kill.KillerVelocityY);
                    SetCellValue(row, columnNumber++, CellType.Numeric, kill.KillerVelocityZ);
                    SetCellValue(row, columnNumber++, CellType.String, kill.KilledName);
                    SetCellValue(row, columnNumber++, CellType.String, kill.KilledSteamId);
                    SetCellValue(row, columnNumber++, CellType.String, kill.KilledSide.AsString());
                    SetCellValue(row, columnNumber++, CellType.String, kill.KilledTeam);
                    SetCellValue(row, columnNumber++, CellType.Boolean, kill.KilledIsControllingBot);
                    SetCellValue(row, columnNumber++, CellType.Boolean, kill.VictimIsBlinded);
                    SetCellValue(row, columnNumber++, CellType.String, kill.AssisterName);
                    SetCellValue(row, columnNumber++, CellType.String, kill.AssisterSteamId);
                    SetCellValue(row, columnNumber++, CellType.Boolean, kill.AssisterIsControllingBot);
                    SetCellValue(row, columnNumber++, CellType.String, kill.Weapon.Name);
                    SetCellValue(row, columnNumber++, CellType.Boolean, kill.IsHeadshot);
                    SetCellValue(row, columnNumber++, CellType.Boolean, kill.IsKillerCrouching);
                    SetCellValue(row, columnNumber++, CellType.Boolean, kill.IsTradeKill);
                    SetCellValue(row, columnNumber++, CellType.Numeric, kill.Point.KillerX);
                    SetCellValue(row, columnNumber++, CellType.Numeric, kill.Point.KillerY);
                    SetCellValue(row, columnNumber++, CellType.Numeric, kill.Point.KillerZ);
                    SetCellValue(row, columnNumber++, CellType.Numeric, kill.Point.VictimX);
                    SetCellValue(row, columnNumber++, CellType.Numeric, kill.Point.VictimY);
                    SetCellValue(row, columnNumber, CellType.Numeric, kill.Point.VictimZ);
                }
            }
        }
    }
}
