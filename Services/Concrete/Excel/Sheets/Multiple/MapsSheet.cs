using System.Collections.Generic;
using System.Linq;
using Core.Models;

namespace Services.Concrete.Excel.Sheets.Multiple
{
    internal class MapsSheet: MultipleDemoSheet
    {
        private readonly Dictionary<string, MapSheetRow> _rowPerMapName = new Dictionary<string, MapSheetRow>();
        private readonly long _focusSteamId = 0;

        protected override string GetName()
        {
            return "Maps";
        }

        protected override string[] GetColumnNames()
        {
            return new[]
            {
                "Name",
                "Match",
                "Round",
                "Round win CT",
                "Round win T",
                "Round win pistol round",
                "Round win eco",
                "Round win Semi-eco",
                "Round win force-buy",
                "Bomb planted",
                "Bomb defused",
                "Bomb exploded",
                "Bomb planted on A",
                "Bomb planted on B",
            };
        }

        public MapsSheet(Workbook workbook, long steamId = 0): base(workbook)
        {
            _focusSteamId = steamId;
        }

        public override void AddDemo(Demo demo)
        {
            if (!_rowPerMapName.ContainsKey(demo.MapName))
            {
                _rowPerMapName.Add(demo.MapName, new MapSheetRow());
            }

            var row = _rowPerMapName[demo.MapName];

            if (_focusSteamId == 0)
            {
                ComputeGlobalStats(demo, row);
            }
            else
            {
                var playerInDemo = demo.Players.FirstOrDefault(player => player.SteamId == _focusSteamId);
                if (playerInDemo != null)
                {
                    ComputePlayerStats(demo, row, playerInDemo);
                }
            }
        }

        public override void Generate()
        {
            foreach (var entry in _rowPerMapName)
            {
                var row = entry.Value;
                var cells = new List<object>
                {
                    entry.Key,
                    row.MatchCount,
                    row.RoundCount,
                    row.WinCounterTerroristCount,
                    row.WinTerroristCount,
                    row.WinPistolRoundCount,
                    row.WinEcoRoundCount,
                    row.WinSemiEcoCount,
                    row.WinForceBuyCount,
                    row.BombPlantedCount,
                    row.BombDefusedCount,
                    row.BombExplodedCount,
                    row.BombPlantedOnACount,
                    row.BombPlantedOnBCount,
                };
                WriteRow(cells);
            }
        }

        private static void ComputeGlobalStats(Demo demo, MapSheetRow row)
        {
            row.MatchCount++;
            row.RoundCount += demo.Rounds.Count();
            row.BombPlantedCount += demo.BombPlantedCount;
            row.BombDefusedCount += demo.BombDefusedCount;
            row.BombExplodedCount += demo.BombExplodedCount;
            row.BombPlantedOnACount += demo.BombPlanted.Count(bomb => bomb.Site == "A");
            row.BombPlantedOnBCount += demo.BombPlanted.Count(bomb => bomb.Site == "B");
            row.WinCounterTerroristCount += demo.Rounds.Count(round => round.WinnerSide == Side.CounterTerrorist);
            row.WinTerroristCount += demo.Rounds.Count(round => round.WinnerSide == Side.Terrorist);
            var roundsWonByTeamInTrouble = demo.Rounds.Where(round => round.WinnerSide == round.SideTrouble).ToList();
            row.WinEcoRoundCount += roundsWonByTeamInTrouble.Count(round => round.Type == RoundType.Eco);
            row.WinSemiEcoCount += roundsWonByTeamInTrouble.Count(round => round.Type == RoundType.SemiEco);
            row.WinForceBuyCount += roundsWonByTeamInTrouble.Count(round => round.Type == RoundType.ForceBuy);
            row.WinPistolRoundCount += roundsWonByTeamInTrouble.Count(round => round.Type == RoundType.PistolRound);
        }

        private void ComputePlayerStats(Demo demo, MapSheetRow row, Player player)
        {
            row.MatchCount++;
            row.RoundCount += demo.Rounds.Count();
            row.BombPlantedCount += demo.BombPlanted.Count(bomb => bomb.PlanterSteamId == _focusSteamId);
            row.BombDefusedCount += demo.BombDefused.Count(bomb => bomb.DefuserSteamId == _focusSteamId);
            row.BombExplodedCount += demo.BombExploded.Count(bomb => bomb.PlanterSteamId == _focusSteamId);
            row.BombPlantedOnACount += demo.BombPlanted.Count(bomb => bomb.PlanterSteamId == _focusSteamId && bomb.Site == "A");
            row.BombPlantedOnBCount += demo.BombPlanted.Count(bomb => bomb.PlanterSteamId == _focusSteamId && bomb.Site == "B");
            var roundsWon = demo.Rounds.Where(round => round.WinnerName == player.TeamName).ToList();
            row.WinCounterTerroristCount += roundsWon.Count(round => round.WinnerSide == Side.CounterTerrorist);
            row.WinTerroristCount += roundsWon.Count(round => round.WinnerSide == Side.Terrorist);
            var roundsWonByTeamInTrouble = roundsWon.Where(round => round.WinnerSide == round.SideTrouble).ToList();
            row.WinEcoRoundCount += roundsWonByTeamInTrouble.Count(round => round.Type == RoundType.Eco);
            row.WinSemiEcoCount += roundsWonByTeamInTrouble.Count(round => round.Type == RoundType.SemiEco);
            row.WinForceBuyCount += roundsWonByTeamInTrouble.Count(round => round.Type == RoundType.ForceBuy);
            row.WinPistolRoundCount += roundsWonByTeamInTrouble.Count(round => round.Type == RoundType.PistolRound);
        }
    }
}
