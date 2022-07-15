using System;
using System.Threading;
using Core.Models.Source;

namespace Services.Concrete.Excel
{
    public class SingleExportConfiguration
    {
        public string DemoPath;
        public string FileName;
        public bool ForceAnalyze = false;
        public Source Source;
        public Action OnProcessingDemo = null;
        public Action OnAnalyzeStart = null;
        public CancellationTokenSource CancellationToken = new CancellationTokenSource();
    }
}
