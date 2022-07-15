using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Models;
using NPOI.SS.UserModel;
using Services.Models.Excel;

namespace Services.Concrete.Excel.Sheets.Multiple
{
    public class PlayersSheet : AbstractMultipleSheet
    {
        private readonly Dictionary<Player, PlayerStats> _playersData = new Dictionary<Player, PlayerStats>();

        public PlayersSheet(IWorkbook workbook)
        {
            Headers = new Dictionary<string, CellType>()
            {
                { "Name", CellType.String },
                { "SteamID", CellType.String },
                { "Team", CellType.String },
                { "Match", CellType.Numeric },
                { "Kills", CellType.Numeric },
                { "Assists", CellType.Numeric },
                { "Deaths", CellType.Numeric },
                { "K/D", CellType.Numeric },
                { "HS", CellType.Numeric },
                { "HS%", CellType.Numeric },
                { "Rounds", CellType.Numeric },
                { "RWS", CellType.Numeric },
                { "KAST", CellType.Numeric },
                { "Rating", CellType.Numeric },
                { "Rating 2", CellType.Numeric },
                { "ATD (s)", CellType.Numeric },
                { "5K", CellType.Numeric },
                { "4K", CellType.Numeric },
                { "3K", CellType.Numeric },
                { "2K", CellType.Numeric },
                { "1K", CellType.Numeric },
                { "Trade Kill", CellType.Numeric },
                { "Trade Death", CellType.Numeric },
                { "Team kill", CellType.Numeric },
                { "Jump kill", CellType.Numeric },
                { "Crouch kill", CellType.Numeric },
                { "Bomb planted", CellType.Numeric },
                { "Bomb defused", CellType.Numeric },
                { "Bomb exploded", CellType.Numeric },
                { "MVP", CellType.Numeric },
                { "Score", CellType.Numeric },
                { "Clutch", CellType.Numeric },
                { "Clutch won", CellType.Numeric },
                { "Clutch lost", CellType.Numeric },
                { "Clutch won %", CellType.Numeric },
                { "1v1", CellType.Numeric },
                { "1v1 won", CellType.Numeric },
                { "1v1 loss", CellType.Numeric },
                { "1v1 won %", CellType.Numeric },
                { "1v2", CellType.Numeric },
                { "1v2 won", CellType.Numeric },
                { "1v2 loss", CellType.Numeric },
                { "1v2 won %", CellType.Numeric },
                { "1v3", CellType.Numeric },
                { "1v3 won", CellType.Numeric },
                { "1v3 loss", CellType.Numeric },
                { "1v3 won %", CellType.Numeric },
                { "1v4", CellType.Numeric },
                { "1v4 won", CellType.Numeric },
                { "1v4 loss", CellType.Numeric },
                { "1v4 won %", CellType.Numeric },
                { "1v5", CellType.Numeric },
                { "1v5 won", CellType.Numeric },
                { "1v5 loss", CellType.Numeric },
                { "1v5 won %", CellType.Numeric },
                { "Entry kill", CellType.Numeric },
                { "Entry kill win", CellType.Numeric },
                { "Entry kill lost", CellType.Numeric },
                { "Entry kill win %", CellType.Numeric },
                { "Entry hold kill", CellType.Numeric },
                { "Entry hold kill win", CellType.Numeric },
                { "Entry hold kill lost", CellType.Numeric },
                { "Entry hold kill win %", CellType.Numeric },
                { "KPR", CellType.Numeric },
                { "APR", CellType.Numeric },
                { "DPR", CellType.Numeric },
                { "ADR", CellType.Numeric },
                { "TDH", CellType.Numeric },
                { "TDA", CellType.Numeric },
                { "Flashbang thrown", CellType.Numeric },
                { "Smoke thrown", CellType.Numeric },
                { "HE thrown", CellType.Numeric },
                { "Decoy thrown", CellType.Numeric },
                { "Molotov thrown", CellType.Numeric },
                { "Incendiary thrown", CellType.Numeric },
                { "Rank max", CellType.Numeric },
                { "VAC", CellType.Boolean },
                { "OW", CellType.Boolean },
            };
            Sheet = workbook.CreateSheet("Players");
        }

