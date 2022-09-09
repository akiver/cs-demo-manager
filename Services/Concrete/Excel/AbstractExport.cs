using System.Threading.Tasks;

namespace Services.Concrete.Excel
{
    public abstract class AbstractExport
    {
        protected readonly Workbook Workbook;

        protected AbstractExport(Workbook workbook)
        {
            Workbook = workbook;
        }

        public abstract Task Generate();
    }
}
