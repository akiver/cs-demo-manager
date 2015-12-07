using System.Threading.Tasks;
using NPOI.SS.UserModel;
using NPOI.XSSF.UserModel;

namespace CSGO_Demos_Manager.Services.Excel
{
	public abstract class AbstractExport
	{
		protected readonly IWorkbook Workbook = new XSSFWorkbook();

		public abstract Task<IWorkbook> Generate();
	}
}
