using System.Collections.Generic;
using Core.Models;

namespace Services.Concrete.Excel.Sheets.Single
{
    internal class EntryHoldKillsRoundSheet: SingleDemoSheet
    {
        protected override string GetName()
        {
            return "Entry Hold Kills Rounds";
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

        public EntryHoldKillsRoundSheet(Workbook workbook, Demo demo): base(workbook, demo)
        {
        }

        public override void Generate()
        {
            foreach (var round in Demo.Rounds)
            {
                if (round.EntryHoldKillEvent == null)
                {
                    continue;
                }

                var cells = new List<object>
                {
                    round.Number,
                    round.EntryHoldKillEvent.KillerName,
                    round.EntryHoldKillEvent.KillerSteamId.ToString(),
                    round.EntryHoldKillEvent.KilledName,
                    round.EntryHoldKillEvent.KilledSteamId.ToString(),
                    round.EntryHoldKillEvent.Weapon.Name,
                    round.EntryHoldKillEvent.HasWonRound ? "yes" : "no",
                };
                WriteRow(cells);
            }
        }
    }
}
