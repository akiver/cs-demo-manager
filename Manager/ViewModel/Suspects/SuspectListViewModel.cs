using System;
using System.Collections;
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
using Core;
using Core.Models;
using Core.Models.Source;
using GalaSoft.MvvmLight;
using GalaSoft.MvvmLight.CommandWpf;
using GalaSoft.MvvmLight.Messaging;
using GalaSoft.MvvmLight.Threading;
using MahApps.Metro.Controls.Dialogs;
using Manager.Internals;
using Manager.Messages;
using Manager.Services;
using Manager.Views.Demos;
using Manager.Views.Suspects;
using Services;
using Services.Interfaces;

namespace Manager.ViewModel.Suspects
{
	public class SuspectListViewModel : ViewModelBase, IDisposable
	{
		#region Properties

		private readonly ISteamService _steamService;

		private readonly ICacheService _cacheService;

		private readonly IDemosService _demosService;

		private readonly DialogService _dialogService;

		private string _suspectSteamCommunityUrl;

		private RelayCommand _windowLoadedCommand;

		private RelayCommand _backToHomeCommand;

		private RelayCommand _addSuspectCommand;

		private RelayCommand _removeSelectedSuspectsCommand;

		private RelayCommand<Suspect> _goToSuspectProfileCommand;

		private RelayCommand _displayDemosCommand;

		private RelayCommand _moveToWhitelistCommand;

		private RelayCommand _refreshSuspectListCommand;

		private RelayCommand _addAllPlayerToListCommand;

		private RelayCommand _stopCommand;

		private RelayCommand _goToWhitelistCommand;

		private RelayCommand<bool> _showOnlyBannedSuspects;

		private RelayCommand<IList> _suspectsSelectionChangedCommand;

		private ObservableCollection<Suspect> _suspects;

		private ObservableCollection<Suspect> _selectedsuspects;

		private ICollectionView _dataGridSuspectsCollection;

		private Suspect _selectedSuspect;

		private bool _isRefreshing;

		private string _notificationMessage;

		private bool _isAnalyzing;

		private bool _isShowOnlyBannedSuspects = Properties.Settings.Default.ShowOnlyBannedSuspects;

		private CancellationTokenSource _cts = new CancellationTokenSource();

		public bool IsLoadSuspects = true;

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

