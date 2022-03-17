using System;
using System.Collections;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Linq;
using System.Threading.Tasks;
using System.Windows.Data;
using System.Windows.Input;
using Core;
using Core.Models;
using GalaSoft.MvvmLight.CommandWpf;
using MahApps.Metro.Controls.Dialogs;
using Manager.Internals;
using Manager.Services;
using Manager.ViewModel.Shared;
using Services;
using Services.Interfaces;

namespace Manager.ViewModel.Suspects
{
    public class WhitelistViewModel : BaseViewModel
    {
        #region Properties

        private readonly IDialogService _dialogService;

        private readonly ICacheService _cacheService;

        private readonly ISteamService _steamService;

        private readonly IDemosService _demosService;

        private ObservableCollection<Suspect> _suspects;

        private ObservableCollection<Suspect> _selectedsuspects;

        private Suspect _selectedSuspect;

        private RelayCommand _showSuspectListCommand;

        private RelayCommand _addPlayerCommand;

        private RelayCommand _removeSelectedPlayersCommand;

        private RelayCommand<Suspect> _goToPlayerProfileCommand;

        private RelayCommand<Suspect> _displayDemosCommand;

        private RelayCommand _refreshPlayerListCommand;

        private RelayCommand<IList> _playersSelectionChangedCommand;

        private ICollectionView _dataGridPlayerCollection;

        private string _filterText;

        #endregion

        #region Accessors

        public Suspect SelectedSuspect
        {
            get { return _selectedSuspect; }
            set { Set(() => SelectedSuspect, ref _selectedSuspect, value); }
        }

        public ObservableCollection<Suspect> Suspects
        {
            get { return _suspects; }
            set { Set(() => Suspects, ref _suspects, value); }
        }

        public ObservableCollection<Suspect> SelectedSuspects
        {
            get { return _selectedsuspects; }
            set { Set(() => SelectedSuspects, ref _selectedsuspects, value); }
        }

        public ICollectionView DataGridPlayerCollection
        {
            get { return _dataGridPlayerCollection; }
            set { Set(() => DataGridPlayerCollection, ref _dataGridPlayerCollection, value); }
        }

        public string FilterText
        {
            get { return _filterText; }
            set
            {
                Set(() => FilterText, ref _filterText, value);
                _dataGridPlayerCollection?.Refresh();
            }
        }

        #endregion

        #region Filters

        public bool Filter(object obj)
        {
            var data = obj as Suspect;
            if (data != null)
            {
                if (!string.IsNullOrEmpty(_filterText))
                {
                    return data.Nickname.Contains(_filterText, StringComparison.OrdinalIgnoreCase);
                }

                return true;
            }

            return true;
        }

        #endregion

        #region Commands

        public RelayCommand ShowSuspectListCommand
        {
            get
            {
                return _showSuspectListCommand
                       ?? (_showSuspectListCommand = new RelayCommand(
                           () =>
                           {
                               Navigation.ShowSuspectList();
                           }));
            }
        }

        /// <summary>
        /// Command to add a player to the whitelist
        /// </summary>
        public RelayCommand AddPlayerCommand
        {
            get
            {
                return _addPlayerCommand
                       ?? (_addPlayerCommand = new RelayCommand(
                           async () =>
                           {
                               if (!AppSettings.IsInternetConnectionAvailable())
                               {
                                   await _dialogService.ShowNoInternetConnectionAsync();
                                   return;
                               }

                               try
                               {
                                   string steamInput = await _dialogService.ShowInputAsync(Properties.Resources.DialogAddPlayerToWhitelist,
                                       Properties.Resources.DialogEnterSteamId);
                                   if (string.IsNullOrEmpty(steamInput))
                                   {
                                       return;
                                   }

                                   Notification = Properties.Resources.NotificationAddingPlayerToWhitelist;
                                   IsBusy = true;

                                   string steamId = await _steamService.GetSteamIdFromUrlOrSteamId(steamInput);
                                   if (!string.IsNullOrEmpty(steamId))
                                   {
                                       Suspect suspect = await _steamService.GetBanStatusForUser(steamId);
                                       if (suspect == null)
                                       {
                                           await _dialogService.ShowErrorAsync(Properties.Resources.DialogPlayerNotFound,
                                               MessageDialogStyle.Affirmative);
                                       }
                                       else
                                       {
                                           bool added = await _cacheService.AddPlayerToWhitelist(suspect.SteamId);
                                           if (added)
                                           {
                                               Suspects.Add(suspect);
                                               await _cacheService.RemoveSuspectFromCache(suspect.SteamId);
                                           }
                                           else
                                           {
                                               Notification = Properties.Resources.NotificationPlayerAlreadyInWhitelist;
                                               await Task.Delay(3000);
                                           }
                                       }
                                   }
                                   else
                                   {
                                       await
                                           _dialogService.ShowErrorAsync(Properties.Resources.DialogErrorInvalidSteamId,
                                               MessageDialogStyle.Affirmative);
                                   }
                               }
                               catch (Exception e)
                               {
                                   Logger.Instance.Log(e);
                                   await
                                       _dialogService.ShowErrorAsync(Properties.Resources.DialogErrorWhileRetrievingPlayerInformation,
                                           MessageDialogStyle.Affirmative);
                               }
                               finally
                               {
                                   IsBusy = false;
                                   CommandManager.InvalidateRequerySuggested();
                               }
                           },
                           AppSettings.IsInternetConnectionAvailable));
            }
        }

