using System.Collections.Generic;
using System.Threading.Tasks;
using CSGO_Demos_Manager.Models;
using CSGO_Demos_Manager.Services.Excel.Sheets.Multiple;
using NPOI.SS.UserModel;

namespace CSGO_Demos_Manager.Services.Excel
{
	public class MultipleExport : AbstractExport
	{
		private readonly List<Demo> _demos;
		 
		private GeneralSheet _generalSheet;

		private PlayersSheet _playersSheet;

		private MapsSheet _mapsSheet;

		private TeamsSheet _teamsSheet;

		private WeaponsSheet _weaponsSheet;

		public MultipleExport(List<Demo> demos)
		{
			_demos = demos;
		}

		public override async Task<IWorkbook> Generate()
		{
			_generalSheet = new GeneralSheet(Workbook, _demos);
			await _generalSheet.Generate();
			_playersSheet = new PlayersSheet(Workbook, _demos);
			await _playersSheet.Generate();
			_mapsSheet = new MapsSheet(Workbook, _demos);
			await _mapsSheet.Generate();
			_teamsSheet = new TeamsSheet(Workbook, _demos);
			await _teamsSheet.Generate();
			_weaponsSheet = new WeaponsSheet(Workbook, _demos);
			await _weaponsSheet.Generate();

			return Workbook;
		}
	}
}
