using GalaSoft.MvvmLight.Command;
using Manager.Internals;
using Manager.ViewModel.Shared;

namespace Manager.ViewModel.Accounts
{
    public class AccountViewModel: BaseViewModel
    {
        private RelayCommand _showDemoListCommand;

        private RelayCommand _goToOverallCommand;

        private RelayCommand _goToMapCommand;

        private RelayCommand _goToWeaponCommand;

        private RelayCommand _goToRankCommand;

        private RelayCommand _goToProgressCommand;

        public RelayCommand ShowDemoListCommand
        {
            get
            {
                return _showDemoListCommand
                       ?? (_showDemoListCommand = new RelayCommand(
                           () =>
                           {
                               Navigation.ShowDemoList();
                               Cleanup();
                           }));
            }
        }

        public RelayCommand GoToOverallCommand
        {
            get
            {
                return _goToOverallCommand
                       ?? (_goToOverallCommand = new RelayCommand(
                           () =>
                           {
                               Navigation.ShowAccountOverall();
                               Cleanup();
                           }));
            }
        }

        public RelayCommand GoToMapCommand
        {
            get
            {
                return _goToMapCommand
                       ?? (_goToMapCommand = new RelayCommand(
                           () =>
                           {
                               Navigation.ShowAccountMaps();
                               Cleanup();
                           }));
            }
        }

        public RelayCommand GoToWeaponCommand
        {
            get
            {
                return _goToWeaponCommand
                       ?? (_goToWeaponCommand = new RelayCommand(
                           () =>
                           {
                               Navigation.ShowAccountWeapons();
                               Cleanup();
                           }));
            }
        }


        public RelayCommand GoToRankCommand
        {
            get
            {
                return _goToRankCommand
                       ?? (_goToRankCommand = new RelayCommand(
                           () =>
                           {
                               Navigation.ShowAccountRank();
                               Cleanup();
                           }));
            }
        }

        public RelayCommand GoToProgressCommand
        {
            get
            {
                return _goToProgressCommand
                       ?? (_goToProgressCommand = new RelayCommand(
                           () =>
                           {
                               Navigation.ShowAccountProgress();
                               Cleanup();
                           }));
            }
        }
    }
}
