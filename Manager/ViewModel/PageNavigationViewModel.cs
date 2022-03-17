using System.Windows.Controls;
using GalaSoft.MvvmLight;
using GalaSoft.MvvmLight.Messaging;
using Manager.Messages;
using Manager.Views.Demos;
using Manager.Views.Suspects;

namespace Manager.ViewModel
{
    public class PageNavigationViewModel: ViewModelBase
    {
        private UserControl _currentPage;

        public UserControl CurrentPage
        {
            get { return _currentPage; }
            set { Set(() => CurrentPage, ref _currentPage, value); }
        }

        public PageNavigationViewModel()
        {
            switch (App.StartUpWindow)
            {
                case "suspects":
                    SuspectListView suspectsView = new SuspectListView();
                    CurrentPage = suspectsView;
                    break;
                case "demo":
                    DemoDetailsView demoDetails = new DemoDetailsView();
                    CurrentPage = demoDetails;
                    break;
                default:
                    DemoListView demoListView = new DemoListView();
                    CurrentPage = demoListView;
                    break;
            }

            Messenger.Default.Register<ShowPageMessage>(this, HandleShowPageMessage);
        }

        private void HandleShowPageMessage(ShowPageMessage msg)
        {
            CurrentPage = msg.Page;
        }
    }
}
