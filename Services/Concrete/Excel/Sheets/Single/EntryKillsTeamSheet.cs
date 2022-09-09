using System.Collections.Generic;
using Core.Models;

namespace Services.Concrete.Excel.Sheets.Single
{
    internal class EntryKillsTeamSheet: SingleDemoSheet
    {
        protected override string GetName()
        {
            return "Entry Kills Teams";
        }

        protected override string[] GetColumnNames()
        {
            return new[]
            {
                "Name",
                "Total",
                "Win",
                "Loss",
                "Rate",
            };
        }

        public EntryKillsTeamSheet(Workbook workbook, Demo demo): base(workbook, demo)
        {
        }

        public override void Generate()
        {
            WriteRow(new List<object>
            {
                Demo.TeamCT.Name,
                Demo.TeamCT.EntryKillCount,
                Demo.TeamCT.EntryKillWonCount,
                Demo.TeamCT.EntryKillLossCount,
                Demo.TeamCT.RatioEntryKill,
            });

            WriteRow(new List<object>
            {
                Demo.TeamT.Name,
                Demo.TeamT.EntryKillCount,
                Demo.TeamT.EntryKillWonCount,
                Demo.TeamT.EntryKillLossCount,
                Demo.TeamT.RatioEntryKill,
            });
        }
    }
}