        public override void AddDemo(Demo demo)
        {
            foreach (Player player in demo.Players)
            {
                if (!_playersData.ContainsKey(player))
                {
                    _playersData.Add(player, new PlayerStats());
                }

                _playersData[player].MatchCount++;
                _playersData[player].RankMax = _playersData[player].RankMax < player.RankNumberNew ? player.RankNumberNew : _playersData[player].RankMax;
                _playersData[player].KillCount += player.KillCount;
                _playersData[player].AssistCount += player.AssistCount;
                _playersData[player].DeathCount += player.DeathCount;
                _playersData[player].FiveKillCount += player.FiveKillCount;
                _playersData[player].FourKillCount += player.FourKillCount;
                _playersData[player].ThreeKillCount += player.ThreeKillCount;
                _playersData[player].TwoKillCount += player.TwoKillCount;
                _playersData[player].OneKillCount += player.OneKillCount;
                _playersData[player].HeadshotCount += player.HeadshotCount;
                _playersData[player].TeamKillCount += player.TeamKillCount;
                _playersData[player].JumpKillCount += player.JumpKillCount;
                _playersData[player].CrouchKillCount += player.CrouchKillCount;
                _playersData[player].ClutchCount += player.ClutchCount;
                _playersData[player].ClutchWonCount += player.ClutchWonCount;
                _playersData[player].ClutchLostCount += player.ClutchLostCount;
                _playersData[player].Clutch1V1Count += player.Clutch1V1Count;
                _playersData[player].Clutch1V2Count += player.Clutch1V2Count;
                _playersData[player].Clutch1V3Count += player.Clutch1V3Count;
                _playersData[player].Clutch1V4Count += player.Clutch1V4Count;
                _playersData[player].Clutch1V5Count += player.Clutch1V5Count;
                _playersData[player].Clutch1V1WonCount += player.Clutch1V1WonCount;
                _playersData[player].Clutch1V2WonCount += player.Clutch1V2WonCount;
                _playersData[player].Clutch1V3WonCount += player.Clutch1V3WonCount;
                _playersData[player].Clutch1V4WonCount += player.Clutch1V4WonCount;
                _playersData[player].Clutch1V5WonCount += player.Clutch1V5WonCount;
                _playersData[player].Clutch1V1LossCount += player.Clutch1V1LossCount;
                _playersData[player].Clutch1V2LossCount += player.Clutch1V2LossCount;
                _playersData[player].Clutch1V3LossCount += player.Clutch1V3LossCount;
                _playersData[player].Clutch1V4LossCount += player.Clutch1V4LossCount;
                _playersData[player].Clutch1V5LossCount += player.Clutch1V5LossCount;
                _playersData[player].BombPlantedCount += player.BombPlantedCount;
                _playersData[player].BombDefusedCount += player.BombDefusedCount;
                _playersData[player].BombExplodedCount += player.BombExplodedCount;
                _playersData[player].MvpCount += player.RoundMvpCount;
                _playersData[player].ScoreCount += player.Score;
                _playersData[player].Rating += player.RatingHltv;
                _playersData[player].Rating2 += player.RatingHltv2;
                _playersData[player].EseaRws += player.EseaRws;
                _playersData[player].RoundCount += player.RoundPlayedCount;
                _playersData[player].IsVacBanned = _playersData[player].IsVacBanned || player.IsVacBanned;
                _playersData[player].IsOverwatchBanned = _playersData[player].IsOverwatchBanned || player.IsOverwatchBanned;
                _playersData[player].FlashbangThrownCount += player.FlashbangThrownCount;
                _playersData[player].SmokeThrownCount += player.SmokeThrownCount;
                _playersData[player].HeGrenadeThrownCount += player.HeGrenadeThrownCount;
                _playersData[player].DecoyThrownCount += player.DecoyThrownCount;
                _playersData[player].MolotovThrownCount += player.MolotovThrownCount;
                _playersData[player].IncendiaryThrownCount += player.IncendiaryThrownCount;
                _playersData[player].DamageHealthCount += player.TotalDamageHealthCount;
                _playersData[player].DamageArmorCount += player.TotalDamageArmorCount;
                _playersData[player].EntryKillCount += player.EntryKills.Count;
                _playersData[player].EntryKillWinCount += player.EntryKillWonCount;
                _playersData[player].EntryKillLossCount += player.EntryKillLossCount;
                _playersData[player].EntryHoldKillCount += player.EntryHoldKills.Count;
                _playersData[player].EntryHoldKillWonCount += player.EntryHoldKillWonCount;
                _playersData[player].EntryHoldKillLossCount += player.EntryHoldKillLossCount;
                _playersData[player].TradeKillCount += player.TradeKillCount;
                _playersData[player].TradeDeathCount += player.TradeDeathCount;
                _playersData[player].AverageTimeDeathSeconds += player.AverageTimeDeath;
                _playersData[player].Kast += player.Kast;
            }
        }

