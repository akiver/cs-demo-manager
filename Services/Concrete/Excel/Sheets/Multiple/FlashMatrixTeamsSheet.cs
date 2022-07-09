using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Core.Models;
using NPOI.SS.UserModel;

namespace Services.Concrete.Excel.Sheets.Multiple
{
    public class FlashMatrixTeamsSheet : AbstractMultipleSheet
    {
        /// <summary>
        /// Store teams rows index by team's name
        /// </summary>
        private readonly Dictionary<string, int> _teamsRow = new Dictionary<string, int>();

        /// <summary>
        /// Store teams columns index by team's name
        /// </summary>
        private readonly Dictionary<string, int> _teamsColumn = new Dictionary<string, int>();

        /// <summary>
        /// First row reference used to add teams name
        /// </summary>
        private IRow _firstRow;

        /// <summary>
        /// Current row reference
        /// </summary>
        private IRow _currentRow;

        /// <summary>
        /// Total number of row
        /// </summary>
        private int _rowCount = 1;

        /// <summary>
        /// Total number of column
        /// </summary>
        private int _columnCount = 1;

        public FlashMatrixTeamsSheet(IWorkbook workbook, List<Demo> demos)
        {
            Headers = new Dictionary<string, CellType> { { string.Empty, CellType.String } };
            Demos = demos;
            Sheet = workbook.CreateSheet("Flash matrix teams");
        }

        public override Task GenerateContent()
        {
            // first row containing victims name
            _firstRow = Sheet.CreateRow(0);
            SetCellValue(_firstRow, 0, CellType.String, "Flasher\\Flashed");

            foreach (Demo demo in Demos)
            {
                // create rows and columns with only demo's teams name if this team is not 
                if (!_teamsRow.ContainsKey(demo.TeamCT.Name))
                {
                    CreateRowAndColumnForTeam(demo.TeamCT.Name);
                }

                if (!_teamsRow.ContainsKey(demo.TeamT.Name))
                {
                    CreateRowAndColumnForTeam(demo.TeamT.Name);
                }

                float teamCtvsTeamTDuration = demo.PlayerBlinded
                    .Where(e => e.ThrowerTeamName == demo.TeamCT.Name && e.VictimTeamName == demo.TeamT.Name)
                    .Sum(e => e.Duration);
                float teamTvsTeamCtDuration = demo.PlayerBlinded
                    .Where(e => e.ThrowerTeamName == demo.TeamT.Name && e.VictimTeamName == demo.TeamCT.Name)
                    .Sum(e => e.Duration);
                float teamCTvsTeamCtDuration = demo.PlayerBlinded
                    .Where(e => e.ThrowerTeamName == demo.TeamCT.Name && e.VictimTeamName == demo.TeamCT.Name)
                    .Sum(e => e.Duration);
                float teamTvsTeamTDuration = demo.PlayerBlinded
                    .Where(e => e.ThrowerTeamName == demo.TeamT.Name && e.VictimTeamName == demo.TeamT.Name)
                    .Sum(e => e.Duration);

                // fill value for each cases
                int rowIndex = _teamsRow[demo.TeamCT.Name];
                int columnIndex = _teamsColumn[demo.TeamCT.Name];
                FillValue(rowIndex, columnIndex, teamCTvsTeamCtDuration);

                rowIndex = _teamsRow[demo.TeamCT.Name];
                columnIndex = _teamsColumn[demo.TeamT.Name];
                FillValue(rowIndex, columnIndex, teamCtvsTeamTDuration);

                rowIndex = _teamsRow[demo.TeamT.Name];
                columnIndex = _teamsColumn[demo.TeamT.Name];
                FillValue(rowIndex, columnIndex, teamTvsTeamTDuration);

                rowIndex = _teamsRow[demo.TeamT.Name];
                columnIndex = _teamsColumn[demo.TeamCT.Name];
                FillValue(rowIndex, columnIndex, teamTvsTeamCtDuration);

                FillEmptyCells(_rowCount, _columnCount);
                demo.PlayerBlinded.Clear();
            }

            return Task.CompletedTask;
        }

        private void CreateRowAndColumnForTeam(string teamName)
        {
            // add a column for this team in the first row
            SetCellValue(_firstRow, _columnCount, CellType.String, teamName);
            _teamsRow.Add(teamName, _rowCount);
            // create a row for this team
            _currentRow = Sheet.CreateRow(_rowCount++);
            SetCellValue(_currentRow, 0, CellType.String, teamName);
            _teamsColumn.Add(teamName, _columnCount++);
        }

        private void FillValue(int rowIndex, int columnIndex, float duration)
        {
            _currentRow = Sheet.GetRow(rowIndex);
            ICell cell = _currentRow.GetCell(columnIndex);
            if (cell == null)
            {
                SetCellValue(_currentRow, columnIndex, CellType.Numeric, Math.Round(duration, 2));
            }
            else
            {
                cell.SetCellValue(cell.NumericCellValue + Math.Round(duration, 2));
            }
        }
    }
}
