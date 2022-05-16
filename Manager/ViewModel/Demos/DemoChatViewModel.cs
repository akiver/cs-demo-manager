using System.Windows.Forms;
using GalaSoft.MvvmLight.Command;
using Services.Interfaces;

namespace Manager.ViewModel.Demos
{
    public class DemoChatViewModel : DemoViewModel
    {
        private readonly IDemosService _demosService;
        private RelayCommand _exportCommand;

        public DemoChatViewModel(IDemosService demosService)
        {
            _demosService = demosService;
        }

        public RelayCommand ExportCommand
        {
            get
            {
                return _exportCommand
                       ?? (_exportCommand = new RelayCommand(
                           () =>
                           {
                               SaveFileDialog exportDialog = new SaveFileDialog
                               {
                                   FileName = Demo.Name.Substring(0, Demo.Name.Length - 4) + "-chat.txt",
                                   Filter = "Text file (*.txt)|*.txt",
                               };
                               if (exportDialog.ShowDialog() == DialogResult.OK)
                               {
                                   _demosService.WriteChatFile(Demo, exportDialog.FileName);
                               }
                           }, () => Demo != null));
            }
        }
    }
}
