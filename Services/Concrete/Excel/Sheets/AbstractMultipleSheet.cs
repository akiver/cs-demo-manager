using System.Collections.Generic;
using Core.Models;

namespace Services.Concrete.Excel.Sheets
{
    public abstract class AbstractMultipleSheet : AbstractSheet
    {
        public List<Demo> Demos;

        public long SteamId { get; set; }
    }
}
