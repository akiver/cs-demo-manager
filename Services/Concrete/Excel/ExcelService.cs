using System.IO;
using System.Threading.Tasks;
using NPOI.SS.UserModel;

namespace Services.Concrete.Excel
{
    public class ExcelService
    {
        public async Task GenerateXls(SingleExportConfiguration configuration)
        {
            SingleExport export = new SingleExport(configuration);
            IWorkbook workbook = await export.Generate();
            FileStream sw = File.Create(configuration.FileName);
            workbook.Write(sw);
            sw.Close();
        }

        public async Task GenerateXls(MultiExportConfiguration configuration)
        {
            MultipleExport export = new MultipleExport(configuration);
            IWorkbook workbook = await export.Generate();
            FileStream sw = File.Create(configuration.FileName);
            workbook.Write(sw);
            sw.Close();
        }
    }
}
