using System.Threading.Tasks;
using CSGO_Demos_Manager.Models;
using NPOI.SS.UserModel;
using NPOI.XSSF.UserModel;
using System.IO;
using CSGO_Demos_Manager.Services.Excel.Sheets;

namespace CSGO_Demos_Manager.Services.Excel
{
	public class ExcelService
	{
		private GeneralSheet _generalSheet;

		private PlayersSheet _playersSheet;

		private RoundsSheet _roundsSheet;

		private ShootsSheet _shootsSheet;

		private OpenKillsRoundSheet _openKillsRoundSheet;

		private OpenKillsPlayerSheet _openKillsPlayerSheet;

		private OpenKillsTeamSheet _openKillsTeamSheet;

		private EntryKillsRoundSheet _entryKillsRoundSheet;

		private EntryKillsPlayerSheet _entryKillsPlayerSheet;

		private EntryKillsTeamSheet _entryKillsTeamSheet;


		public async Task GenerateXls(Demo demo, string fileName)
		{
			IWorkbook workbook = new XSSFWorkbook();
			_generalSheet = new GeneralSheet(workbook, demo);
			await _generalSheet.Generate();
			_playersSheet = new PlayersSheet(workbook, demo);
			await _playersSheet.Generate();
			_roundsSheet = new RoundsSheet(workbook, demo);
			await _roundsSheet.Generate();
			_shootsSheet = new ShootsSheet(workbook, demo);
			await _shootsSheet.Generate();
			_openKillsRoundSheet = new OpenKillsRoundSheet(workbook, demo);
			await _openKillsRoundSheet.Generate();
			_openKillsPlayerSheet = new OpenKillsPlayerSheet(workbook, demo);
			await _openKillsPlayerSheet.Generate();
			_openKillsTeamSheet = new OpenKillsTeamSheet(workbook, demo);
			await _openKillsTeamSheet.Generate();
			_entryKillsRoundSheet = new EntryKillsRoundSheet(workbook, demo);
			await _entryKillsRoundSheet.Generate();
			_entryKillsPlayerSheet = new EntryKillsPlayerSheet(workbook, demo);
			await _entryKillsPlayerSheet.Generate();
			_entryKillsTeamSheet = new EntryKillsTeamSheet(workbook, demo);
			await _entryKillsTeamSheet.Generate();

			FileStream sw = File.Create(fileName);
			workbook.Write(sw);
			sw.Close();
		}
	}
}