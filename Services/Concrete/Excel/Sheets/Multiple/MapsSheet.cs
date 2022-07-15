using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Core.Models;
using NPOI.SS.UserModel;

namespace Services.Concrete.Excel.Sheets.Multiple
{
    public class MapsSheet : AbstractMultipleSheet
    {
        private readonly List<Map> _maps = new List<Map>();
        private readonly long _focusSteamId = 0;

        public MapsSheet(IWorkbook workbook, long steamId = 0)
        {
            _focusSteamId = steamId;
            Headers = new Dictionary<string, CellType>()
            {
                { "Name", CellType.String },
                { "Match", CellType.Numeric },
                { "Round", CellType.Numeric },
                { "Round win CT", CellType.Numeric },
                { "Round win T", CellType.Numeric },
                { "Round win pistol round", CellType.Numeric },
                { "Round win eco", CellType.Numeric },
                { "Round win Semi-eco", CellType.Numeric },
                { "Round win force-buy", CellType.Numeric },
                { "Bomb planted", CellType.Numeric },
                { "Bomb defused", CellType.Numeric },
                { "Bomb exploded", CellType.Numeric },
                { "Bomb planted on A", CellType.Numeric },
                { "Bomb planted on B", CellType.Numeric },
            };
            Sheet = workbook.CreateSheet("Maps");
        }

        public override void AddDemo(Demo demo)
        {
            Map map = _maps.Find(m => m.Name == demo.MapName);
            bool isUnknownMap = map == null;
            if (isUnknownMap)
            {
                map = new Map
                {
                    Name = demo.MapName,
                };
            }

            if (_focusSteamId != 0)
            {
                Player playerInDemo = demo.Players.FirstOrDefault(player => player.SteamId == _focusSteamId);
                if (playerInDemo != null)
                {
                    ComputePlayerStats(demo, map, playerInDemo);
                    if (isUnknownMap)
                    {
                        _maps.Add(map);
                    }
                }
            }
            else
            {
                ComputeGlobalStats(demo, map);
                if (isUnknownMap)
                {
                    _maps.Add(map);
                }
            }
        }

        protected override Task GenerateContent()
        {
            int rowCount = 1;
            foreach (Map map in _maps)
            {
                IRow row = Sheet.CreateRow(rowCount++);
                int columnNumber = 0;
                SetCellValue(row, columnNumber++, CellType.String, map.Name);
                SetCellValue(row, columnNumber++, CellType.String, map.MatchCount);
                SetCellValue(row, columnNumber++, CellType.Numeric, map.RoundCount);
                SetCellValue(row, columnNumber++, CellType.Numeric, map.WinCounterTerroritsCount);
                SetCellValue(row, columnNumber++, CellType.Numeric, map.WinTerroristCount);
                SetCellValue(row, columnNumber++, CellType.Numeric, map.WinPistolRoundCount);
                SetCellValue(row, columnNumber++, CellType.Numeric, map.WinEcoRoundCount);
                SetCellValue(row, columnNumber++, CellType.Numeric, map.WinSemiEcoCount);
                SetCellValue(row, columnNumber++, CellType.Numeric, map.WinForceBuyCount);
                SetCellValue(row, columnNumber++, CellType.Numeric, map.BombPlantedCount);
                SetCellValue(row, columnNumber++, CellType.Numeric, map.BombDefusedCount);
                SetCellValue(row, columnNumber++, CellType.Numeric, map.BombExplodedCount);
                SetCellValue(row, columnNumber++, CellType.Numeric, map.BombPlantedOnACount);
                SetCellValue(row, columnNumber, CellType.Numeric, map.BombPlantedOnBCount);
            }

            return Task.CompletedTask;
        }

        private void ComputeGlobalStats(Demo demo, Map map)
        {
            map.MatchCount++;
            map.RoundCount += demo.Rounds.Count();
            map.BombPlantedCount += demo.BombPlantedCount;
            map.BombDefusedCount += demo.BombDefusedCount;
            map.BombExplodedCount += demo.BombExplodedCount;
            map.BombPlantedOnACount += demo.BombPlanted.Count(bomb => bomb.Site == "A");
            map.BombPlantedOnBCount += demo.BombPlanted.Count(bomb => bomb.Site == "B");
            map.WinCounterTerroritsCount += demo.Rounds.Count(round => round.WinnerSide == Side.CounterTerrorist);
            map.WinTerroristCount += demo.Rounds.Count(round => round.WinnerSide == Side.Terrorist);
            List<Round> roundsWonByTeamInTrouble = demo.Rounds.Where(round => round.WinnerSide == round.SideTrouble).ToList();
            map.WinEcoRoundCount += roundsWonByTeamInTrouble.Count(round => round.Type == RoundType.ECO);
            map.WinSemiEcoCount += roundsWonByTeamInTrouble.Count(round => round.Type == RoundType.SEMI_ECO);
            map.WinForceBuyCount += roundsWonByTeamInTrouble.Count(round => round.Type == RoundType.FORCE_BUY);
            map.WinPistolRoundCount += roundsWonByTeamInTrouble.Count(round => round.Type == RoundType.PISTOL_ROUND);
        }

        private void ComputePlayerStats(Demo demo, Map map, Player player)
        {
            map.MatchCount++;
            map.RoundCount += demo.Rounds.Count();
            map.BombPlantedCount += demo.BombPlanted.Count(bomb => bomb.PlanterSteamId == _focusSteamId);
            map.BombDefusedCount += demo.BombDefused.Count(bomb => bomb.DefuserSteamId == _focusSteamId);
            map.BombExplodedCount += demo.BombExploded.Count(bomb => bomb.PlanterSteamId == _focusSteamId);
            map.BombPlantedOnACount += demo.BombPlanted.Count(bomb => bomb.PlanterSteamId == _focusSteamId && bomb.Site == "A");
            map.BombPlantedOnBCount += demo.BombPlanted.Count(bomb => bomb.PlanterSteamId == _focusSteamId && bomb.Site == "B");
            List<Round> roundsWon = demo.Rounds.Where(round => round.WinnerName == player.TeamName).ToList();
            map.WinCounterTerroritsCount += roundsWon.Count(round => round.WinnerSide == Side.CounterTerrorist);
            map.WinTerroristCount += roundsWon.Count(round => round.WinnerSide == Side.Terrorist);
            List<Round> roundsWonByTeamInTrouble = roundsWon.Where(round => round.WinnerSide == round.SideTrouble).ToList();
            map.WinEcoRoundCount += roundsWonByTeamInTrouble.Count(round => round.Type == RoundType.ECO);
            map.WinSemiEcoCount += roundsWonByTeamInTrouble.Count(round => round.Type == RoundType.SEMI_ECO);
            map.WinForceBuyCount += roundsWonByTeamInTrouble.Count(round => round.Type == RoundType.FORCE_BUY);
            map.WinPistolRoundCount += roundsWonByTeamInTrouble.Count(round => round.Type == RoundType.PISTOL_ROUND);
        }
    }
}