		public string FilterText
		{
			get { return _filterText; }
			set
			{
				Set(() => FilterText, ref _filterText, value);
				_dataGridSuspectsCollection?.Refresh();
			}
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

		#region Filters

		public bool Filter(object obj)
		{
			var data = obj as Suspect;
			if (data != null)
			{
				bool isBanned = data.VacBanned || data.GameBanCount != 0;
				if (IsShowOnlyBannedSuspects)
				{
					if (!string.IsNullOrEmpty(_filterText))
					{
						return isBanned && data.Nickname.Contains(_filterText, StringComparison.OrdinalIgnoreCase);
					}
					return isBanned;
				}

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

		public RelayCommand WindowLoadedCommand
		{
			get
			{
				return _windowLoadedCommand
					?? (_windowLoadedCommand = new RelayCommand(
					async () =>
					{
						if (IsLoadSuspects)
						{
							IsRefreshing = true;
							NotificationMessage = Properties.Resources.NotificationRefreshing;
							await LoadSuspects();
							if (!IsInDesignMode) IsRefreshing = false;
							CommandManager.InvalidateRequerySuggested();
						}
						IsLoadSuspects = true;
					}));
			}
		}

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
						var mainViewModel = new ViewModelLocator().Main;
						Application.Current.Properties["LastPageViewed"] = mainViewModel.CurrentPage.CurrentPage;
						DemoListView demoListView = new DemoListView();
						mainViewModel.CurrentPage.ShowPage(demoListView);
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
							if (!AppSettings.IsInternetConnectionAvailable())
							{
								await _dialogService.ShowNoInternetConnectionAsync();
								return;
							}

							try
							{
								string steamInput = await _dialogService.ShowInputAsync(Properties.Resources.DialogAddSuspect, Properties.Resources.DialogEnterSteamId);
								if (string.IsNullOrEmpty(steamInput)) return;

								NotificationMessage = Properties.Resources.NotificationAddingSuspect;
								IsRefreshing = true;

								string steamId = await _steamService.GetSteamIdFromUrlOrSteamId(steamInput);
								if (!string.IsNullOrEmpty(steamId))
								{
									Suspect suspect = await _steamService.GetBanStatusForUser(steamId);
									if (suspect == null)
									{
										await _dialogService.ShowErrorAsync(Properties.Resources.DialogPlayerNotFound, MessageDialogStyle.Affirmative);
									}
									else
									{
										bool added = await _cacheService.AddSuspectToCache(suspect.SteamId);
										if (added)
										{
											Suspects.Add(suspect);
											if (suspect.VacBanned || suspect.GameBanCount > 0)
											{
												await _cacheService.AddSteamIdToBannedList(suspect.SteamId);
											}
										}
										else
										{
											await
												_dialogService.ShowMessageAsync(Properties.Resources.DialogPlayerAlreadyInSuspectWhitelist,
													MessageDialogStyle.Affirmative);
										}
									}
								}
								else
								{
									await _dialogService.ShowErrorAsync(Properties.Resources.DialogErrorInvalidSteamId, MessageDialogStyle.Affirmative);
								}
							}
							catch (Exception e)
							{
								Logger.Instance.Log(e);
								await _dialogService.ShowErrorAsync(Properties.Resources.DialogErrorWhileRetrievingSuspectInformation, MessageDialogStyle.Affirmative);
							}
							finally
							{
								IsRefreshing = false;
								CommandManager.InvalidateRequerySuggested();
							}
						}));
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
							foreach (Suspect suspect in SelectedSuspects.ToList())
							{
								bool removed = await _cacheService.RemoveSuspectFromCache(suspect.SteamId);
								if (!removed)
								{
									await _dialogService.ShowErrorAsync(Properties.Resources.DialogErrorWhileDeletingSuspect, MessageDialogStyle.Affirmative);
								}
								else
								{
									Suspects.Remove(suspect);
								}
							}

							SelectedSuspects.Clear();
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

										NotificationMessage = string.Format(Properties.Resources.NotificationAnalyzingDemo, demos[i].Name);
										demos[i] = await _demosService.AnalyzeDemo(demos[i], _cts.Token);
										await _cacheService.WriteDemoDataCache(demos[i]);
										if (demos[i].Players.Any())
										{
											foreach (Player playerExtended in demos[i].Players)
											{
												NotificationMessage = Properties.Resources.NotificationAddingSuspects;
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

							NotificationMessage = Properties.Resources.NotificationRefreshing;
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
		/// Command to display demos within suspects has played
		/// </summary>
		public RelayCommand DisplayDemosCommand
		{
			get
			{
				return _displayDemosCommand
					?? (_displayDemosCommand = new RelayCommand(
						async () =>
						{
							IsRefreshing = true;
							NotificationMessage = Properties.Resources.NotificationSearching;
							List<Demo> demos = new List<Demo>();
							foreach (Suspect suspect in SelectedSuspects)
							{
								demos = demos.Concat(await _demosService.GetDemosPlayer(suspect.SteamId)).ToList();
							}
							IsRefreshing = false;
							if (!demos.Any())
							{
								await _dialogService.ShowMessageAsync(Properties.Resources.DialogNoDemosSuspectFound, MessageDialogStyle.Affirmative);
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

							var mainViewModel = new ViewModelLocator().Main;
							Application.Current.Properties["LastPageViewed"] = mainViewModel.CurrentPage.CurrentPage;
							DemoListView demoListView = new DemoListView();
							mainViewModel.CurrentPage.ShowPage(demoListView);
						},
						() => SelectedSuspects.Any()));
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
							NotificationMessage = Properties.Resources.NotificationRefreshing;
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
							NotificationMessage = Properties.Resources.NotificationStoppingAnalyze;
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
							var mainViewModel = new ViewModelLocator().Main;
							WhitelistView whitelistView = new WhitelistView();
							mainViewModel.CurrentPage.ShowPage(whitelistView);
						}));
			}
		}

