using System.Collections.Generic;
using System.Linq;
using Core.Models;
using Team = Core.Models.Team;

namespace Services.Concrete.Excel.Sheets.Multiple
{
    internal class TeamsSheet: MultipleDemoSheet
    {
        private readonly Dictionary<string, TeamSheetRow> _rowPerTeamName = new Dictionary<string, TeamSheetRow>();

        protected override string GetName()
        {
            return "Teams";
        }

        protected override string[] GetColumnNames()
        {
            return new[]
            {
                "Name",
                "Match",
                "Win",
                "Lost",
                "Kills",
                "Deaths",
                "Assists",
                "Rounds",
                "Round win",
                "Round lost",
                "Round CT win",
                "Round CT lost",
                "Round T win",
                "Round T lost",
                "Win pistol round",
                "Win eco round",
                "Win semi-eco round",
                "Win force-buy round",
                "Bomb planted",
                "Bomb defused",
                "Bomb exploded",
                "Bomb planted on A",
                "Bomb planted on B",
                "5K",
                "4K",
                "3K",
                "2K",
                "1K",
                "Trade kill",
                "Trade death",
                "Jump kill",
                "Crouch kill",
                "Flash",
                "HE",
                "Smoke",
                "Molotov",
                "Incendiary",
                "Decoy",
            };
        }

        public TeamsSheet(Workbook workbook) : base(workbook)
        {
        }

        public override void AddDemo(Demo demo)
        {
            UpdateTeamStats(demo, demo.TeamCT);
            UpdateTeamStats(demo, demo.TeamT);
        }

        private void UpdateTeamStats(Demo demo, Team team)
        {
            if (!_rowPerTeamName.ContainsKey(team.Name))
            {
                _rowPerTeamName.Add(team.Name, new TeamSheetRow());
            }
            
            var row = _rowPerTeamName[team.Name];
            row.MatchCount++;
            row.KillCount += team.KillCount;
            row.AssistCount += team.AssistCount;
            row.DeathCount += team.DeathCount;
            row.RoundCount += demo.Rounds.Count();
            row.FiveKillCount += team.FiveKillCount;
            row.FourKillCount += team.FourKillCount;
            row.ThreeKillCount += team.ThreeKillCount;
            row.TwoKillCount += team.TwoKillCount;
            row.OneKillCount += team.OneKillCount;
            row.TradeKillCount += team.TradeKillCount;
            row.TradeDeathCount += team.TradeDeathCount;
            row.JumpKillCount += team.JumpKillCount;
            row.CrouchKillCount += team.CrouchKillCount;
            row.FlashbangCount += team.FlashbangThrownCount;
            row.HeGrenadeCount += team.HeGrenadeThrownCount;
            row.SmokeCount += team.SmokeThrownCount;
            row.DecoyCount += team.DecoyThrownCount;
            row.MolotovCount += team.MolotovThrownCount;
            row.IncendiaryCount += team.IncendiaryThrownCount;
            row.BombPlantedCount += team.BombPlantedCount;
            row.BombDefusedCount += team.BombDefusedCount;
            row.BombExplodedCount += team.BombExplodedCount;
            if (demo.Winner != null)
            {
                if (demo.Winner.Equals(team))
                {
                    row.WonCount++;
                }
                else
                {
                    row.LostCount++;
                }
            }

            foreach (var round in demo.Rounds)
            {
                if (round.WinnerName == team.Name)
                {
                    row.RoundWonCount++;
                    if (round.WinnerSide == Side.CounterTerrorist)
                    {
                        row.RoundWonAsCtCount++;
                    }
                    else
                    {
                        row.RoundWonAsTerroCount++;
                    }

                    if (round.SideTrouble != Side.None)
                    {
                        switch (round.Type)
                        {
                            case RoundType.PistolRound:
                                row.PistolRoundWonCount++;
                                break;
                            case RoundType.Eco:
                                row.EcoRoundWonCount++;
                                break;
                            case RoundType.SemiEco:
                                row.SemiEcoRoundWonCount++;
                                break;
                            case RoundType.ForceBuy:
                                row.ForceBuyRoundWonCount++;
                                break;
                        }
                    }
                }
                else
                {
                    row.RoundLostCount++;
                    if (round.WinnerSide == Side.CounterTerrorist)
                    {
                        row.RoundLostAsTerroCount++;
                    }
                    else
                    {
                        row.RoundLostAsCtCount++;
                    }
                }
            }

            foreach (var plantedEvent in demo.BombPlanted)
            {
                if (team.Players.FirstOrDefault(p => p.SteamId == plantedEvent.PlanterSteamId) != null)
                {
                    if (plantedEvent.Site == "A")
                    {
                        row.BombPlantedOnACount++;
                    }
                    else
                    {
                        row.BombPlantedOnBCount++;
                    }
                }
            }
        }

        public override void Generate()
        {
            foreach (var entry in _rowPerTeamName)
            {
                var row = entry.Value;
                var cells = new List<object>
                {
                    entry.Key,
                    row.MatchCount,
                    row.WonCount,
                    row.LostCount,
                    row.KillCount,
                    row.DeathCount,
                    row.AssistCount,
                    row.RoundCount,
                    row.RoundWonCount,
                    row.RoundLostCount,
                    row.RoundWonAsCtCount,
                    row.RoundLostAsCtCount,
                    row.RoundWonAsTerroCount,
                    row.RoundLostAsTerroCount,
                    row.PistolRoundWonCount,
                    row.EcoRoundWonCount,
                    row.SemiEcoRoundWonCount,
                    row.ForceBuyRoundWonCount,
                    row.BombPlantedCount,
                    row.BombDefusedCount,
                    row.BombExplodedCount,
                    row.BombPlantedOnACount,
                    row.BombPlantedOnBCount,
                    row.FiveKillCount,
                    row.FourKillCount,
                    row.ThreeKillCount,
                    row.TwoKillCount,
                    row.OneKillCount,
                    row.TradeKillCount,
                    row.TradeDeathCount,
                    row.JumpKillCount,
                    row.CrouchKillCount,
                    row.FlashbangCount,
                    row.HeGrenadeCount,
                    row.SmokeCount,
                    row.MolotovCount,
                    row.IncendiaryCount,
                    row.DecoyCount,
                };
                WriteRow(cells);
                
            }
        }
    }
}
