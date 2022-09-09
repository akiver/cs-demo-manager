using Core.Models;

namespace Services.Concrete.Excel.Sheets.Multiple
{
    internal abstract class MultipleDemoSheet: Sheet
    {
        public abstract void AddDemo(Demo demo);

        protected MultipleDemoSheet(Workbook workbook) : base(workbook)
        {
        }
    }
}