		public RelayCommand MoveToWhitelistCommand
		{
			get
			{
				return _moveToWhitelistCommand
					?? (_moveToWhitelistCommand = new RelayCommand(
						async () =>
						{
							IsRefreshing = true;
							NotificationMessage = Properties.Resources.NotificationMovingSuspectsToWhitelist;
							foreach (Suspect suspect in SelectedSuspects.ToList())
							{
								bool hasMoved = await _cacheService.AddPlayerToWhitelist(suspect.SteamId);
								if (!hasMoved)
								{
									await _dialogService.ShowErrorAsync(Properties.Resources.DialogErrorWhileMovingSuspects, MessageDialogStyle.Affirmative);
								}
								else
								{
									Suspects.Remove(suspect);
								}
							}
							SelectedSuspects.Clear();
							IsRefreshing = false;
						},
						() => SelectedSuspects.Any()));
			}
		}

		#endregion

		public SuspectListViewModel(ISteamService steamService, ICacheService cacheService, DialogService dialogService, IDemosService demosService)
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
			DataGridSuspectsCollection.SortDescriptions.Add(new SortDescription("DaySinceLastBanCount", ListSortDirection.Ascending));
			DataGridSuspectsCollection.Filter = Filter;
			Messenger.Default.Register<LoadSuspectListMessage>(this, HandleLoadSuspectListMessage);
		}

		private async Task LoadSuspects()
		{
			if (!AppSettings.IsInternetConnectionAvailable())
			{
				await _dialogService.ShowNoInternetConnectionAsync();
				return;
			}

			try
			{
				Suspects.Clear();
				SelectedSuspects.Clear();

				List<string> suspectsIdList = await _cacheService.GetSuspectsListFromCache();

				if (suspectsIdList.Any())
				{
					// Split list to 100 elements as Steam API allow to request by 100 SteamID maximum
					IEnumerable<IEnumerable<string>> ids = suspectsIdList.Batch(100);
					foreach (IEnumerable<string> idList in ids)
					{
						List<Suspect> suspects = await _steamService.GetBanStatusForUserList(idList.ToList());
						foreach (Suspect s in suspects)
						{
							Suspects.Add(s);
						}
					}
				}
			}
			catch (Exception e)
			{
				Logger.Instance.Log(e);
				await _dialogService.ShowErrorAsync(Properties.Resources.DialogErrorWhileRetrievingSuspectsInformation, MessageDialogStyle.Affirmative);
			}
		}

		private async void HandleLoadSuspectListMessage(LoadSuspectListMessage m)
		{
			if (!AppSettings.IsInternetConnectionAvailable())
			{
				await _dialogService.ShowNoInternetConnectionAsync();
				return;
			}

			IsLoadSuspects = false;
			IsRefreshing = true;
			IsAnalyzing = true;
			List<Suspect> suspectList = await _steamService.GetBanStatusForUserList(m.SteamIdList);
			UpdateSuspectList(suspectList);
			IsRefreshing = false;
			IsAnalyzing = false;
		}

		private void UpdateSuspectList(List<Suspect> suspectList)
		{
			SelectedSuspects.Clear();
			Suspects.Clear();
			foreach (Suspect suspect in suspectList)
			{
				Suspects.Add(suspect);
			}
		}

		public override void Cleanup()
		{
			base.Cleanup();
			SelectedSuspect = null;
			Suspects.Clear();
			SelectedSuspects.Clear();
			_cts = null;
		}

		public void Dispose()
		{
			_cts.Dispose();
		}
	}
}
