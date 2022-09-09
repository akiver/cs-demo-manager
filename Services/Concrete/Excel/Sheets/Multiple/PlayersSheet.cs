using System;
using System.Collections.Generic;
using Core.Models;

namespace Services.Concrete.Excel.Sheets.Multiple
{
    internal class PlayersSheet: MultipleDemoSheet
    {
        private readonly Dictionary<long, PlayerSheetRow> _rowPerSteamId = new Dictionary<long, PlayerSheetRow>();

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
                "Match",
                "Kills",
                "Assists",
                "Deaths",
                "K/D",
                "HS",
                "HS%",
                "Rounds",
                "RWS",
                "KAST",
                "Rating",
                "Rating 2",
                "ATD (s)",
                "5K",
                "4K",
                "3K",
                "2K",
                "1K",
                "Trade Kill",
                "Trade Death",
                "Team kill",
                "Jump kill",
                "Crouch kill",
                "Bomb planted",
                "Bomb defused",
                "Bomb exploded",
                "MVP",
                "Score",
                "Clutch",
                "Clutch won",
                "Clutch lost",
                "Clutch won %",
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
                "Entry kill",
                "Entry kill win",
                "Entry kill lost",
                "Entry kill win %",
                "Entry hold kill",
                "Entry hold kill win",
                "Entry hold kill lost",
                "Entry hold kill win %",
                "KPR",
                "APR",
                "DPR",
                "ADR",
                "TDH",
                "TDA",
                "Flashbang thrown",
                "Smoke thrown",
                "HE thrown",
                "Decoy thrown",
                "Molotov thrown",
                "Incendiary thrown",
                "Rank max",
                "VAC",
                "OW",
            };
        }

        public PlayersSheet(Workbook workbook): base(workbook)
        {
        }

        public override void AddDemo(Demo demo)
        {
            foreach (var player in demo.Players)
            {
                if (!_rowPerSteamId.ContainsKey(player.SteamId))
                {
                    _rowPerSteamId.Add(player.SteamId, new PlayerSheetRow());
                }

                var row = _rowPerSteamId[player.SteamId];
                row.Name = player.Name;
                row.MatchCount++;
                row.RankMax = row.RankMax < player.RankNumberNew ? player.RankNumberNew : row.RankMax;
                row.KillCount += player.KillCount;
                row.AssistCount += player.AssistCount;
                row.DeathCount += player.DeathCount;
                row.FiveKillCount += player.FiveKillCount;
                row.FourKillCount += player.FourKillCount;
                row.ThreeKillCount += player.ThreeKillCount;
                row.TwoKillCount += player.TwoKillCount;
                row.OneKillCount += player.OneKillCount;
                row.HeadshotCount += player.HeadshotCount;
                row.TeamKillCount += player.TeamKillCount;
                row.JumpKillCount += player.JumpKillCount;
                row.CrouchKillCount += player.CrouchKillCount;
                row.ClutchCount += player.ClutchCount;
                row.ClutchWonCount += player.ClutchWonCount;
                row.ClutchLostCount += player.ClutchLostCount;
                row.Clutch1V1Count += player.Clutch1V1Count;
                row.Clutch1V2Count += player.Clutch1V2Count;
                row.Clutch1V3Count += player.Clutch1V3Count;
                row.Clutch1V4Count += player.Clutch1V4Count;
                row.Clutch1V5Count += player.Clutch1V5Count;
                row.Clutch1V1WonCount += player.Clutch1V1WonCount;
                row.Clutch1V2WonCount += player.Clutch1V2WonCount;
                row.Clutch1V3WonCount += player.Clutch1V3WonCount;
                row.Clutch1V4WonCount += player.Clutch1V4WonCount;
                row.Clutch1V5WonCount += player.Clutch1V5WonCount;
                row.Clutch1V1LossCount += player.Clutch1V1LossCount;
                row.Clutch1V2LossCount += player.Clutch1V2LossCount;
                row.Clutch1V3LossCount += player.Clutch1V3LossCount;
                row.Clutch1V4LossCount += player.Clutch1V4LossCount;
                row.Clutch1V5LossCount += player.Clutch1V5LossCount;
                row.BombPlantedCount += player.BombPlantedCount;
                row.BombDefusedCount += player.BombDefusedCount;
                row.BombExplodedCount += player.BombExplodedCount;
                row.MvpCount += player.RoundMvpCount;
                row.ScoreCount += player.Score;
                row.Rating += player.RatingHltv;
                row.Rating2 += player.RatingHltv2;
                row.EseaRws += player.EseaRws;
                row.RoundCount += player.RoundPlayedCount;
                row.IsVacBanned = row.IsVacBanned || player.IsVacBanned;
                row.IsOverwatchBanned = row.IsOverwatchBanned || player.IsOverwatchBanned;
                row.FlashbangThrownCount += player.FlashbangThrownCount;
                row.SmokeThrownCount += player.SmokeThrownCount;
                row.HeGrenadeThrownCount += player.HeGrenadeThrownCount;
                row.DecoyThrownCount += player.DecoyThrownCount;
                row.MolotovThrownCount += player.MolotovThrownCount;
                row.IncendiaryThrownCount += player.IncendiaryThrownCount;
                row.DamageHealthCount += player.TotalDamageHealthCount;
                row.DamageArmorCount += player.TotalDamageArmorCount;
                row.EntryKillCount += player.EntryKills.Count;
                row.EntryKillWinCount += player.EntryKillWonCount;
                row.EntryKillLossCount += player.EntryKillLossCount;
                row.EntryHoldKillCount += player.EntryHoldKills.Count;
                row.EntryHoldKillWonCount += player.EntryHoldKillWonCount;
                row.EntryHoldKillLossCount += player.EntryHoldKillLossCount;
                row.TradeKillCount += player.TradeKillCount;
                row.TradeDeathCount += player.TradeDeathCount;
                row.AverageTimeDeathSeconds += player.AverageTimeDeath;
                row.Kast += player.Kast;
            }
        }

        public override void Generate()
        {
            foreach (var entry in _rowPerSteamId)
            {
                var row = entry.Value;
                var cells = new List<object>
                {
                     row.Name,
                     entry.Key.ToString(),
                     row.MatchCount,
                     row.KillCount,
                     row.AssistCount,
                     row.DeathCount,
                     row.KillPerDeath,
                     row.HeadshotCount,
                     row.HeadshotPercent,
                     row.RoundCount,
                     Math.Round(row.EseaRws / row.MatchCount, 2),
                     Math.Round(row.Kast, 2),
                     Math.Round(row.Rating / row.MatchCount, 2),
                     Math.Round(row.Rating2 / row.MatchCount, 2),
                     Math.Round(row.AverageTimeDeathSeconds / row.MatchCount, 2),
                     row.FiveKillCount,
                     row.FourKillCount,
                     row.ThreeKillCount,
                     row.TwoKillCount,
                     row.OneKillCount,
                     row.TradeKillCount,
                     row.TradeDeathCount,
                     row.TeamKillCount,
                     row.JumpKillCount,
                     row.CrouchKillCount,
                     row.BombPlantedCount,
                     row.BombDefusedCount,
                     row.BombExplodedCount,
                     row.MvpCount,
                     row.ScoreCount,
                     row.ClutchCount,
                     row.ClutchWonCount,
                     row.ClutchLostCount,
                     row.ClutchWonPercent,
                     row.Clutch1V1Count,
                     row.Clutch1V1WonCount,
                     row.Clutch1V1LossCount,
                     row.Clutch1V1WonPercent,
                     row.Clutch1V2Count,
                     row.Clutch1V2WonCount,
                     row.Clutch1V2LossCount,
                     row.Clutch1V2WonPercent,
                     row.Clutch1V3Count,
                     row.Clutch1V3WonCount,
                     row.Clutch1V3LossCount,
                     row.Clutch1V3WonPercent,
                     row.Clutch1V4Count,
                     row.Clutch1V4WonCount,
                     row.Clutch1V4LossCount,
                     row.Clutch1V4WonPercent,
                     row.Clutch1V5Count,
                     row.Clutch1V5WonCount,
                     row.Clutch1V5LossCount,
                     row.Clutch1V5WonPercent,
                     row.EntryKillCount,
                     row.EntryKillWinCount,
                     row.EntryKillLossCount,
                     row.EntryKillWinPercent,
                     row.EntryHoldKillCount,
                     row.EntryHoldKillWonCount,
                     row.EntryHoldKillLossCount,
                     row.EntryHoldKillWinPercent,
                     row.KillPerRound,
                     row.AssistPerRound,
                     row.DeathPerRound,
                     row.AverageDamagePerRound,
                     row.DamageHealthCount,
                     row.DamageArmorCount,
                     row.FlashbangThrownCount,
                     row.SmokeThrownCount,
                     row.HeGrenadeThrownCount,
                     row.DecoyThrownCount,
                     row.MolotovThrownCount,
                     row.IncendiaryThrownCount,
                     row.RankMax,
                     row.IsVacBanned,
                     row.IsOverwatchBanned,
                };
                WriteRow(cells);
            }
        }
    }
}