        /// <summary>
        /// Command to remove a player from whitelist
        /// </summary>
        public RelayCommand RemoveSelectedPlayersCommand
        {
            get
            {
                return _removeSelectedPlayersCommand
                       ?? (_removeSelectedPlayersCommand = new RelayCommand(
                           async () =>
                           {
                               for (int i = SelectedSuspects.Count - 1; i >= 0; i--)
                               {
                                   bool removed = await _cacheService.RemovePlayerFromWhitelist(SelectedSuspects[i].SteamId);
                                   if (!removed)
                                   {
                                       await _dialogService.ShowErrorAsync(Properties.Resources.DialogErrorWhileDeletingPlayer,
                                           MessageDialogStyle.Affirmative);
                                   }
                                   else
                                   {
                                       Suspects.Remove(SelectedSuspects[i]);
                                   }
                               }

                               SelectedSuspects.Clear();
                               IsBusy = false;
                           },
                           () => SelectedSuspects.Any()));
            }
        }

        /// <summary>
        /// Command to go to player's Steam profile
        /// </summary>
        public RelayCommand<Suspect> GoToPlayerProfileCommand
        {
            get
            {
                return _goToPlayerProfileCommand
                       ?? (_goToPlayerProfileCommand = new RelayCommand<Suspect>(
                           suspect => { System.Diagnostics.Process.Start(suspect.ProfileUrl); },
                           suspect => SelectedSuspect != null));
            }
        }

        /// <summary>
        /// Command to display demos within selected player has played
        /// </summary>
        public RelayCommand<Suspect> DisplayDemosCommand
        {
            get
            {
                return _displayDemosCommand
                       ?? (_displayDemosCommand = new RelayCommand<Suspect>(
                           async suspect =>
                           {
                               IsBusy = true;
                               Notification = Properties.Resources.NotificationSearching;
                               List<Demo> demos = await _demosService.GetDemosPlayer(suspect.SteamId);
                               IsBusy = false;
                               if (!demos.Any())
                               {
                                   await _dialogService.ShowMessageAsync(Properties.Resources.DialogNoDemosPlayerFound,
                                       MessageDialogStyle.Affirmative);
                                   return;
                               }

                               var homeViewModel = new ViewModelLocator().DemoList;
                               homeViewModel.SelectedDemos.Clear();
                               homeViewModel.Demos.Clear();
                               foreach (Demo demo in demos)
                               {
                                   homeViewModel.Demos.Add(demo);
                               }

                               homeViewModel.DataGridDemosCollection.Refresh();

                               Navigation.ShowDemoList();
                           },
                           suspect => SelectedSuspect != null));
            }
        }

        public RelayCommand RefreshPlayerListCommand
        {
            get
            {
                return _refreshPlayerListCommand
                       ?? (_refreshPlayerListCommand = new RelayCommand(
                           async () =>
                           {
                               IsBusy = true;
                               Notification = Properties.Resources.NotificationRefreshing;
                               await LoadPlayers();
                               IsBusy = false;
                               CommandManager.InvalidateRequerySuggested();
                           }, () => !IsBusy));
            }
        }

        /// <summary>
        /// Command fired when a suspect selection is done
        /// </summary>
        public RelayCommand<IList> PlayersSelectionChangedCommand
        {
            get
            {
                return _playersSelectionChangedCommand
                       ?? (_playersSelectionChangedCommand = new RelayCommand<IList>(
                           suspects =>
                           {
                               if (IsBusy)
                               {
                                   return;
                               }

                               if (suspects == null)
                               {
                                   return;
                               }

                               SelectedSuspects.Clear();
                               foreach (Suspect suspect in suspects)
                               {
                                   SelectedSuspects.Add(suspect);
                               }
                           }));
            }
        }

        #endregion

        public WhitelistViewModel(IDialogService dialogService, ICacheService cacheService, ISteamService steamService, IDemosService demosService)
        {
            _dialogService = dialogService;
            _steamService = steamService;
            _cacheService = cacheService;
            _demosService = demosService;

            Suspects = new ObservableCollection<Suspect>();
            SelectedSuspects = new ObservableCollection<Suspect>();
            DataGridPlayerCollection = CollectionViewSource.GetDefaultView(Suspects);
            DataGridPlayerCollection.SortDescriptions.Add(new SortDescription("Nickname", ListSortDirection.Ascending));
            DataGridPlayerCollection.Filter = Filter;
        }


        private async Task LoadPlayers()
        {
            if (!AppSettings.IsInternetConnectionAvailable())
            {
                await _dialogService.ShowNoInternetConnectionAsync();
                return;
            }

            Suspects.Clear();
            SelectedSuspects.Clear();

            List<string> suspectsIdList = await _cacheService.GetPlayersWhitelist();

            if (suspectsIdList.Any())
            {
                // Split list to 100 elements as Steam API allow to request by 100 SteamID maximum
                IEnumerable<IEnumerable<string>> ids = suspectsIdList.Batch(100);
                try
                {
                    foreach (IEnumerable<string> idList in ids)
                    {
                        IEnumerable<Suspect> suspects = await _steamService.GetBanStatusForUserList(idList.ToList());
                        foreach (Suspect suspect in suspects)
                        {
                            Suspects.Add(suspect);
                        }
                    }
                }
                catch (Exception e)
                {
                    Logger.Instance.Log(e);
                    await _dialogService.ShowErrorAsync(Properties.Resources.DialogErrorWhileRetrievingPlayersInformation,
                        MessageDialogStyle.Affirmative);
                }
            }
        }
    }
}
