using System.Collections.Generic;
using Core.Models;

namespace Services.Concrete.Excel.Sheets.Single
{
    internal class EntryKillsRoundSheet: SingleDemoSheet
    {
        protected override string GetName()
        {
            return "Entry Kills Rounds";
        }

        protected override string[] GetColumnNames()
        {
            return new[]
            {
                "Number",
                "Killer Name",
                "Killer SteamID",
                "Victim Name",
                "Victim SteamID",
                "Weapon",
                "Round Won",
            };
        }

        public EntryKillsRoundSheet(Workbook workbook, Demo demo): base(workbook, demo)
        {
        }

        public override void Generate()
        {
            foreach (var round in Demo.Rounds)
            {
                if (round.EntryKillEvent == null)
                {
                    continue;
                }
                var cells = new List<object>
                {
                    round.Number,
                    round.EntryKillEvent.KillerName,
                    round.EntryKillEvent.KillerSteamId.ToString(),
                    round.EntryKillEvent.KilledName,
                    round.EntryKillEvent.KilledSteamId.ToString(),
                    round.EntryKillEvent.Weapon.Name,
                    round.EntryKillEvent.HasWonRound ? "yes" : "no",
                };
                WriteRow(cells);
            }
        }
    }
}
