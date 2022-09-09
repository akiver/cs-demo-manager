using System.Threading.Tasks;

namespace Services.Concrete.Excel
{
    public class ExcelService
    {
        public async Task GenerateXls(SingleExportConfiguration configuration)
        {
            await Task.Run(async () =>
            {
                var workbook = new Workbook();
                try
                {
                    SingleExport export = new SingleExport(workbook, configuration);
                    await export.Generate();
                    workbook.Write(configuration.FileName);
                }
                finally
                {
                    workbook.Dispose();
                }
            }, configuration.CancellationToken.Token);
        }

        public async Task GenerateXls(MultiExportConfiguration configuration)
        {
            await Task.Run(async () =>
            {
                var workbook = new Workbook();
                try
                {
                    MultipleExport export = new MultipleExport(workbook, configuration);
                    await export.Generate();
                    workbook.Write(configuration.FileName);
                }
                finally
                {
                    workbook.Dispose();
                }
            }, configuration.CancellationToken.Token);
        }
    }
}
