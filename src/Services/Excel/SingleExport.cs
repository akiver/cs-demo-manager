using System.Threading.Tasks;
using CSGO_Demos_Manager.Models;
using CSGO_Demos_Manager.Services.Excel.Sheets.Single;
using NPOI.SS.UserModel;

namespace CSGO_Demos_Manager.Services.Excel
{
	public class SingleExport : AbstractExport
	{
		private readonly Demo _demo;

		private GeneralSheet _generalSheet;

		private PlayersSheet _playersSheet;

		private RoundsSheet _roundsSheet;

		private OpenKillsRoundSheet _openKillsRoundSheet;

		private OpenKillsPlayerSheet _openKillsPlayerSheet;

		private OpenKillsTeamSheet _openKillsTeamSheet;

		private EntryKillsRoundSheet _entryKillsRoundSheet;

		private EntryKillsPlayerSheet _entryKillsPlayerSheet;

		private EntryKillsTeamSheet _entryKillsTeamSheet;

		public SingleExport(Demo demo)
		{
			_demo = demo;
		}

		public override async Task<IWorkbook> Generate()
		{
			CacheService cacheService = new CacheService();
			_demo.WeaponFired = await cacheService.GetDemoWeaponFiredAsync(_demo);
			_generalSheet = new GeneralSheet(Workbook, _demo);
			await _generalSheet.Generate();
			_playersSheet = new PlayersSheet(Workbook, _demo);
			await _playersSheet.Generate();
			_roundsSheet = new RoundsSheet(Workbook, _demo);
			await _roundsSheet.Generate();
			_openKillsRoundSheet = new OpenKillsRoundSheet(Workbook, _demo);
			await _openKillsRoundSheet.Generate();
			_openKillsPlayerSheet = new OpenKillsPlayerSheet(Workbook, _demo);
			await _openKillsPlayerSheet.Generate();
			_openKillsTeamSheet = new OpenKillsTeamSheet(Workbook, _demo);
			await _openKillsTeamSheet.Generate();
			_entryKillsRoundSheet = new EntryKillsRoundSheet(Workbook, _demo);
			await _entryKillsRoundSheet.Generate();
			_entryKillsPlayerSheet = new EntryKillsPlayerSheet(Workbook, _demo);
			await _entryKillsPlayerSheet.Generate();
			_entryKillsTeamSheet = new EntryKillsTeamSheet(Workbook, _demo);
			await _entryKillsTeamSheet.Generate();

			return Workbook;
		}
	}
}
