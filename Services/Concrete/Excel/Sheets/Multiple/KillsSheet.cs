using System.Collections.Generic;
using Core.Models;

namespace Services.Concrete.Excel.Sheets.Multiple
{
    internal class KillsSheet: MultipleDemoSheet
    {
        private readonly Dictionary<string, KillSheetRow[]> _rowsPerDemoId = new Dictionary<string, KillSheetRow[]>();

        protected override string GetName()
        {
            return "Kills";
        }

        protected override string[] GetColumnNames()
        {
            return new[]
            {

                "Demo ID",
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

        public KillsSheet(Workbook workbook): base(workbook)
        {
        }

        public override void AddDemo(Demo demo)
        {
            if (!_rowsPerDemoId.ContainsKey(demo.Id))
            {
                _rowsPerDemoId[demo.Id] = new KillSheetRow[demo.Kills.Count];
                for(var index = 0; index < demo.Kills.Count; index++)
                {
                    var kill = demo.Kills[index];
                    var row = new KillSheetRow
                    {
                        Tick = kill.Tick,
                        RoundNumber = kill.RoundNumber,
                        TimeDeathSeconds = kill.TimeDeathSeconds,
                        KillerName = kill.KillerName,
                        KillerSteamId = kill.KillerSteamId,
                        KillerSide = kill.KillerSide,
                        KillerTeamName = kill.KillerTeam,
                        KillerIsControllingBot = kill.IsKillerBot,
                        KillerIsBlinded = kill.KillerIsBlinded,
                        KillerVelocityX = kill.KillerVelocityX,
                        KillerVelocityY = kill.KillerVelocityY,
                        KillerVelocityZ = kill.KillerVelocityZ,
                        VictimName = kill.KilledName,
                        VictimSteamId = kill.KilledSteamId,
                        VictimSide = kill.KilledSide,
                        VictimTeamName = kill.KilledTeam,
                        VictimIsControllingBot = kill.KilledIsControllingBot,
                        VictimIsBlinded = kill.VictimIsBlinded,
                        AssisterName = kill.AssisterName,
                        AssisterSteamId = kill.AssisterSteamId,
                        AssisterIsControllingBot = kill.AssisterIsControllingBot,
                        WeaponName = kill.Weapon.Name,
                        IsHeadshot = kill.IsHeadshot,
                        IsKillerCrouching = kill.IsKillerCrouching,
                        IsTradeKill = kill.IsTradeKill,
                        KillerX = kill.Point.KillerX,
                        KillerY = kill.Point.KillerY,
                        KillerZ = kill.Point.KillerZ,
                        VictimX = kill.Point.VictimX,
                        VictimY = kill.Point.VictimY,
                        VictimZ = kill.Point.VictimZ,
                    };

                    _rowsPerDemoId[demo.Id][index] = row;
                }
            }
        }

        public override void Generate()
        {
            foreach (var entry in _rowsPerDemoId)
            {
                foreach (var kill in entry.Value)
                {
                    var cells = new List<object>
                    {
                        entry.Key,
                        kill.Tick,
                        kill.RoundNumber,
                        kill.TimeDeathSeconds,
                        kill.KillerName,
                        kill.KillerSteamId.ToString(),
                        kill.KillerSide.AsString(),
                        kill.KillerTeamName,
                        kill.KillerIsControllingBot,
                        kill.KillerIsBlinded,
                        kill.KillerVelocityX,
                        kill.KillerVelocityY,
                        kill.KillerVelocityZ,
                        kill.VictimName,
                        kill.VictimSteamId.ToString(),
                        kill.VictimSide.AsString(),
                        kill.VictimTeamName,
                        kill.VictimIsControllingBot,
                        kill.VictimIsBlinded,
                        kill.AssisterName,
                        kill.AssisterSteamId.ToString(),
                        kill.AssisterIsControllingBot,
                        kill.WeaponName,
                        kill.IsHeadshot,
                        kill.IsKillerCrouching,
                        kill.IsTradeKill,
                        kill.KillerX,
                        kill.KillerY,
                        kill.KillerZ,
                        kill.VictimX,
                        kill.VictimY,
                        kill.VictimZ,
                    };
                    WriteRow(cells);
                }
            }
        }
    }
}
