using System;
using System.Collections.Generic;
using System.Threading;
using Core.Models;
using Core.Models.Source;

namespace Services.Concrete.Excel
{
    public class MultiExportConfiguration
    {
        public List<string> DemoPaths = new List<string>();
        public long FocusSteamId;
        public string FileName;
        public bool ForceAnalyze = false;
        public Source Source;
        public Action<string, int, int> OnProcessingDemo = null;
        public Action<string> OnDemoNotFound = null;
        public Action<string> OnInvalidDemo = null;
        public Action<string> OnAnalyzeStart = null;
        public Action<Demo> OnAnalyzeSuccess = null;
        public Action<string> OnAnalyzeError = null;
        public Action OnGeneratingXlsxFile = null;
        public CancellationTokenSource CancellationToken = new CancellationTokenSource();
    }
}
