using System;
using System.Collections.Generic;
using System.Linq;
using Core.Models;

namespace Services.Concrete.Excel.Sheets.Single
{
    internal class FlashMatrixTeamsSheet : SingleDemoSheet
    {
        public FlashMatrixTeamsSheet(Workbook workbook, Demo demo): base(workbook, demo)
        {
        }

        protected override string GetName()
        {
            return "Flash matrix teams";
        }

        protected override string[] GetColumnNames()
        {
            return new string[]{};
        }

        public override void Generate()
        {
            float teamCtvsTeamTDuration = Demo.PlayerBlinded.Where(e => e.ThrowerTeamName == Demo.TeamCT.Name && e.VictimTeamName == Demo.TeamT.Name)
                .Sum(e => e.Duration);
            float teamTvsTeamCtDuration = Demo.PlayerBlinded.Where(e => e.ThrowerTeamName == Demo.TeamT.Name && e.VictimTeamName == Demo.TeamCT.Name)
                .Sum(e => e.Duration);
            float teamCTvsTeamCtDuration = Demo.PlayerBlinded
                .Where(e => e.ThrowerTeamName == Demo.TeamCT.Name && e.VictimTeamName == Demo.TeamCT.Name)
                .Sum(e => e.Duration);
            float teamTvsTeamTDuration = Demo.PlayerBlinded.Where(e => e.ThrowerTeamName == Demo.TeamT.Name && e.VictimTeamName == Demo.TeamT.Name)
                .Sum(e => e.Duration);


            WriteRow(new List<object>
            {
                "Flasher\\Flashed",
                Demo.TeamT.Name,
                Demo.TeamCT.Name,
            });

            WriteRow(new List<object>
            {
                Demo.TeamCT.Name,
                Math.Round(teamCtvsTeamTDuration, 2),
                Math.Round(teamCTvsTeamCtDuration, 2),
            });

            WriteRow(new List<object>
            {
                Demo.TeamT.Name,
                Math.Round(teamTvsTeamTDuration, 2),
                Math.Round(teamTvsTeamCtDuration, 2),
            });
        }
    }
}
