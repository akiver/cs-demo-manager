using Core.Models;

namespace Services.Concrete.Excel.Sheets
{
    public abstract class AbstractMultipleSheet : AbstractSheet, IMultipleSheet
    {
        public abstract void AddDemo(Demo demo);
    }
}
