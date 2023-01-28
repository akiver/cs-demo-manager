using System;
using System.Collections.Generic;
using Core.Models;

namespace Services.Concrete.Excel.Sheets.Single
{
    internal class GeneralSheet: SingleDemoSheet
    {
        protected override string GetName()
        {
            return "General";
        }

        protected override string[] GetColumnNames()
        {
            return new[]
            {
                "Filename",
                "ID",
                "Date",
                "Type",
                "Source",
                "Map",
                "Hostname",
                "Client",
                "Server Tickrate",
                "Framerate",
                "Duration",
                "Ticks",
                "Name team 1",
                "Name team 2",
                "Score team 1",
                "Score team 2",
                "Score 1st half team 1",
                "Score 1st half team 2",
                "Score 2nd half team 1",
                "Score 2nd half team 2",
                "Winner",
                "Kills",
                "Assists",
                "5K",
                "4K",
                "3K",
                "2K",
                "1K",
                "Trade kill",
                "Average Damage Per Round",
                "Total Damage Health",
                "Total Damage Armor",
                "Average KAST",
                "Clutch",
                "Bomb Defused",
                "Bomb Exploded",
                "Bomb Planted",
                "Flashbang",
                "Smoke",
                "HE",
                "Decoy",
                "Molotov",
                "Incendiary",
                "Shots",
                "Hits",
                "Round",
                "Comment",
                "Cheater",
            };
        }

        public GeneralSheet(Workbook workbook, Demo demo): base(workbook, demo)
        {
        }

        public override void Generate()
        {
            var cells = new List<object>
            {
                Demo.Name,
                Demo.Id,
                Demo.DateAsString,
                Demo.Type.AsString(),
                Demo.Source.Name,
                Demo.MapName,
                Demo.Hostname,
                Demo.ClientName,
                Demo.ServerTickrate,
                Demo.Tickrate,
                Math.Round(Demo.Duration, 2),
                Demo.Ticks,
                Demo.TeamCT.Name,
                Demo.TeamT.Name,
                Demo.ScoreTeamCt,
                Demo.ScoreTeamT,
                Demo.ScoreFirstHalfTeamCt,
                Demo.ScoreFirstHalfTeamT,
                Demo.ScoreSecondHalfTeamCt,
                Demo.ScoreSecondHalfTeamT,
                Demo.Winner != null ? Demo.Winner.Name : string.Empty,
                Demo.KillCount,
                Demo.AssistCount,
                Demo.FiveKillCount,
                Demo.FourKillCount,
                Demo.ThreeKillCount,
                Demo.TwoKillCount,
                Demo.OneKillCount,
                Demo.TradeKillCount,
                Demo.AverageHealthDamage,
                Demo.DamageHealthCount,
                Demo.DamageArmorCount,
                Math.Round(Demo.AverageKast, 2),
                Demo.ClutchCount,
                Demo.BombDefusedCount,
                Demo.BombExplodedCount,
                Demo.BombPlantedCount,
                Demo.FlashbangThrownCount,
                Demo.SmokeThrownCount,
                Demo.HeThrownCount,
                Demo.DecoyThrownCount,
                Demo.MolotovThrownCount,
                Demo.IncendiaryThrownCount,
                Demo.WeaponFiredCount,
                Demo.HitCount,
                Demo.Rounds.Count,
                Demo.Comment,
                Demo.CheaterCount,
            };
            WriteRow(cells);
        }
    }
}
