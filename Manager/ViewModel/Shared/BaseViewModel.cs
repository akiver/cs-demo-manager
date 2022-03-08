using System.Diagnostics;
using GalaSoft.MvvmLight;
using GalaSoft.MvvmLight.CommandWpf;

namespace Manager.ViewModel.Shared
{
    public class BaseViewModel : ViewModelBase
    {
        private bool _isBusy;

        private bool _hasNotification;

        private string _notification;

        private RelayCommand<string> _handleHyperLinkCommand;

        public bool HasNotification
        {
            get => _hasNotification;
            set { Set(() => HasNotification, ref _hasNotification, value); }
        }

        public string Notification
        {
            get => _notification;
            set { Set(() => Notification, ref _notification, value); }
        }

        public bool IsBusy
        {
            get => _isBusy;
            set { Set(() => IsBusy, ref _isBusy, value); }
        }

        public RelayCommand<string> HandleHyperLinkCommand
        {
            get
            {
                return _handleHyperLinkCommand
                       ?? (_handleHyperLinkCommand = new RelayCommand<string>(
                           link => { Process.Start(link); }));
            }
        }

        public override void Cleanup()
        {
            base.Cleanup();
            IsBusy = false;
            HasNotification = false;
            Notification = string.Empty;
        }
    }
}
