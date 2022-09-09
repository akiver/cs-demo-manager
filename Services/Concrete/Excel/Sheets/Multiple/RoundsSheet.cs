using System;
using System.Collections.Generic;
using Core.Models;

namespace Services.Concrete.Excel.Sheets.Multiple
{
    internal class RoundsSheet: MultipleDemoSheet
    {
        private readonly Dictionary<string, RoundSheetRow[]> _rowsPerDemoId = new Dictionary<string, RoundSheetRow[]>();

        protected override string GetName()
        {
            return "Rounds";
        }

        protected override string[] GetColumnNames()
        {
            return new[]
            {
                "Demo ID",
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
                "Trade Kill",
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

        public RoundsSheet(Workbook workbook): base(workbook)
        {
        }

        public override void AddDemo(Demo demo)
        {
            if (_rowsPerDemoId.ContainsKey(demo.Id))
            {
                return;
            }

            _rowsPerDemoId[demo.Id] = new RoundSheetRow[demo.Rounds.Count];
            
            for (var index = 0; index < demo.Rounds.Count; index++)
            {
                var round = demo.Rounds[index];
                var row = new RoundSheetRow
                {
                    Number = round.Number,
                    Tick = round.Tick,
                    Duration = Math.Round(round.Duration, 2),
                    WinnerName = round.WinnerName,
                    WinnerSide = round.WinnerSide,
                    EndReason = round.EndReason,
                    Type = round.Type,
                    SideTrouble = round.SideTrouble,
                    TeamTroubleName = round.TeamTroubleName != string.Empty ? round.TeamTroubleName : string.Empty,
                    KillCount = round.KillCount,
                    OneKillCount = round.OneKillCount,
                    TwoKillCount = round.TwoKillCount,
                    ThreeKillCount = round.ThreeKillCount,
                    FourKillCount = round.FourKillCount,
                    FiveKillCount = round.FiveKillCount,
                    TradeKillCount = round.TradeKillCount,
                    JumpKillCount = round.JumpKillCount,
                    AverageHealthDamagePerPlayer = round.AverageHealthDamagePerPlayer,
                    DamageHealth = round.DamageHealthCount,
                    DamageArmorCount = round.DamageArmorCount,
                    BombExplodedCount = round.BombExplodedCount,
                    BombPlantedCount = round.BombPlantedCount,
                    BombDefusedCount = round.BombDefusedCount,
                    StartMoneyTeamCT = round.StartMoneyTeamCt,
                    StartMoneyTeamT = round.StartMoneyTeamT,
                    EquipmentValueTeamCT = round.EquipementValueTeamCt,
                    EquipmentValueTeamT = round.EquipementValueTeamT,
                    FlashbangCount = round.FlashbangThrownCount,
                    SmokeCount = round.SmokeThrownCount,
                    HeGrenadeCount = round.HeGrenadeThrownCount,
                    DecoyCount = round.DecoyThrownCount,
                    MolotovCount = round.MolotovThrownCount,
                    IncendiaryCount = round.IncendiaryThrownCount,
                };
                _rowsPerDemoId[demo.Id][index] = row;
            }
        }

        public override void Generate()
        {
            foreach (var entry in _rowsPerDemoId)
            {
                var rows = entry.Value;
                foreach (var row in rows)
                {
                    var cells = new List<object>
                    {
                        entry.Key,
                        row.Number,
                        row.Tick,
                        Math.Round(row.Duration, 2),
                        row.WinnerName,
                        row.WinnerSide.AsString(),
                        row.EndReason.AsString(),
                        row.Type.AsString(),
                        row.SideTrouble.AsString(),
                        row.TeamTroubleName != string.Empty ? row.TeamTroubleName : string.Empty,
                        row.KillCount,
                        row.OneKillCount,
                        row.TwoKillCount,
                        row.ThreeKillCount,
                        row.FourKillCount,
                        row.FiveKillCount,
                        row.TradeKillCount,
                        row.JumpKillCount,
                        row.AverageHealthDamagePerPlayer,
                        row.DamageHealth,
                        row.DamageArmorCount,
                        row.BombExplodedCount,
                        row.BombPlantedCount,
                        row.BombDefusedCount,
                        row.StartMoneyTeamCT,
                        row.StartMoneyTeamT,
                        row.EquipmentValueTeamCT,
                        row.EquipmentValueTeamT,
                        row.FlashbangCount,
                        row.SmokeCount,
                        row.HeGrenadeCount,
                        row.DecoyCount,
                        row.MolotovCount,
                        row.IncendiaryCount,
                    };
                    WriteRow(cells);
                }
            }
        }
    }
}
