using System;
using System.Collections.Generic;
using Core.Models;

namespace Services.Concrete.Excel.Sheets.Single
{
    internal class RoundsSheet: SingleDemoSheet
    {
        protected override string GetName()
        {
            return "Rounds";
        }

        protected override string[] GetColumnNames()
        {
            return new[]
            {
                "Number",
                "Tick",
                "Duration (s)",
                "Winner Clan Name",
                "Winner",
                "End reason",
                "Type",
                "Side",
                "Team",
                "Kills",
                "1K",
                "2K",
                "3K",
                "4K",
                "5K",
                "Trade kill",
                "Jump kills",
                "ADP",
                "TDH",
                "TDA",
                "Bomb Exploded",
                "Bomb planted",
                "Bomb defused",
                "Start money team 1",
                "Start money team 2",
                "Equipment value team 1",
                "Equipment value team 2",
                "Flashbang",
                "Smoke",
                "HE",
                "Decoy",
                "Molotov",
                "Incendiary",
            };
        }

        public RoundsSheet(Workbook workbook, Demo demo): base(workbook, demo)
        {
        }

        public override void Generate()
        {
            foreach (var round in Demo.Rounds)
            {
                var cells = new List<object>
                {
                    round.Number,
                    round.Tick,
                    Math.Round(round.Duration, 2),
                    round.WinnerName,
                    round.WinnerSide.AsString(),
                    round.EndReason.AsString(),
                    round.Type.AsString(),
                    round.SideTrouble.AsString(),
                    round.TeamTroubleName != string.Empty ? round.TeamTroubleName : string.Empty,
                    round.KillCount,
                    round.OneKillCount,
                    round.TwoKillCount,
                    round.ThreeKillCount,
                    round.FourKillCount,
                    round.FiveKillCount,
                    round.TradeKillCount,
                    round.JumpKillCount,
                    round.AverageHealthDamagePerPlayer,
                    round.DamageHealthCount,
                    round.DamageArmorCount,
                    round.BombExplodedCount,
                    round.BombPlantedCount,
                    round.BombDefusedCount,
                    round.StartMoneyTeamCt,
                    round.StartMoneyTeamT,
                    round.EquipementValueTeamCt,
                    round.EquipementValueTeamT,
                    round.FlashbangThrownCount,
                    round.SmokeThrownCount,
                    round.HeGrenadeThrownCount,
                    round.DecoyThrownCount,
                    round.MolotovThrownCount,
                    round.IncendiaryThrownCount,
                };
                WriteRow(cells);
            }
        }
    }
}
