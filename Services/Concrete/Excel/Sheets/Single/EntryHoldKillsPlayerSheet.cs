using System.Collections.Generic;
using Core.Models;

namespace Services.Concrete.Excel.Sheets.Single
{
    internal class EntryHoldKillsPlayerSheet: SingleDemoSheet
    {
        protected override string GetName()
        {
            return "Entry Hold Kills Players";
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
                "Ratio",
            };
        }

        public EntryHoldKillsPlayerSheet(Workbook workbook, Demo demo): base(workbook, demo)
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
                    player.EntryHoldKills.Count,
                    player.EntryHoldKillWonCount,
                    player.EntryHoldKillLossCount,
                    player.RatioEntryHoldKill,
                };
                WriteRow(cells);
            }
        }
    }
}
