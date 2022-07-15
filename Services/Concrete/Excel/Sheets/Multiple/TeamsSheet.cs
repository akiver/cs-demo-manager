using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;
using Core.Models;
using Core.Models.Events;
using NPOI.SS.UserModel;
using Team = Core.Models.Team;

namespace Services.Concrete.Excel.Sheets.Multiple
{
    public class TeamsSheet : AbstractMultipleSheet
    {
        List<Team> _teams = new List<Team>();

        public TeamsSheet(IWorkbook workbook)
        {
            Headers = new Dictionary<string, CellType>()
            {
                { "Name", CellType.String },
                { "Match", CellType.Numeric },
                { "Win", CellType.Numeric },
                { "Lost", CellType.Numeric },
                { "Kills", CellType.Numeric },
                { "Deaths", CellType.Numeric },
                { "Assists", CellType.Numeric },
                { "Rounds", CellType.Numeric },
                { "Round win", CellType.Numeric },
                { "Round lost", CellType.Numeric },
                { "Round CT win", CellType.Numeric },
                { "Round CT lost", CellType.Numeric },
                { "Round T win", CellType.Numeric },
                { "Round T lost", CellType.Numeric },
                { "Win pistol round", CellType.Numeric },
                { "Win eco round", CellType.Numeric },
                { "Win semi-eco round", CellType.Numeric },
                { "Win force-buy round", CellType.Numeric },
                { "Bomb planted", CellType.Numeric },
                { "Bomb defused", CellType.Numeric },
                { "Bomb exploded", CellType.Numeric },
                { "Bomb planted on A", CellType.Numeric },
                { "Bomb planted on B", CellType.Numeric },
                { "5K", CellType.Numeric },
                { "4K", CellType.Numeric },
                { "3K", CellType.Numeric },
                { "2K", CellType.Numeric },
                { "1K", CellType.Numeric },
                { "Trade kill", CellType.Numeric },
                { "Trade death", CellType.Numeric },
                { "Jump kill", CellType.Numeric },
                { "Crouch kill", CellType.Numeric },
                { "Flash", CellType.Numeric },
                { "HE", CellType.Numeric },
                { "Smoke", CellType.Numeric },
                { "Molotov", CellType.Numeric },
                { "Incendiary", CellType.Numeric },
                { "Decoy", CellType.Numeric },
            };
            Sheet = workbook.CreateSheet("Teams");
        }

        public override void AddDemo(Demo demo)
        {
            if (_teams.Contains(demo.TeamCT))
            {
                Team team = _teams.First(t => t.Equals(demo.TeamCT));
                UpdateTeamStats(demo, team);
            }
            else
            {
                Team team = demo.TeamCT.Clone();
                InitTeam(demo, team);
                _teams.Add(team);
            }

            if (_teams.Contains(demo.TeamT))
            {
                Team team = _teams.First(t => t.Equals(demo.TeamT));
                UpdateTeamStats(demo, team);
            }
            else
            {
                Team team = demo.TeamT.Clone();
                InitTeam(demo, team);
                _teams.Add(team);
            }
        }

