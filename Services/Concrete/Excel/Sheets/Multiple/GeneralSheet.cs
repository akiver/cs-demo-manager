using System;
using System.Collections.Generic;
using Core.Models;

namespace Services.Concrete.Excel.Sheets.Multiple
{
    internal class GeneralSheet: MultipleDemoSheet
    {
        private readonly Dictionary<string, GeneralSheetRow> _rowPerDemoId = new Dictionary<string, GeneralSheetRow>();

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
                "Tickrate",
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

        public GeneralSheet(Workbook workbook) : base(workbook)
        {
        }

        public override void AddDemo(Demo demo)
        {
            if (_rowPerDemoId.ContainsKey(demo.Id))
            {
                return;
            }

            var row = new GeneralSheetRow
            {
                Name = demo.Name,
                Id = demo.Id,
                Date = demo.DateAsString,
                Type = demo.Type.AsString(),
                Source = demo.Source.Label,
                MapName = demo.MapName,
                Hostname = demo.Hostname,
                ClientName = demo.ClientName,
                Tickrate = demo.Tickrate,
                FrameRate = demo.FrameRate,
                Duration = demo.Duration,
                Ticks = demo.Ticks,
                TeamNameCT = demo.TeamCT.Name,
                TeamNameT = demo.TeamT.Name,
                ScoreTeamCt = demo.ScoreTeamCt,
                ScoreTeamT = demo.ScoreTeamT,
                ScoreFirstHalfTeamCt = demo.ScoreFirstHalfTeamCt,
                ScoreFirstHalfTeamT = demo.ScoreFirstHalfTeamT,
                ScoreSecondHalfTeamCt = demo.ScoreSecondHalfTeamCt,
                ScoreSecondHalfTeamT = demo.ScoreSecondHalfTeamT,
                WinnerName = demo.Winner != null ? demo.Winner.Name : string.Empty,
                KillCount = demo.KillCount,
                AssistCount = demo.AssistCount,
                FiveKillCount = demo.FiveKillCount,
                FourKillCount = demo.FourKillCount,
                ThreeKillCount = demo.ThreeKillCount,
                TwoKillCount = demo.TwoKillCount,
                OneKillCount = demo.OneKillCount,
                TradeKillCount = demo.TradeKillCount,
                AverageHealthDamage = demo.AverageHealthDamage,
                DamageHealthCount = demo.DamageHealthCount,
                DamageArmorCount = demo.DamageArmorCount,
                AverageKast = demo.AverageKast,
                ClutchCount = demo.ClutchCount,
                BombDefusedCount = demo.BombDefusedCount,
                BombExplodedCount = demo.BombExplodedCount,
                BombPlantedCount = demo.BombPlantedCount,
                FlashbangThrownCount = demo.FlashbangThrownCount,
                SmokeThrownCount = demo.SmokeThrownCount,
                HeThrownCount = demo.HeThrownCount,
                DecoyThrownCount = demo.DecoyThrownCount,
                MolotovThrownCount = demo.MolotovThrownCount,
                IncendiaryThrownCount = demo.IncendiaryThrownCount,
                WeaponFiredCount = demo.WeaponFiredCount,
                HitCount = demo.HitCount,
                RoundCount = demo.Rounds.Count,
                Comment = demo.Comment,
                CheaterCount = demo.CheaterCount,
            };
            _rowPerDemoId[demo.Id] = row;
        }

        public override void Generate()
        {
            foreach (var rowPerDemoId in _rowPerDemoId)
            {
                var demo = rowPerDemoId.Value;
                var cells = new List<object>
                {
                    demo.Name,
                    demo.Id,
                    demo.Date,
                    demo.Type,
                    demo.Source,
                    demo.MapName,
                    demo.Hostname,
                    demo.ClientName,
                    demo.Tickrate,
                    demo.FrameRate,
                    Math.Round(demo.Duration, 2),
                    demo.Ticks,
                    demo.TeamNameCT,
                    demo.TeamNameT,
                    demo.ScoreTeamCt,
                    demo.ScoreTeamT,
                    demo.ScoreFirstHalfTeamCt,
                    demo.ScoreFirstHalfTeamT,
                    demo.ScoreSecondHalfTeamCt,
                    demo.ScoreSecondHalfTeamT,
                    demo.WinnerName,
                    demo.KillCount,
                    demo.AssistCount,
                    demo.FiveKillCount,
                    demo.FourKillCount,
                    demo.ThreeKillCount,
                    demo.TwoKillCount,
                    demo.OneKillCount,
                    demo.TradeKillCount,
                    demo.AverageHealthDamage,
                    demo.DamageHealthCount,
                    demo.DamageArmorCount,
                    Math.Round(demo.AverageKast, 2),
                    demo.ClutchCount,
                    demo.BombDefusedCount,
                    demo.BombExplodedCount,
                    demo.BombPlantedCount,
                    demo.FlashbangThrownCount,
                    demo.SmokeThrownCount,
                    demo.HeThrownCount,
                    demo.DecoyThrownCount,
                    demo.MolotovThrownCount,
                    demo.IncendiaryThrownCount,
                    demo.WeaponFiredCount,
                    demo.HitCount,
                    demo.RoundCount,
                    demo.Comment,
                    demo.CheaterCount,
                };
                WriteRow(cells);
            }
        }
    }
}
