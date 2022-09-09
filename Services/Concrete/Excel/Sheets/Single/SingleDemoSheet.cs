using Core.Models;

namespace Services.Concrete.Excel.Sheets.Single
{
    internal abstract class SingleDemoSheet: Sheet
    {
        protected readonly Demo Demo;

        protected SingleDemoSheet(Workbook workbook, Demo demo) : base(workbook)
        {
            Demo = demo;
        }
    }
}
