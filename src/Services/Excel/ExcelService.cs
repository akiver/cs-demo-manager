using System.Collections.Generic;
using System.Threading.Tasks;
using CSGO_Demos_Manager.Models;
using NPOI.SS.UserModel;
using System.IO;

namespace CSGO_Demos_Manager.Services.Excel
{
	public class ExcelService
	{
		public async Task GenerateXls(Demo demo, string fileName)
		{
			SingleExport export = new SingleExport(demo);
			IWorkbook workbook = await export.Generate();
			FileStream sw = File.Create(fileName);
			workbook.Write(sw);
			sw.Close();
		}

		public async Task GenerateXls(List<Demo> demos, string fileName)
		{
			MultipleExport export = new MultipleExport(demos);
			IWorkbook workbook = await export.Generate();
			FileStream sw = File.Create(fileName);
			workbook.Write(sw);
			sw.Close();
		}
	}
}