        protected override Task GenerateContent()
        {
            int rowCount = 1;
            foreach (KeyValuePair<Player, PlayerStats> playerData in _playersData)
            {
                IRow row = Sheet.CreateRow(rowCount++);
                int columnNumber = 0;
                SetCellValue(row, columnNumber++, CellType.String, playerData.Key.Name);
                SetCellValue(row, columnNumber++, CellType.String, playerData.Key.SteamId);
                SetCellValue(row, columnNumber++, CellType.String, playerData.Key.TeamName);
                SetCellValue(row, columnNumber++, CellType.Numeric, playerData.Value.MatchCount);
                SetCellValue(row, columnNumber++, CellType.Numeric, playerData.Value.KillCount);
                SetCellValue(row, columnNumber++, CellType.Numeric, playerData.Value.AssistCount);
                SetCellValue(row, columnNumber++, CellType.Numeric, playerData.Value.DeathCount);
                SetCellValue(row, columnNumber++, CellType.Numeric, playerData.Value.KillPerDeath);
                SetCellValue(row, columnNumber++, CellType.Numeric, playerData.Value.HeadshotCount);
                SetCellValue(row, columnNumber++, CellType.Numeric, playerData.Value.HeadshotPercent);
                SetCellValue(row, columnNumber++, CellType.Numeric, playerData.Value.RoundCount);
                SetCellValue(row, columnNumber++, CellType.Numeric, Math.Round(playerData.Value.EseaRws / playerData.Value.MatchCount, 2));
                SetCellValue(row, columnNumber++, CellType.Numeric, Math.Round(playerData.Value.Kast, 2));
                SetCellValue(row, columnNumber++, CellType.Numeric, Math.Round(playerData.Value.Rating / playerData.Value.MatchCount, 2));
                SetCellValue(row, columnNumber++, CellType.Numeric, Math.Round(playerData.Value.Rating2 / playerData.Value.MatchCount, 2));
                SetCellValue(row, columnNumber++, CellType.Numeric,
                    Math.Round(playerData.Value.AverageTimeDeathSeconds / playerData.Value.MatchCount, 2));
                SetCellValue(row, columnNumber++, CellType.Numeric, playerData.Value.FiveKillCount);
                SetCellValue(row, columnNumber++, CellType.Numeric, playerData.Value.FourKillCount);
                SetCellValue(row, columnNumber++, CellType.Numeric, playerData.Value.ThreeKillCount);
                SetCellValue(row, columnNumber++, CellType.Numeric, playerData.Value.TwoKillCount);
                SetCellValue(row, columnNumber++, CellType.Numeric, playerData.Value.OneKillCount);
                SetCellValue(row, columnNumber++, CellType.Numeric, playerData.Value.TradeKillCount);
                SetCellValue(row, columnNumber++, CellType.Numeric, playerData.Value.TradeDeathCount);
                SetCellValue(row, columnNumber++, CellType.Numeric, playerData.Value.TeamKillCount);
                SetCellValue(row, columnNumber++, CellType.Numeric, playerData.Value.JumpKillCount);
                SetCellValue(row, columnNumber++, CellType.Numeric, playerData.Value.CrouchKillCount);
                SetCellValue(row, columnNumber++, CellType.Numeric, playerData.Value.BombPlantedCount);
                SetCellValue(row, columnNumber++, CellType.Numeric, playerData.Value.BombDefusedCount);
                SetCellValue(row, columnNumber++, CellType.Numeric, playerData.Value.BombExplodedCount);
                SetCellValue(row, columnNumber++, CellType.Numeric, playerData.Value.MvpCount);
                SetCellValue(row, columnNumber++, CellType.Numeric, playerData.Value.ScoreCount);
                SetCellValue(row, columnNumber++, CellType.Numeric, playerData.Value.ClutchCount);
                SetCellValue(row, columnNumber++, CellType.Numeric, playerData.Value.ClutchWonCount);
                SetCellValue(row, columnNumber++, CellType.Numeric, playerData.Value.ClutchLostCount);
                SetCellValue(row, columnNumber++, CellType.Numeric, playerData.Value.ClutchWonPercent);
                SetCellValue(row, columnNumber++, CellType.Numeric, playerData.Value.Clutch1V1Count);
                SetCellValue(row, columnNumber++, CellType.Numeric, playerData.Value.Clutch1V1WonCount);
                SetCellValue(row, columnNumber++, CellType.Numeric, playerData.Value.Clutch1V1LossCount);
                SetCellValue(row, columnNumber++, CellType.Numeric, playerData.Value.Clutch1V1WonPercent);
                SetCellValue(row, columnNumber++, CellType.Numeric, playerData.Value.Clutch1V2Count);
                SetCellValue(row, columnNumber++, CellType.Numeric, playerData.Value.Clutch1V2WonCount);
                SetCellValue(row, columnNumber++, CellType.Numeric, playerData.Value.Clutch1V2LossCount);
                SetCellValue(row, columnNumber++, CellType.Numeric, playerData.Value.Clutch1V2WonPercent);
                SetCellValue(row, columnNumber++, CellType.Numeric, playerData.Value.Clutch1V3Count);
                SetCellValue(row, columnNumber++, CellType.Numeric, playerData.Value.Clutch1V3WonCount);
                SetCellValue(row, columnNumber++, CellType.Numeric, playerData.Value.Clutch1V3LossCount);
                SetCellValue(row, columnNumber++, CellType.Numeric, playerData.Value.Clutch1V3WonPercent);
                SetCellValue(row, columnNumber++, CellType.Numeric, playerData.Value.Clutch1V4Count);
                SetCellValue(row, columnNumber++, CellType.Numeric, playerData.Value.Clutch1V4WonCount);
                SetCellValue(row, columnNumber++, CellType.Numeric, playerData.Value.Clutch1V4LossCount);
                SetCellValue(row, columnNumber++, CellType.Numeric, playerData.Value.Clutch1V4WonPercent);
                SetCellValue(row, columnNumber++, CellType.Numeric, playerData.Value.Clutch1V5Count);
                SetCellValue(row, columnNumber++, CellType.Numeric, playerData.Value.Clutch1V5WonCount);
                SetCellValue(row, columnNumber++, CellType.Numeric, playerData.Value.Clutch1V5LossCount);
                SetCellValue(row, columnNumber++, CellType.Numeric, playerData.Value.Clutch1V5WonPercent);
                SetCellValue(row, columnNumber++, CellType.Numeric, playerData.Value.EntryKillCount);
                SetCellValue(row, columnNumber++, CellType.Numeric, playerData.Value.EntryKillWinCount);
                SetCellValue(row, columnNumber++, CellType.Numeric, playerData.Value.EntryKillLossCount);
                SetCellValue(row, columnNumber++, CellType.Numeric, playerData.Value.EntryKillWinPercent);
                SetCellValue(row, columnNumber++, CellType.Numeric, playerData.Value.EntryHoldKillCount);
                SetCellValue(row, columnNumber++, CellType.Numeric, playerData.Value.EntryHoldKillWonCount);
                SetCellValue(row, columnNumber++, CellType.Numeric, playerData.Value.EntryHoldKillLossCount);
                SetCellValue(row, columnNumber++, CellType.Numeric, playerData.Value.EntryHoldKillWinPercent);
                SetCellValue(row, columnNumber++, CellType.Numeric, playerData.Value.KillPerRound);
                SetCellValue(row, columnNumber++, CellType.Numeric, playerData.Value.AssistPerRound);
                SetCellValue(row, columnNumber++, CellType.Numeric, playerData.Value.DeathPerRound);
                SetCellValue(row, columnNumber++, CellType.Numeric, playerData.Value.AverageDamagePerRound);
                SetCellValue(row, columnNumber++, CellType.Numeric, playerData.Value.DamageHealthCount);
                SetCellValue(row, columnNumber++, CellType.Numeric, playerData.Value.DamageArmorCount);
                SetCellValue(row, columnNumber++, CellType.Numeric, playerData.Value.FlashbangThrownCount);
                SetCellValue(row, columnNumber++, CellType.Numeric, playerData.Value.SmokeThrownCount);
                SetCellValue(row, columnNumber++, CellType.Numeric, playerData.Value.HeGrenadeThrownCount);
                SetCellValue(row, columnNumber++, CellType.Numeric, playerData.Value.DecoyThrownCount);
                SetCellValue(row, columnNumber++, CellType.Numeric, playerData.Value.MolotovThrownCount);
                SetCellValue(row, columnNumber++, CellType.Numeric, playerData.Value.IncendiaryThrownCount);
                SetCellValue(row, columnNumber++, CellType.Numeric, playerData.Value.RankMax);
                SetCellValue(row, columnNumber++, CellType.Boolean, playerData.Value.IsVacBanned);
                SetCellValue(row, columnNumber, CellType.Boolean, playerData.Value.IsOverwatchBanned);
            }

            return Task.CompletedTask;
        }
    }
}
