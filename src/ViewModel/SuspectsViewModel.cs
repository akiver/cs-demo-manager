using System;
using System.Collections;
using CSGO_Demos_Manager.Models;
using CSGO_Demos_Manager.Services;
using GalaSoft.MvvmLight;
using GalaSoft.MvvmLight.CommandWpf;
using GalaSoft.MvvmLight.Threading;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Data;
using System.Windows.Input;
using CSGO_Demos_Manager.Internals;
using CSGO_Demos_Manager.Models.Source;
using CSGO_Demos_Manager.Views;
using MahApps.Metro.Controls.Dialogs;
using MoreLinq;

namespace CSGO_Demos_Manager.ViewModel
{
	public class SuspectsViewModel : ViewModelBase
	{
		#region Properties

		private readonly ISteamService _steamService;

		private readonly ICacheService _cacheService;

		private readonly IDemosService _demosService;

		private readonly DialogService _dialogService;

		private string _suspectSteamCommunityUrl;

		private RelayCommand _backToHomeCommand;

		private RelayCommand _addSuspectCommand;

		private RelayCommand _removeSelectedSuspectsCommand;

		private RelayCommand<Suspect> _goToSuspectProfileCommand;

		private RelayCommand<Suspect> _displayDemosCommand;

		private RelayCommand _refreshSuspectListCommand;

		private RelayCommand _addAllPlayerToListCommand;

		private RelayCommand _stopCommand;

		private RelayCommand _goToWhitelistCommand;

		private RelayCommand<bool> _showOnlyBannedSuspects;

		private RelayCommand<IList> _suspectsSelectionChangedCommand;

		ObservableCollection<Suspect> _suspects;

		ObservableCollection<Suspect> _selectedsuspects;

		private ICollectionView _dataGridSuspectsCollection;

		Suspect _selectedSuspect;

		private bool _isRefreshing;

		private string _notificationMessage;

		private bool _isAnalyzing;

		private bool _isShowOnlyBannedSuspects = Properties.Settings.Default.ShowOnlyBannedSuspects;

		private CancellationTokenSource _cts;

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

		public ICollectionView DataGridSuspectsCollection
		{
			get { return _dataGridSuspectsCollection; }
			set { Set(() => DataGridSuspectsCollection, ref _dataGridSuspectsCollection, value); }
		}

		public string SuspectSteamCommunityUrl
		{
			get { return _suspectSteamCommunityUrl; }
			set { Set(() => SuspectSteamCommunityUrl, ref _suspectSteamCommunityUrl, value); }
		}

		public bool IsRefreshing
		{
			get { return _isRefreshing; }
			set { Set(() => IsRefreshing, ref _isRefreshing, value); }
		}

		public bool IsAnalyzing
		{
			get { return _isAnalyzing; }
			set { Set(() => IsAnalyzing, ref _isAnalyzing, value); }
		}

		public string NotificationMessage
		{
			get { return _notificationMessage; }
			set { Set(() => NotificationMessage, ref _notificationMessage, value); }
		}

		public bool IsShowOnlyBannedSuspects
		{
			get { return _isShowOnlyBannedSuspects; }
			set { Set(() => IsShowOnlyBannedSuspects, ref _isShowOnlyBannedSuspects, value); }
		}

		#endregion

		#region Commands

		/// <summary>
		/// Command to back to the home page
		/// </summary>
		public RelayCommand BackToHomeCommand
		{
			get
			{
				return _backToHomeCommand
					?? (_backToHomeCommand = new RelayCommand(
					() =>
					{
						var mainViewModel = (new ViewModelLocator()).Main;
						Application.Current.Properties["LastPageViewed"] = mainViewModel.CurrentPage.CurrentPage;
						HomeView homeView = new HomeView();
						mainViewModel.CurrentPage.ShowPage(homeView);
					}));
			}
		}

