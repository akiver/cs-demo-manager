using System.Collections.Generic;
using Core.Models;

namespace Services.Concrete.Excel.Sheets.Single
{
    internal class EntryKillsPlayerSheet: SingleDemoSheet
    {
        protected override string GetName()
        {
            return "Entry Kills Players";
        }

        protected override string[] GetColumnNames()
        {
            return new[]
            {
                "Name",
                "SteamID",
                "Total",
                "Win",
                "Loss",
                "Rate",
            };
        }

        public EntryKillsPlayerSheet(Workbook workbook, Demo demo): base(workbook, demo)
        {
        }

        public override void Generate()
        {
            foreach (var player in Demo.Players)
            {
                var cells = new List<object>
                {
                    player.Name,
                    player.SteamId.ToString(),
                    player.EntryKills.Count,
                    player.EntryKillWonCount,
                    player.EntryKillLossCount,
                    player.RatioEntryKill,
                };
                WriteRow(cells);
            }
        }
    }
}
