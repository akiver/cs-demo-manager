using System.Threading.Tasks;
using Core.Models;
using NPOI.SS.UserModel;
using Services.Concrete.Excel.Sheets.Single;

namespace Services.Concrete.Excel
{
	public class SingleExport : AbstractExport
	{
		private readonly Demo _demo;

		private GeneralSheet _generalSheet;

		private PlayersSheet _playersSheet;

		private RoundsSheet _roundsSheet;

		private EntryHoldKillsRoundSheet _entryHoldKillsRoundSheet;

		private EntryHoldKillsPlayerSheet _entryHoldKillsPlayerSheet;

		private EntryHoldKillsTeamSheet _entryHoldKillsTeamSheet;

		private EntryKillsRoundSheet _entryKillsRoundSheet;

		private EntryKillsPlayerSheet _entryKillsPlayerSheet;

		private EntryKillsTeamSheet _entryKillsTeamSheet;

		private KillsSheet _killsSheet;

		private KillMatrixSheet _killMatrixSheet;

		private FlashMatrixPlayersSheet _flashMatrixPlayersSheet;

		private FlashMatrixTeamsSheet _flashMatrixTeamsSheet;

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
			_killsSheet = new KillsSheet(Workbook, _demo);
			await _killsSheet.Generate();
			_entryHoldKillsRoundSheet = new EntryHoldKillsRoundSheet(Workbook, _demo);
			await _entryHoldKillsRoundSheet.Generate();
			_entryHoldKillsPlayerSheet = new EntryHoldKillsPlayerSheet(Workbook, _demo);
			await _entryHoldKillsPlayerSheet.Generate();
			_entryHoldKillsTeamSheet = new EntryHoldKillsTeamSheet(Workbook, _demo);
			await _entryHoldKillsTeamSheet.Generate();
			_entryKillsRoundSheet = new EntryKillsRoundSheet(Workbook, _demo);
			await _entryKillsRoundSheet.Generate();
			_entryKillsPlayerSheet = new EntryKillsPlayerSheet(Workbook, _demo);
			await _entryKillsPlayerSheet.Generate();
			_entryKillsTeamSheet = new EntryKillsTeamSheet(Workbook, _demo);
			await _entryKillsTeamSheet.Generate();
			_killMatrixSheet = new KillMatrixSheet(Workbook, _demo);
			await _killMatrixSheet.Generate();
			_flashMatrixPlayersSheet = new FlashMatrixPlayersSheet(Workbook, _demo);
			await _flashMatrixPlayersSheet.Generate();
			_flashMatrixTeamsSheet = new FlashMatrixTeamsSheet(Workbook, _demo);
			await _flashMatrixTeamsSheet.Generate();

			return Workbook;
		}
	}
}
