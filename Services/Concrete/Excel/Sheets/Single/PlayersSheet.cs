using System;
using System.Collections.Generic;
using Core.Models;

namespace Services.Concrete.Excel.Sheets.Single
{
    internal class PlayersSheet: SingleDemoSheet
    {
        protected override string GetName()
        {
            return "Players";
        }

        protected override string[] GetColumnNames()
        {
            return new[]
            {
                "Name",
                "SteamID",
                "Rank",
                "Team",
                "Kills",
                "Assists",
                "Deaths",
                "K/D",
                "HS",
                "HS%",
                "KAST",
                "Team kill",
                "Entry kill",
                "Bomb planted",
                "Bomb defused",
                "MVP",
                "Score",
                "RWS",
                "Rating",
                "Rating 2",
                "ATD (s)",
                "KPR",
                "APR",
                "DPR",
                "ADR",
                "TDH",
                "TDA",
                "5K",
                "4K",
                "3K",
                "2K",
                "1K",
                "Trade kill",
                "Trade death",
                "Crouch kill",
                "Jump kill",
                "1v1",
                "1v1 won",
                "1v1 loss",
                "1v1 won %",
                "1v2",
                "1v2 won",
                "1v2 loss",
                "1v2 won %",
                "1v3",
                "1v3 won",
                "1v3 loss",
                "1v3 won %",
                "1v4",
                "1v4 won",
                "1v4 loss",
                "1v4 won %",
                "1v5",
                "1v5 won",
                "1v5 loss",
                "1v5 won %",
                "Flashbang",
                "Smoke",
                "HE",
                "Decoy",
                "Molotov",
                "Incendiary",
                "VAC",
                "OW",
            };
        }

        public PlayersSheet(Workbook workbook, Demo demo): base(workbook, demo)
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
                    player.RankNumberNew,
                    player.TeamName,
                    player.KillCount,
                    player.AssistCount,
                    player.DeathCount,
                    (double)player.KillDeathRatio,
                    player.HeadshotCount,
                    player.HeadshotPercent,
                    Math.Round(player.Kast, 2),
                    player.TeamKillCount,
                    player.EntryKills.Count,
                    player.BombPlantedCount,
                    player.BombDefusedCount,
                    player.RoundMvpCount,
                    player.Score,
                    player.EseaRws,
                    player.RatingHltv,
                    player.RatingHltv2,
                    player.AverageTimeDeath,
                    player.KillPerRound,
                    player.AssistPerRound,
                    player.DeathPerRound,
                    player.AverageHealthDamage,
                    player.TotalDamageHealthCount,
                    player.TotalDamageArmorCount,
                    player.FiveKillCount,
                    player.FourKillCount,
                    player.ThreeKillCount,
                    player.TwoKillCount,
                    player.OneKillCount,
                    player.TradeKillCount,
                    player.TradeDeathCount,
                    player.CrouchKillCount,
                    player.JumpKillCount,
                    player.Clutch1V1Count,
                    player.Clutch1V1WonCount,
                    player.Clutch1V1LossCount,
                    player.Clutch1V1WonPercent,
                    player.Clutch1V2Count,
                    player.Clutch1V2WonCount,
                    player.Clutch1V2LossCount,
                    player.Clutch1V2WonPercent,
                    player.Clutch1V3Count,
                    player.Clutch1V3WonCount,
                    player.Clutch1V3LossCount,
                    player.Clutch1V3WonPercent,
                    player.Clutch1V4Count,
                    player.Clutch1V4WonCount,
                    player.Clutch1V4LossCount,
                    player.Clutch1V4WonPercent,
                    player.Clutch1V5Count,
                    player.Clutch1V5WonCount,
                    player.Clutch1V5LossCount,
                    player.Clutch1V5WonPercent,
                    player.FlashbangThrownCount,
                    player.SmokeThrownCount,
                    player.HeGrenadeThrownCount,
                    player.DecoyThrownCount,
                    player.MolotovThrownCount,
                    player.IncendiaryThrownCount,
                    player.IsVacBanned,
                    player.IsOverwatchBanned,
                };
                WriteRow(cells);
            }
        }
    }
}
