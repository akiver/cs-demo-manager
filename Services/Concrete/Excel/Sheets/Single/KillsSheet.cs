using System.Collections.Generic;
using Core.Models;

namespace Services.Concrete.Excel.Sheets.Single
{
    internal class KillsSheet: SingleDemoSheet
    {
        protected override string GetName()
        {
            return "Kills";
        }

        protected override string[] GetColumnNames()
        {
            return new[]
            {
                "Tick",
                "Round",
                "Time death (s)",
                "Killer",
                "Killer SteamID",
                "Killer side",
                "Killer team",
                "Killer bot",
                "Killer blinded",
                "Killer vel X",
                "Killer vel Y",
                "Killer vel Z",
                "Victim",
                "Victim SteamId",
                "Victim side",
                "Victim team",
                "Victim bot",
                "Victim blinded",
                "Assister",
                "Assister SteamID",
                "assister bot",
                "Weapon",
                "Headshot",
                "Crouching",
                "Trade kill",
                "Killer X",
                "Killer Y",
                "Killer Z",
                "Victim X",
                "Victim Y",
                "Victim Z",
            };
        }

        public KillsSheet(Workbook workbook, Demo demo): base(workbook, demo)
        {
        }

        public override void Generate()
        {
            foreach (var kill in Demo.Kills)
            {
                var cells = new List<object>
                {
                    kill.Tick,
                    kill.RoundNumber,
                    kill.TimeDeathSeconds,
                    kill.KillerName,
                    kill.KillerSteamId.ToString(),
                    kill.KillerSide.AsString(),
                    kill.KillerTeam,
                    kill.KillerIsControllingBot,
                    kill.KillerIsBlinded,
                    kill.KillerVelocityX,
                    kill.KillerVelocityY,
                    kill.KillerVelocityZ,
                    kill.KilledName,
                    kill.KilledSteamId.ToString(),
                    kill.KilledSide.AsString(),
                    kill.KilledTeam,
                    kill.KilledIsControllingBot,
                    kill.VictimIsBlinded,
                    kill.AssisterName,
                    kill.AssisterSteamId.ToString(),
                    kill.AssisterIsControllingBot,
                    kill.Weapon.Name,
                    kill.IsHeadshot,
                    kill.IsKillerCrouching,
                    kill.IsTradeKill,
                    kill.Point.KillerX,
                    kill.Point.KillerY,
                    kill.Point.KillerZ,
                    kill.Point.VictimX,
                    kill.Point.VictimY,
                    kill.Point.VictimZ,
                };
                WriteRow(cells);
            }
        }
    }
}