		public RelayCommand AddSuspectCommand
		{
			get
			{
				return _addSuspectCommand
					?? (_addSuspectCommand = new RelayCommand(
						async () =>
						{
							var steamIdOrUrl = await _dialogService.ShowInputAsync("Add a suspect", "Enter the SteamID 64 or the Steam community URL.");
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
									NotificationMessage = "Adding suspect...";
									IsRefreshing = true;

									Suspect suspect = await _steamService.GetBanStatusForUser(steamIdOrUrl);

									if (suspect == null)
									{
										await _dialogService.ShowErrorAsync("User not found.", MessageDialogStyle.Affirmative);
										IsRefreshing = false;
										return;
									}

									bool added = await _cacheService.AddSuspectToCache(suspect.SteamId);
									if (added)
									{
										Suspects.Add(suspect);
										if (suspect.VacBanned || suspect.GameBanCount > 0)
										{
											await _cacheService.AddSuspectToBannedList(suspect);
										}
									}
									else
									{
										await
											_dialogService.ShowMessageAsync( "This player is in your suspect / white / account list." + Environment.NewLine
											+ "You have to remove it from your account and white list to be able to add him in your supect list.",
											MessageDialogStyle.Affirmative);
									}

									IsRefreshing = false;
								}
								catch (Exception e)
								{
									Logger.Instance.Log(e);
									await _dialogService.ShowErrorAsync("Error while trying to get suspect information.", MessageDialogStyle.Affirmative);
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

		public RelayCommand RemoveSuspectCommand
		{
			get
			{
				return _removeSelectedSuspectsCommand
					?? (_removeSelectedSuspectsCommand = new RelayCommand(
						async () =>
						{
							for (int i = SelectedSuspects.Count - 1; i >= 0; i--)
							{
								bool removed = await _cacheService.RemoveSuspectFromCache(SelectedSuspects[i].SteamId);
								if (!removed)
								{
									await _dialogService.ShowErrorAsync("Error while deleting suspect.", MessageDialogStyle.Affirmative);
								}
								else
								{
									Suspects.Remove(SelectedSuspects[i]);
								}
							}

							SelectedSuspects.Clear();
							DataGridSuspectsCollection.Refresh();
							IsRefreshing = false;
						},
						() => SelectedSuspects.Any()));
			}
		}

		public RelayCommand AddAllPlayerToListCommand
		{
			get
			{
				return _addAllPlayerToListCommand
					?? (_addAllPlayerToListCommand = new RelayCommand(
						async () =>
						{
							if (!AppSettings.IsInternetConnectionAvailable())
							{
								await _dialogService.ShowNoInternetConnectionAsync();
								return;
							}

							IsRefreshing = true;
							IsAnalyzing = true;
							List<Demo> demosFailed = new List<Demo>();
							List<string> folders = await _cacheService.GetFoldersAsync();
							List<Demo> demos = await _demosService.GetDemosHeader(folders);
							for (int i = 0; i < demos.Count; i++)
							{
								if (demos[i].Source.GetType() != typeof(Pov) && IsAnalyzing)
								{
									try
									{
										if (_cts == null)
										{
											_cts = new CancellationTokenSource();
										}

										NotificationMessage = "Analyzing " + demos[i].Name + "...";
										demos[i] = await _demosService.AnalyzeDemo(demos[i], _cts.Token);
										await _cacheService.WriteDemoDataCache(demos[i]);
										if (demos[i].Players.Any())
										{
											foreach (PlayerExtended playerExtended in demos[i].Players)
											{
												NotificationMessage = "Adding suspects...";
												await _cacheService.AddSuspectToCache(playerExtended.SteamId.ToString());
											}
										}
									}
									catch (Exception e)
									{
										Logger.Instance.Log(e);
										demos[i].Status = "old";
										demosFailed.Add(demos[i]);
										await _cacheService.WriteDemoDataCache(demos[i]);
									}
								}
							}

							if (demosFailed.Any())
							{
								await _dialogService.ShowDemosFailedAsync(demosFailed);
							}

							NotificationMessage = "Refreshing...";
							await LoadSuspects();
							CommandManager.InvalidateRequerySuggested();
							IsRefreshing = false;
							IsAnalyzing = false;
						},
						() => !IsRefreshing));
			}
		}

		public RelayCommand<Suspect> GoToSuspectProfileCommand
		{
			get
			{
				return _goToSuspectProfileCommand
					?? (_goToSuspectProfileCommand = new RelayCommand<Suspect>(
						suspect =>
						{
							System.Diagnostics.Process.Start(suspect.ProfileUrl);
						},
						suspect => SelectedSuspect != null));
			}
		}

		/// <summary>
		/// Command to display demos within suspect has played
		/// </summary>
		public RelayCommand<Suspect> DisplayDemosCommand
		{
			get
			{
				return _displayDemosCommand
					?? (_displayDemosCommand = new RelayCommand<Suspect>(
						async suspect =>
						{
							IsRefreshing = true;
							NotificationMessage = "Searching...";
							List<Demo> demos = await _demosService.GetDemosPlayer(suspect.SteamId);
							IsRefreshing = false;
							if (!demos.Any())
							{
								await _dialogService.ShowMessageAsync("No demos found for this suspect." + Environment.NewLine
									+ "Demos with this suspect might not have been analyzed.", MessageDialogStyle.Affirmative);
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

		public RelayCommand RefreshSuspectListCommand
		{
			get
			{
				return _refreshSuspectListCommand
					?? (_refreshSuspectListCommand = new RelayCommand(
						async () =>
						{
							IsRefreshing = true;
							NotificationMessage = "Refreshing...";
							await LoadSuspects();
							IsRefreshing = false;
							CommandManager.InvalidateRequerySuggested();
						}, () => IsRefreshing == false));
			}
		}

		/// <summary>
		/// Command fired when a suspect selection is done
		/// </summary>
		public RelayCommand<IList> SuspectsSelectionChangedCommand
		{
			get
			{
				return _suspectsSelectionChangedCommand
					?? (_suspectsSelectionChangedCommand = new RelayCommand<IList>(
						suspects =>
						{
							if (IsRefreshing) return;
							if (suspects == null) return;
							SelectedSuspects.Clear();
							foreach (Suspect suspect in suspects)
							{
								SelectedSuspects.Add(suspect);
							}
						}));
			}
		}

		public RelayCommand StopCommand
		{
			get
			{
				return _stopCommand
					?? (_stopCommand = new RelayCommand(
						() =>
						{
							IsAnalyzing = false;
							NotificationMessage = "Stopping analyze...";
						},
						() => IsRefreshing));
			}
		}

		public RelayCommand<bool> ShowOnlyBannedSuspectCommand
		{
			get
			{
				return _showOnlyBannedSuspects
					?? (_showOnlyBannedSuspects = new RelayCommand<bool>(
						isChecked =>
						{
							IsShowOnlyBannedSuspects = isChecked;
							Properties.Settings.Default.ShowOnlyBannedSuspects = isChecked;
							Properties.Settings.Default.Save();
							DataGridSuspectsCollection.Refresh();
						}, isChecked => !IsRefreshing));
			}
		}

		public RelayCommand GoToWhitelistCommand
		{
			get
			{
				return _goToWhitelistCommand
					?? (_goToWhitelistCommand = new RelayCommand(
						() =>
						{
							var mainViewModel = (new ViewModelLocator()).Main;
							WhitelistView whitelistView = new WhitelistView();
							mainViewModel.CurrentPage.ShowPage(whitelistView);
						}));
			}
		}

		#endregion

		public SuspectsViewModel(ISteamService steamService, ICacheService cacheService, DialogService dialogService, IDemosService demosService)
		{
			_steamService = steamService;
			_cacheService = cacheService;
			_dialogService = dialogService;
			_demosService = demosService;

			if (IsInDesignMode)
			{
				DispatcherHelper.Initialize();
				IsAnalyzing = true;
			}

			Suspects = new ObservableCollection<Suspect>();
			SelectedSuspects = new ObservableCollection<Suspect>();
			DataGridSuspectsCollection = CollectionViewSource.GetDefaultView(Suspects);
			DataGridSuspectsCollection.Filter = Filter;

			Application.Current.Dispatcher.Invoke(async () =>
			{
				IsRefreshing = true;
				NotificationMessage = "Refreshing...";
				await LoadSuspects();
				if(!IsInDesignMode) IsRefreshing = false;
				CommandManager.InvalidateRequerySuggested();
			});
		}

		public bool Filter(object obj)
		{
			var data = obj as Suspect;
			if (data != null)
			{
				if (IsShowOnlyBannedSuspects)
				{
					if (data.VacBanned || data.GameBanCount != 0 ) return true;
					return false;
				}

				return true;
			}

			return true;
		}

		private async Task LoadSuspects()
		{
			if (!AppSettings.IsInternetConnectionAvailable())
			{
				await _dialogService.ShowNoInternetConnectionAsync();
				return;
			}

			Suspects.Clear();
			SelectedSuspects.Clear();

			List<string> suspectsIdList = await _cacheService.GetSuspectsListFromCache();
			
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
					await _dialogService.ShowErrorAsync("Error while trying to get suspects information.", MessageDialogStyle.Affirmative);
				}
			}
		}

		public override void Cleanup()
		{
			base.Cleanup();
			SelectedSuspect = null;
			Suspects.Clear();
		}
	}
}
