using System;
using System.Collections.Generic;
using System.Linq;
using Core.Models;
using Core.Models.Events;
using NPOI.SS.UserModel;

namespace Services.Concrete.Excel.Sheets.Multiple
{
    internal class TeamMatrixData
    {
        public string Name { get; set; }

        public Dictionary<string, float> Durations { get; set; }
    }

    public class FlashMatrixTeamsSheet : AbstractMultipleSheet
    {
        private readonly List<TeamMatrixData> _matrixData = new List<TeamMatrixData>();
        private readonly List<string> _teamNames = new List<string>();

        public FlashMatrixTeamsSheet(IWorkbook workbook)
        {
            Headers = new Dictionary<string, CellType> { { string.Empty, CellType.String } };
            Sheet = workbook.CreateSheet("Flash matrix teams");
        }

        public override void AddDemo(Demo demo)
        {
            List<PlayerBlindedEvent> blindEvents = demo.PlayerBlinded.ToList();
            ComputeTeamStats(demo.TeamCT, demo.TeamT, blindEvents);
            ComputeTeamStats(demo.TeamT, demo.TeamCT, blindEvents);
        }

        protected override void GenerateContent()
        {
            _teamNames.Sort();

            IRow firstRow = Sheet.CreateRow(0);
            SetCellValue(firstRow, 0, CellType.String, "Flasher\\Flashed");

            int rowNumber = 1;
            int columnNumber = 1;
            foreach (string teamName in _teamNames)
            {
                TeamMatrixData teamData = _matrixData.Find(data => data.Name == teamName);
                SetCellValue(firstRow, columnNumber++, CellType.String, teamData.Name);

                IRow row = Sheet.CreateRow(rowNumber++);
                SetCellValue(row, 0, CellType.String, teamData.Name);

                int killColumnNumber = 1;
                foreach (var teamNameColumn in _teamNames)
                {
                    double duration = teamData.Durations.ContainsKey(teamNameColumn) ? Math.Round(teamData.Durations[teamNameColumn], 2) : 0;
                    SetCellValue(row, killColumnNumber++, CellType.Numeric, duration);
                }
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
