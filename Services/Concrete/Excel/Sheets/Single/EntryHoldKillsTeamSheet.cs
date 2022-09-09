using System.Collections.Generic;
using Core.Models;

namespace Services.Concrete.Excel.Sheets.Single
{
    internal class EntryHoldKillsTeamSheet: SingleDemoSheet
    {
        protected override string GetName()
        {
            return "Entry Hold Kills Teams";
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

        public EntryHoldKillsTeamSheet(Workbook workbook, Demo demo): base(workbook, demo)
        {
        }

        public override void Generate()
        {
            WriteRow(new List<object>
            {
                Demo.TeamCT.Name,
                Demo.TeamCT.EntryHoldKillCount,
                Demo.TeamCT.EntryHoldKillWonCount,
                Demo.TeamCT.EntryHoldKillLossCount,
                Demo.TeamCT.RatioEntryHoldKill,
            });
            WriteRow(new List<object>
            {
                Demo.TeamT.Name,
                Demo.TeamT.EntryHoldKillCount,
                Demo.TeamT.EntryHoldKillWonCount,
                Demo.TeamT.EntryHoldKillLossCount,
                Demo.TeamT.RatioEntryHoldKill,
            });
        }
    }
}
