using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Core.Models;
using NPOI.SS.UserModel;

namespace Services.Concrete.Excel.Sheets.Single
{
    public class FlashMatrixTeamsSheet : AbstractSingleSheet
    {
        public FlashMatrixTeamsSheet(IWorkbook workbook, Demo demo)
        {
            Headers = new Dictionary<string, CellType> { { string.Empty, CellType.String } };
            Demo = demo;
            Sheet = workbook.CreateSheet("Flash matrix teams");
        }

        public override async Task GenerateContent()
        {
            CacheService cacheService = new CacheService();
            Demo.PlayerBlinded = await cacheService.GetDemoPlayerBlindedAsync(Demo);

            // first row containing teams name
            IRow row = Sheet.CreateRow(0);
            SetCellValue(row, 0, CellType.String, "Flasher\\Flashed");
            SetCellValue(row, 1, CellType.String, Demo.TeamT.Name);
            SetCellValue(row, 2, CellType.String, Demo.TeamCT.Name);

            float teamCtvsTeamTDuration = Demo.PlayerBlinded.Where(e => e.ThrowerTeamName == Demo.TeamCT.Name && e.VictimTeamName == Demo.TeamT.Name)
                .Sum(e => e.Duration);
            float teamTvsTeamCtDuration = Demo.PlayerBlinded.Where(e => e.ThrowerTeamName == Demo.TeamT.Name && e.VictimTeamName == Demo.TeamCT.Name)
                .Sum(e => e.Duration);
            float teamCTvsTeamCtDuration = Demo.PlayerBlinded
                .Where(e => e.ThrowerTeamName == Demo.TeamCT.Name && e.VictimTeamName == Demo.TeamCT.Name)
                .Sum(e => e.Duration);
            float teamTvsTeamTDuration = Demo.PlayerBlinded.Where(e => e.ThrowerTeamName == Demo.TeamT.Name && e.VictimTeamName == Demo.TeamT.Name)
                .Sum(e => e.Duration);

            row = Sheet.CreateRow(1);
            SetCellValue(row, 0, CellType.String, Demo.TeamCT.Name);
            SetCellValue(row, 1, CellType.Numeric, Math.Round(teamCtvsTeamTDuration, 2));
            SetCellValue(row, 2, CellType.Numeric, Math.Round(teamCTvsTeamCtDuration, 2));

            row = Sheet.CreateRow(2);
            SetCellValue(row, 0, CellType.String, Demo.TeamT.Name);
            SetCellValue(row, 1, CellType.Numeric, Math.Round(teamTvsTeamTDuration, 2));
            SetCellValue(row, 2, CellType.Numeric, Math.Round(teamTvsTeamCtDuration, 2));
        }
    }
}
