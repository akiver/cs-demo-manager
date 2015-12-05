using System;
using System.Collections;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Windows.Input;
using CSGO_Demos_Manager.Internals;
using CSGO_Demos_Manager.Models;
using CSGO_Demos_Manager.Services;
using CSGO_Demos_Manager.Services.Interfaces;
using CSGO_Demos_Manager.Views;
using GalaSoft.MvvmLight;
using GalaSoft.MvvmLight.CommandWpf;
using MahApps.Metro.Controls.Dialogs;
using MoreLinq;

namespace CSGO_Demos_Manager.ViewModel
{
	public class WhitelistViewModel : ViewModelBase
	{
		#region Properties

		private readonly DialogService _dialogService;

		private readonly ICacheService _cacheService;

		private readonly ISteamService _steamService;

		private readonly IDemosService _demosService;

		private string _notificationMessage;

		private bool _isBusy;

		ObservableCollection<Suspect> _suspects;

		ObservableCollection<Suspect> _selectedsuspects;

		Suspect _selectedSuspect;

		private RelayCommand _goToSuspectsCommand;

		private RelayCommand _addPlayerCommand;

		private RelayCommand _removeSelectedPlayersCommand;

		private RelayCommand<Suspect> _goToPlayerProfileCommand;

		private RelayCommand<Suspect> _displayDemosCommand;

		private RelayCommand _refreshPlayerListCommand;

		private RelayCommand<IList> _playersSelectionChangedCommand;

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

		public string NotificationMessage
		{
			get { return _notificationMessage; }
			set { Set(() => NotificationMessage, ref _notificationMessage, value); }
		}

		public bool IsBusy
		{
			get { return _isBusy; }
			set { Set(() => IsBusy, ref _isBusy, value); }
		}

		#endregion

		#region Commands

		/// <summary>
		/// Command to go back to suspects view
		/// </summary>
		public RelayCommand GoToSuspectsCommand
		{
			get
			{
				return _goToSuspectsCommand
					?? (_goToSuspectsCommand = new RelayCommand(
						() =>
						{
							var mainViewModel = (new ViewModelLocator()).Main;
							SuspectsView suspectsView = new SuspectsView();
							mainViewModel.CurrentPage.ShowPage(suspectsView);
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
							var steamIdOrUrl = await _dialogService.ShowInputAsync("Add a player to whitelist", "Enter the SteamID 64 or the Steam community URL.");
							if (string.IsNullOrEmpty(steamIdOrUrl)) return;

							long steamIdAsLong;
							bool isLong = long.TryParse(steamIdOrUrl, out steamIdAsLong);
							if (isLong)
							{
								steamIdOrUrl = "http://steamcommunity.com/profiles/" + steamIdAsLong + "/";
							}
							Regex regexSteamCommunity = new Regex("http://steamcommunity.com/profiles/(?<steamID>\\d*)/?");
							Match match = regexSteamCommunity.Match(steamIdOrUrl);

							if (match.Success)
							{
								try
								{
									NotificationMessage = "Adding player to whitelist...";
									IsBusy = true;

									Suspect suspect = await _steamService.GetBanStatusForUser(steamIdOrUrl);

									if (suspect == null)
									{
										await _dialogService.ShowErrorAsync("User not found.", MessageDialogStyle.Affirmative);
										IsBusy = false;
										return;
									}

									bool added = await _cacheService.AddPlayerToWhitelist(suspect.SteamId);
									if (added)
									{
										Suspects.Add(suspect);
										await _cacheService.RemoveSuspectFromCache(suspect.SteamId);
									}
									else
									{
										NotificationMessage = "Player already in your whitelist.";
										await Task.Delay(3000);
									}

									IsBusy = false;
								}
								catch (Exception e)
								{
									Logger.Instance.Log(e);
									await _dialogService.ShowErrorAsync("Error while trying to get player information.", MessageDialogStyle.Affirmative);
								}
							}
							else
							{
								await _dialogService.ShowErrorAsync("Invalid SteamID 64 or Steam community URL.", MessageDialogStyle.Affirmative);
							}

							CommandManager.InvalidateRequerySuggested();
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
									await _dialogService.ShowErrorAsync("Error while deleting player.", MessageDialogStyle.Affirmative);
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
						suspect =>
						{
							System.Diagnostics.Process.Start(suspect.ProfileUrl);
						},
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
							NotificationMessage = "Searching...";
							List<Demo> demos = await _demosService.GetDemosPlayer(suspect.SteamId);
							IsBusy = false;
							if (!demos.Any())
							{
								await _dialogService.ShowMessageAsync("No demos found for this player." + Environment.NewLine
									+ "Demos with this player might not have been analyzed.", MessageDialogStyle.Affirmative);
								return;
							}

							var homeViewModel = (new ViewModelLocator()).Home;
							homeViewModel.SelectedDemos.Clear();
							homeViewModel.Demos.Clear();
							foreach (Demo demo in demos)
							{
								homeViewModel.Demos.Add(demo);
							}
							homeViewModel.DataGridDemosCollection.Refresh();

							var mainViewModel = (new ViewModelLocator()).Main;
							System.Windows.Application.Current.Properties["LastPageViewed"] = mainViewModel.CurrentPage.CurrentPage;
							HomeView homeView = new HomeView();
							mainViewModel.CurrentPage.ShowPage(homeView);
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
							NotificationMessage = "Refreshing...";
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
							if (IsBusy) return;
							if (suspects == null) return;
							SelectedSuspects.Clear();
							foreach (Suspect suspect in suspects)
							{
								SelectedSuspects.Add(suspect);
							}
						}));
			}
		}

		#endregion

		public WhitelistViewModel(DialogService dialogService, ICacheService cacheService, ISteamService steamService, IDemosService demosService)
		{
			_dialogService = dialogService;
			_steamService = steamService;
			_cacheService = cacheService;
			_demosService = demosService;

			Suspects = new ObservableCollection<Suspect>();
			SelectedSuspects = new ObservableCollection<Suspect>();
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
					await _dialogService.ShowErrorAsync("Error while trying to get players information.", MessageDialogStyle.Affirmative);
				}
			}
		}
	}
}
