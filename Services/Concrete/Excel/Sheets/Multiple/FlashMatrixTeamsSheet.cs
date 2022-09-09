using System;
using System.Collections.Generic;
using System.Linq;
using Core.Models;
using Core.Models.Events;

namespace Services.Concrete.Excel.Sheets.Multiple
{
    internal class TeamMatrixData
    {
        public string Name { get; set; }

        public Dictionary<string, float> Durations { get; set; }
    }

    internal class FlashMatrixTeamsSheet: MultipleDemoSheet
    {
        private readonly List<TeamMatrixData> _matrixData = new List<TeamMatrixData>();
        private readonly List<string> _teamNames = new List<string>();

        protected override string GetName()
        {
            return "Flash matrix teams";
        }

        protected override string[] GetColumnNames()
        {
            return new string[] { };
        }

        public FlashMatrixTeamsSheet(Workbook workbook): base(workbook)
        {
        }

        public override void AddDemo(Demo demo)
        {
            List<PlayerBlindedEvent> blindEvents = demo.PlayerBlinded.ToList();
            ComputeTeamStats(demo.TeamCT, demo.TeamT, blindEvents);
            ComputeTeamStats(demo.TeamT, demo.TeamCT, blindEvents);
        }

        public override void Generate()
        {
            _teamNames.Sort();

            var firstRowCells = new List<object> { "Flasher\\Flashed" };
            foreach (var teamName in _teamNames)
            {
                firstRowCells.Add(teamName);
            }
            WriteRow(firstRowCells);


            foreach (var flasherTeamName in _teamNames)
            {
                var cells = new List<object> { flasherTeamName };
                foreach (var flashedTeamName in _teamNames)
                {
                    var flasherEntry = _matrixData.Find(p => p.Name == flasherTeamName);
                    var duration = 0d;
                    if (flasherEntry != null && flasherEntry.Durations.ContainsKey(flashedTeamName))
                    {
                        duration = Math.Round(flasherEntry.Durations[flashedTeamName], 2);
                    }
                    cells.Add(duration);
                }

                WriteRow(cells);
            }
        }

        private void ComputeTeamStats(Team team, Team oppositeTeam, List<PlayerBlindedEvent> blindEvents)
        {
            if (!_teamNames.Contains(team.Name))
            {
                _teamNames.Add(team.Name);
            }

            var teamData = _matrixData.Find(data => data.Name == team.Name);
            if (teamData == null)
            {
                teamData = new TeamMatrixData
                {
                    Name = team.Name,
                    Durations = new Dictionary<string, float>(),
                };
                _matrixData.Add(teamData);
            }

            float oppositeTeamDuration = blindEvents
                .Where(e => e.ThrowerTeamName == team.Name && e.VictimTeamName == oppositeTeam.Name)
                .Sum(e => e.Duration);
            float selfDuration = blindEvents
                .Where(e => e.ThrowerTeamName == team.Name && e.VictimTeamName == team.Name)
                .Sum(e => e.Duration);

            if (teamData.Durations.ContainsKey(oppositeTeam.Name))
            {
                teamData.Durations[oppositeTeam.Name] += oppositeTeamDuration;
            }
            else
            {
                teamData.Durations.Add(oppositeTeam.Name, oppositeTeamDuration);
            }

            if (teamData.Durations.ContainsKey(team.Name))
            {
                teamData.Durations[team.Name] += selfDuration;
            }
            else
            {
                teamData.Durations.Add(team.Name, selfDuration);
            }
        }
    }
}