        protected override Task GenerateContent()
        {
            int rowCount = 1;
            foreach (Team team in _teams)
            {
                IRow row = Sheet.CreateRow(rowCount++);
                int columnNumber = 0;
                SetCellValue(row, columnNumber++, CellType.String, team.Name);
                SetCellValue(row, columnNumber++, CellType.Numeric, team.MatchCount);
                SetCellValue(row, columnNumber++, CellType.Numeric, team.WinCount);
                SetCellValue(row, columnNumber++, CellType.Numeric, team.LostCount);
                SetCellValue(row, columnNumber++, CellType.Numeric, team.KillCount);
                SetCellValue(row, columnNumber++, CellType.Numeric, team.DeathCount);
                SetCellValue(row, columnNumber++, CellType.Numeric, team.AssistCount);
                SetCellValue(row, columnNumber++, CellType.Numeric, team.RoundCount);
                SetCellValue(row, columnNumber++, CellType.Numeric, team.WinRoundCount);
                SetCellValue(row, columnNumber++, CellType.Numeric, team.LostRoundCount);
                SetCellValue(row, columnNumber++, CellType.Numeric, team.WinRoundCtCount);
                SetCellValue(row, columnNumber++, CellType.Numeric, team.LostRoundCtCount);
                SetCellValue(row, columnNumber++, CellType.Numeric, team.WinRoundTCount);
                SetCellValue(row, columnNumber++, CellType.Numeric, team.LostRoundTCount);
                SetCellValue(row, columnNumber++, CellType.Numeric, team.WinPistolRoundCount);
                SetCellValue(row, columnNumber++, CellType.Numeric, team.WinEcoRoundCount);
                SetCellValue(row, columnNumber++, CellType.Numeric, team.WinSemiEcoRoundCount);
                SetCellValue(row, columnNumber++, CellType.Numeric, team.WinForceBuyRoundCount);
                SetCellValue(row, columnNumber++, CellType.Numeric, team.BombPlantedCount);
                SetCellValue(row, columnNumber++, CellType.Numeric, team.BombDefusedCount);
                SetCellValue(row, columnNumber++, CellType.Numeric, team.BombExplodedCount);
                SetCellValue(row, columnNumber++, CellType.Numeric, team.BombPlantedOnACount);
                SetCellValue(row, columnNumber++, CellType.Numeric, team.BombPlantedOnBCount);
                SetCellValue(row, columnNumber++, CellType.Numeric, team.FiveKillCount);
                SetCellValue(row, columnNumber++, CellType.Numeric, team.FourKillCount);
                SetCellValue(row, columnNumber++, CellType.Numeric, team.ThreeKillCount);
                SetCellValue(row, columnNumber++, CellType.Numeric, team.TwoKillCount);
                SetCellValue(row, columnNumber++, CellType.Numeric, team.OneKillCount);
                SetCellValue(row, columnNumber++, CellType.Numeric, team.TradeKillCount);
                SetCellValue(row, columnNumber++, CellType.Numeric, team.TradeDeathCount);
                SetCellValue(row, columnNumber++, CellType.Numeric, team.JumpKillCount);
                SetCellValue(row, columnNumber++, CellType.Numeric, team.CrouchKillCount);
                SetCellValue(row, columnNumber++, CellType.Numeric, team.FlashbangThrownCount);
                SetCellValue(row, columnNumber++, CellType.Numeric, team.HeGrenadeThrownCount);
                SetCellValue(row, columnNumber++, CellType.Numeric, team.SmokeThrownCount);
                SetCellValue(row, columnNumber++, CellType.Numeric, team.MolotovThrownCount);
                SetCellValue(row, columnNumber++, CellType.Numeric, team.IncendiaryThrownCount);
                SetCellValue(row, columnNumber, CellType.Numeric, team.DecoyThrownCount);
            }

            return Task.CompletedTask;
        }


        /// <summary>
        /// Initialize team values for the first time
        /// </summary>
        /// <param name="demo"></param>
        /// <param name="team"></param>
        private static void InitTeam(Demo demo, Team team)
        {
            team.RoundCount = demo.Rounds.Count();
            UpdateWinner(demo, team);
            UpdateRoundsStats(demo, team);
            UpdateBombStats(demo, team);
        }

        /// <summary>
        /// Update team's stats
        /// </summary>
        /// <param name="demo"></param>
        /// <param name="team"></param>
        private static void UpdateTeamStats(Demo demo, Team team)
        {
            team.MatchCount++;
            team.RoundCount += demo.Rounds.Count();
            team.Players = demo.TeamCT.Equals(team)
                ? new ObservableCollection<Player>(demo.TeamCT.Players.Concat(team.Players).ToList())
                : new ObservableCollection<Player>(demo.TeamT.Players.Concat(team.Players).ToList());
            UpdateWinner(demo, team);
            UpdateRoundsStats(demo, team);
            UpdateBombStats(demo, team);
        }

        private static void UpdateWinner(Demo demo, Team team)
        {
            if (demo.Winner == null)
            {
                return;
            }

            if (demo.Winner.Equals(team))
            {
                team.WinCount++;
            }
            else
            {
                team.LostCount++;
            }
        }

        private static void UpdateRoundsStats(Demo demo, Team team)
        {
            foreach (Round round in demo.Rounds)
            {
                if (round.WinnerName == team.Name)
                {
                    team.WinRoundCount++;
                    if (round.WinnerSide == Side.CounterTerrorist)
                    {
                        team.WinRoundCtCount++;
                    }
                    else
                    {
                        team.WinRoundTCount++;
                    }

                    if (round.SideTrouble != Side.None)
                    {
                        switch (round.Type)
                        {
                            case RoundType.PISTOL_ROUND:
                                team.WinPistolRoundCount++;
                                break;
                            case RoundType.ECO:
                                team.WinEcoRoundCount++;
                                break;
                            case RoundType.SEMI_ECO:
                                team.WinSemiEcoRoundCount++;
                                break;
                            case RoundType.FORCE_BUY:
                                team.WinForceBuyRoundCount++;
                                break;
                        }
                    }
                }
                else
                {
                    team.LostRoundCount++;
                    if (round.WinnerSide == Side.CounterTerrorist)
                    {
                        team.LostRoundTCount++;
                    }
                    else
                    {
                        team.LostRoundCtCount++;
                    }
                }
            }
        }

        private static void UpdateBombStats(Demo demo, Team team)
        {
            foreach (BombPlantedEvent plantedEvent in demo.BombPlanted)
            {
                if (team.Players.FirstOrDefault(p => p.SteamId == plantedEvent.PlanterSteamId) != null)
                {
                    if (plantedEvent.Site == "A")
                    {
                        team.BombPlantedOnACount++;
                    }
                    else
                    {
                        team.BombPlantedOnBCount++;
                    }
                }
            }
        }
    }
}
