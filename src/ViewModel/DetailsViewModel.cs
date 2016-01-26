using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Diagnostics;
using System.Linq;
using System.Threading;
using CSGO_Demos_Manager.Models;
using GalaSoft.MvvmLight;
using GalaSoft.MvvmLight.CommandWpf;
using System.Threading.Tasks;
using System.Windows.Data;
using CSGO_Demos_Manager.Views;
using CSGO_Demos_Manager.Services;
using MahApps.Metro.Controls.Dialogs;
using System.Windows.Forms;
using System.Windows.Input;
using CSGO_Demos_Manager.Internals;
using CSGO_Demos_Manager.Messages;
using CSGO_Demos_Manager.Models.Source;
using CSGO_Demos_Manager.Models.Steam;
using CSGO_Demos_Manager.Services.Excel;
using CSGO_Demos_Manager.Services.Interfaces;
using GalaSoft.MvvmLight.Messaging;
using Application = System.Windows.Application;

namespace CSGO_Demos_Manager.ViewModel
{
	public class DetailsViewModel : ViewModelBase
	{
		#region Properties

		private Demo _currentDemo;

		private Round _selectedRound;

		private readonly IDemosService _demosService;

		private readonly DialogService _dialogService;

		private readonly ExcelService _excelService;

		private readonly ISteamService _steamService;

		private readonly ICacheService _cacheService;

		private PlayerExtended _selectedPlayerTeam1;

		private PlayerExtended _selectedPlayerTeam2;

		private bool _isAnalyzing;

		private bool _isLeftSideVisible = Properties.Settings.Default.ShowLeftPartDetails;

		private bool _hasNotification;

		private string _notificationMessage;

		private CancellationTokenSource _cts;

		private RelayCommand _windowLoadedCommand;

		private RelayCommand _backToHomeCommand;

		private RelayCommand<Demo> _analyzeDemoCommand;

		private RelayCommand<int> _goToRoundCommand;

		private RelayCommand<Demo> _heatmapCommand;

		private RelayCommand<Demo> _overviewCommand;

		private RelayCommand<Demo> _goToKillsCommand;

		private RelayCommand<Demo> _goToDemoDamagesCommand;

		private RelayCommand<Demo> _goToDemoFlashbangsCommand;

		private RelayCommand<string> _saveCommentDemoCommand;

		private RelayCommand<string> _addSuspectCommand;

		private RelayCommand<string> _addPlayerToWhitelistCommand;

		private RelayCommand<Round> _watchRoundCommand;

		private RelayCommand<PlayerExtended> _goToSuspectProfileCommand;

		private RelayCommand<PlayerExtended> _watchHighlightsCommand;

		private RelayCommand<PlayerExtended> _watchLowlightsCommand;

		private RelayCommand _exportDemoToExcelCommand;

		private RelayCommand<bool> _showAllPlayersCommand;

		private RelayCommand _toggleLeftSideCommand;

		private RelayCommand<string> _addPlayerToAccountListCommand;

		private RelayCommand<PlayerExtended> _showPlayerDemosCommand;

		private ICollectionView _playersTeam1Collection;

		private ICollectionView _playersTeam2Collection;

		private ICollectionView _roundsCollection;

		#endregion

		#region Accessors

		public Demo CurrentDemo
		{
			get { return _currentDemo; }
			set { Set(() => CurrentDemo, ref _currentDemo, value); }
		}

		public Round SelectedRound
		{
			get { return _selectedRound; }
			set { Set(() => SelectedRound, ref _selectedRound, value); }
		}

		public PlayerExtended SelectedPlayerTeam1
		{
			get { return _selectedPlayerTeam1; }
			set { Set(() => SelectedPlayerTeam1, ref _selectedPlayerTeam1, value); }
		}

		public PlayerExtended SelectedPlayerTeam2
		{
			get { return _selectedPlayerTeam2; }
			set { Set(() => SelectedPlayerTeam2, ref _selectedPlayerTeam2, value); }
		}

		public bool IsAnalyzing
		{
			get { return _isAnalyzing; }
			set { Set(() => IsAnalyzing, ref _isAnalyzing, value); }
		}

		public bool IsLeftSideVisible
		{
			get { return _isLeftSideVisible; }
			set
			{
				Properties.Settings.Default.ShowLeftPartDetails = value;
				Properties.Settings.Default.Save();
				Set(() => IsLeftSideVisible, ref _isLeftSideVisible, value);
			}
		}

		public bool HasNotification
		{
			get { return _hasNotification; }
			set { Set(() => HasNotification, ref _hasNotification, value); }
		}

		public string NotificationMessage
		{
			get { return _notificationMessage; }
			set { Set(() => NotificationMessage, ref _notificationMessage, value); }
		}

		public ICollectionView PlayersTeam1Collection
		{
			get { return _playersTeam1Collection; }
			set { Set(() => PlayersTeam1Collection, ref _playersTeam1Collection, value); }
		}

		public ICollectionView RoundsCollection
		{
			get { return _roundsCollection; }
			set { Set(() => RoundsCollection, ref _roundsCollection, value); }
		}

		public ICollectionView PlayersTeam2Collection
		{
			get { return _playersTeam2Collection; }
			set { Set(() => PlayersTeam2Collection, ref _playersTeam2Collection, value); }
		}

		#endregion

		#region Commands

		public RelayCommand WindowLoaded
		{
			get
			{
				return _windowLoadedCommand
					?? (_windowLoadedCommand = new RelayCommand(
					() =>
					{
						PlayersTeam1Collection = CollectionViewSource.GetDefaultView(_currentDemo.TeamCT.Players);
						PlayersTeam2Collection = CollectionViewSource.GetDefaultView(_currentDemo.TeamT.Players);
						PlayersTeam1Collection.SortDescriptions.Add(new SortDescription("RatingHltv", ListSortDirection.Descending));
						PlayersTeam2Collection.SortDescriptions.Add(new SortDescription("RatingHltv", ListSortDirection.Descending));
						RoundsCollection = CollectionViewSource.GetDefaultView(_currentDemo.Rounds);
						if (AppSettings.IsInternetConnectionAvailable() && CurrentDemo.Players.Any())
						{
							Task.Run(async () =>
							{
								IEnumerable<string> steamIdList = CurrentDemo.Players.Select(p => p.SteamId.ToString()).Distinct();
								List<PlayerSummary> playerSummaryList = await _steamService.GetUserSummaryAsync(steamIdList.ToList());
								foreach (PlayerSummary playerSummary in playerSummaryList)
								{
									CurrentDemo.Players.First(p => p.SteamId.ToString() == playerSummary.SteamId).AvatarUrl = playerSummary.AvatarMedium;
								}
							});
						}
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
						var mainViewModel = (new ViewModelLocator()).Main;
						Application.Current.Properties["LastPageViewed"] = mainViewModel.CurrentPage.CurrentPage;
						HomeView homeView = new HomeView();
						mainViewModel.CurrentPage.ShowPage(homeView);
					}));
			}
		}

		/// <summary>
		/// Command to go to round control
		/// </summary>
		public RelayCommand<int> ShowRoundCommand
		{
			get
			{
				return _goToRoundCommand
					?? (_goToRoundCommand = new RelayCommand<int>(
					roundNumber =>
					{
						var roundViewModel = (new ViewModelLocator()).Round;
						roundViewModel.RoundNumber = roundNumber;
						roundViewModel.CurrentDemo = CurrentDemo;
						RoundView roundView = new RoundView();
						var mainViewModel = (new ViewModelLocator()).Main;
						mainViewModel.CurrentPage.ShowPage(roundView);
					}, roundNumber => !IsAnalyzing && CurrentDemo != null
					&& CurrentDemo.Source.GetType() != typeof(Pov) && SelectedRound != null));
			}
		}

		/// <summary>
		/// Command to go to heatmap control
		/// </summary>
		public RelayCommand<Demo> HeatmapCommand
		{
			get
			{
				return _heatmapCommand
					?? (_heatmapCommand = new RelayCommand<Demo>(
					demo =>
					{
						var heatmapViewModel = (new ViewModelLocator()).Heatmap;
						heatmapViewModel.CurrentDemo = demo;
						HeatmapView heatmapView = new HeatmapView();
						var mainViewModel = (new ViewModelLocator()).Main;
						mainViewModel.CurrentPage.ShowPage(heatmapView);
					}, demo => !IsAnalyzing && CurrentDemo != null && CurrentDemo.Source.GetType() != typeof(Pov)));
			}
		}

		/// <summary>
		/// Command to go to overview control
		/// </summary>
		public RelayCommand<Demo> OverviewCommand
		{
			get
			{
				return _overviewCommand
					?? (_overviewCommand = new RelayCommand<Demo>(
					demo =>
					{
						var overviewViewModel = (new ViewModelLocator()).Overview;
						overviewViewModel.CurrentDemo = demo;
						OverviewView overviewView = new OverviewView();
						var mainViewModel = (new ViewModelLocator()).Main;
						mainViewModel.CurrentPage.ShowPage(overviewView);
					}, demo => !IsAnalyzing && CurrentDemo != null && CurrentDemo.Source.GetType() != typeof(Pov)));
			}
		}

		/// <summary>
		/// Command to go to kills control
		/// </summary>
		public RelayCommand<Demo> GoToKillsCommand
		{
			get
			{
				return _goToKillsCommand
					?? (_goToKillsCommand = new RelayCommand<Demo>(
					demo =>
					{
						var entryKillsViewModel = (new ViewModelLocator()).Kills;
						entryKillsViewModel.CurrentDemo = demo;
						KillsView killsView = new KillsView();
						var mainViewModel = (new ViewModelLocator()).Main;
						mainViewModel.CurrentPage.ShowPage(killsView);
					}, demo => !IsAnalyzing && CurrentDemo != null && CurrentDemo.Source.GetType() != typeof(Pov)));
			}
		}

		/// <summary>
		/// Command to go to demo damages control
		/// </summary>
		public RelayCommand<Demo> GoToDemoDamagesCommand
		{
			get
			{
				return _goToDemoDamagesCommand
					?? (_goToDemoDamagesCommand = new RelayCommand<Demo>(
					demo =>
					{
						var demoDamagesViewModel = (new ViewModelLocator()).DemoDamages;
						demoDamagesViewModel.CurrentDemo = demo;
						DemoDamagesView demoDamagesView = new DemoDamagesView();
						var mainViewModel = (new ViewModelLocator()).Main;
						mainViewModel.CurrentPage.ShowPage(demoDamagesView);
					}, demo => !IsAnalyzing && CurrentDemo != null && CurrentDemo.Source.GetType() != typeof(Pov)));
			}
		}

		/// <summary>
		/// Command to go to demo flashbangs stats control
		/// </summary>
		public RelayCommand<Demo> GoToDemoFlashbangsCommand
		{
			get
			{
				return _goToDemoFlashbangsCommand
					?? (_goToDemoFlashbangsCommand = new RelayCommand<Demo>(
					async demo =>
					{
						if (!_cacheService.HasDemoInCache(demo))
						{
							await _dialogService.ShowMessageAsync("You have to analyze this demo first.", MessageDialogStyle.Affirmative);
							return;
						}
						var demoFlashbangsViewModel = (new ViewModelLocator()).DemoFlashbangs;
						demoFlashbangsViewModel.CurrentDemo = demo;
						DemoFlashbangsView demoFlashbangsView = new DemoFlashbangsView();
						var mainViewModel = (new ViewModelLocator()).Main;
						mainViewModel.CurrentPage.ShowPage(demoFlashbangsView);
					}, demo => !IsAnalyzing && CurrentDemo != null && CurrentDemo.Source.GetType() != typeof(Pov)));
			}
		}

		public RelayCommand<PlayerExtended> GoToSuspectProfileCommand
		{
			get
			{
				return _goToSuspectProfileCommand
					?? (_goToSuspectProfileCommand = new RelayCommand<PlayerExtended>(
						async player =>
						{
							try
							{
								Suspect suspect = await _steamService.GetBanStatusForUser(player.SteamId.ToString());
								Process.Start(suspect.ProfileUrl);
							}
							catch (Exception e)
							{
								Logger.Instance.Log(e);
								await _dialogService.ShowErrorAsync("Error while trying to get suspect information.", MessageDialogStyle.Affirmative);
							}
							
						},
						suspect => SelectedPlayerTeam1 != null || SelectedPlayerTeam2 != null));
			}
		}

		public RelayCommand<PlayerExtended> WatchHighlights
		{
			get
			{
				return _watchHighlightsCommand
					?? (_watchHighlightsCommand = new RelayCommand<PlayerExtended>(
						async player =>
						{
							if (AppSettings.SteamExePath() == null)
							{
								await _dialogService.ShowMessageAsync("Steam doesn't seems to be installed." + Environment.NewLine
									+ "Unable to start the game.", MessageDialogStyle.Affirmative);
								return;
							}
							string steamId = player.SteamId.ToString();
							GameLauncher launcher = new GameLauncher();
							launcher.WatchHighlightDemo(CurrentDemo, steamId);
						},
						suspect => SelectedPlayerTeam1 != null || SelectedPlayerTeam2 != null));
			}
		}

		public RelayCommand<PlayerExtended> WatchLowlights
		{
			get
			{
				return _watchLowlightsCommand
					?? (_watchLowlightsCommand = new RelayCommand<PlayerExtended>(
						async player =>
						{
							if (AppSettings.SteamExePath() == null)
							{
								await _dialogService.ShowMessageAsync("Steam doesn't seems to be installed." + Environment.NewLine
									+ "Unable to start the game.", MessageDialogStyle.Affirmative);
								return;
							}
							string steamId = player.SteamId.ToString();
							GameLauncher launcher = new GameLauncher();
							launcher.WatchLowlightDemo(CurrentDemo, steamId);
						},
						suspect => SelectedPlayerTeam1 != null || SelectedPlayerTeam2 != null));
			}
		}

		public RelayCommand ExportDemoToExcelCommand
		{
			get
			{
				return _exportDemoToExcelCommand
					?? (_exportDemoToExcelCommand = new RelayCommand(
						async ()=>
						{
							SaveFileDialog saveHeatmapDialog = new SaveFileDialog
							{
								FileName = CurrentDemo.Name.Substring(0, CurrentDemo.Name.Length - 4) + "-export.xlsx",
								Filter = "XLSX file (*.xlsx)|*.xlsx"
							};

							if (saveHeatmapDialog.ShowDialog() == DialogResult.OK)
							{
								try
								{
									if (!_cacheService.HasDemoInCache(CurrentDemo))
									{
										IsAnalyzing = true;
										HasNotification = true;
										NotificationMessage = "Analyzing " + CurrentDemo.Name + " for export...";
										await _demosService.AnalyzeDemo(CurrentDemo, CancellationToken.None);
									}
									await _excelService.GenerateXls(CurrentDemo, saveHeatmapDialog.FileName);
								}
								catch (Exception e)
								{
									Logger.Instance.Log(e);
									await _dialogService.ShowErrorAsync("An error occured while exporting the demo.",
										MessageDialogStyle.Affirmative);
								}
								finally
								{
									IsAnalyzing = false;
									HasNotification = false;
								}
							}

						},
						() => CurrentDemo != null && !IsAnalyzing && CurrentDemo.Source.GetType() != typeof(Pov)));
			}
		}

		/// <summary>
		/// Command to start current demo analysis
		/// </summary>
		public RelayCommand<Demo> AnalyzeDemoCommand
		{
			get
			{
				return _analyzeDemoCommand
					?? (_analyzeDemoCommand = new RelayCommand<Demo>(
					async demo =>
					{
						NotificationMessage = "Analyzing...";
						IsAnalyzing = true;
						HasNotification = true;
						(new ViewModelLocator().Settings).IsShowAllPlayers = true;

						try
						{
							if (_cts == null)
							{
								_cts = new CancellationTokenSource();
							}

							CurrentDemo = await _demosService.AnalyzeDemo(demo, _cts.Token);
							if (AppSettings.IsInternetConnectionAvailable())
							{
								await _demosService.AnalyzeBannedPlayersAsync(demo);
							}
							await _cacheService.WriteDemoDataCache(demo);
						}
						catch (Exception e)
						{
							Logger.Instance.Log(e);
							await _dialogService.ShowErrorAsync("An error occured while analyzing the demo " + demo.Name + "." +
																"The demo may be too old, if not please send an email with the attached demo." +
																"You can find more information on http://csgo-demos-manager.com.", MessageDialogStyle.Affirmative);
						}
						
						IsAnalyzing = false;
						HasNotification = false;
						CommandManager.InvalidateRequerySuggested();
					},
					demo => !IsAnalyzing && CurrentDemo != null && CurrentDemo.Source.GetType() != typeof(Pov)));
			}
		}

		/// <summary>
		/// Command to save demo's comment
		/// </summary>
		public RelayCommand<string> SaveCommentDemoCommand
		{
			get
			{
				return _saveCommentDemoCommand
					?? (_saveCommentDemoCommand = new RelayCommand<string>(
					async comment =>
					{
						await _demosService.SaveComment(CurrentDemo, comment);
						HasNotification = true;
						NotificationMessage = "Comment saved.";
						await Task.Delay(5000);
						HasNotification = false;
					}));
			}
		}

		/// <summary>
		/// Command to watch a specific round
		/// </summary>
		public RelayCommand<Round> WatchRoundCommand
		{
			get
			{
				return _watchRoundCommand
					?? (_watchRoundCommand = new RelayCommand<Round>(
					async round =>
					{
						if (AppSettings.SteamExePath() == null)
						{
							await _dialogService.ShowMessageAsync("Steam doesn't seems to be installed." + Environment.NewLine
								+ "Unable to start the game.", MessageDialogStyle.Affirmative);
							return;
						}
						GameLauncher launcher = new GameLauncher();
						launcher.WatchDemoAt(CurrentDemo, round.Tick);
					},
					round => CurrentDemo != null && SelectedRound != null));
			}
		}

		/// <summary>
		/// Command to add a suspect to the list
		/// </summary>
		public RelayCommand<string> AddSuspectCommand
		{
			get
			{
				return _addSuspectCommand
					?? (_addSuspectCommand = new RelayCommand<string>(
						async steamCommunityUrl =>
						{
							if (!AppSettings.IsInternetConnectionAvailable())
							{
								await _dialogService.ShowNoInternetConnectionAsync();
								return;
							}

							NotificationMessage = "Adding player to suspects list...";
							HasNotification = true;
							IsAnalyzing = true;

							try
							{
								Suspect suspect = await _steamService.GetBanStatusForUser(steamCommunityUrl);

								if (suspect == null)
								{
									HasNotification = false;
									IsAnalyzing = false;
									await _dialogService.ShowErrorAsync("User not found", MessageDialogStyle.Affirmative);
									return;
								}

								bool added = await _cacheService.AddSuspectToCache(suspect.SteamId);
								IsAnalyzing = false;
								if (!added)
								{
									await _dialogService.ShowMessageAsync("This player is already in your suspect or he is in your account list." + Environment.NewLine
											+ "You have to remove it from your account list to be able to add him in your supect list.",
											MessageDialogStyle.Affirmative);
								}
								HasNotification = false;
							}
							catch (Exception e)
							{
								Logger.Instance.Log(e);
								await _dialogService.ShowErrorAsync("Error while trying to get suspect information.", MessageDialogStyle.Affirmative);
							}

							IsAnalyzing = false;
							NotificationMessage = "Player added to suspects list.";
							CommandManager.InvalidateRequerySuggested();
							await Task.Delay(5000);
							HasNotification = false;
						}));
			}
		}

		/// <summary>
		/// Command to add a player to the whitelist
		/// </summary>
		public RelayCommand<string> AddPlayerToWhitelistCommand
		{
			get
			{
				return _addPlayerToWhitelistCommand
					?? (_addPlayerToWhitelistCommand = new RelayCommand<string>(
						async steamCommunityUrl =>
						{
							if (!AppSettings.IsInternetConnectionAvailable())
							{
								await _dialogService.ShowNoInternetConnectionAsync();
								return;
							}

							NotificationMessage = "Adding player to whitelist...";
							HasNotification = true;
							IsAnalyzing = true;

							try
							{
								Suspect suspect = await _steamService.GetBanStatusForUser(steamCommunityUrl);

								if (suspect == null)
								{
									HasNotification = false;
									IsAnalyzing = false;
									await _dialogService.ShowErrorAsync("User not found", MessageDialogStyle.Affirmative);
									return;
								}

								bool added = await _cacheService.AddPlayerToWhitelist(suspect.SteamId);
								IsAnalyzing = false;
								if (!added)
								{
									await _dialogService.ShowMessageAsync("This player is already in your whitelist or he is in your account list." + Environment.NewLine
											+ "You have to remove it from your account list to be able to add him in your whitelist.",
											MessageDialogStyle.Affirmative);
								}
								HasNotification = false;
							}
							catch (Exception e)
							{
								Logger.Instance.Log(e);
								await _dialogService.ShowErrorAsync("Error while trying to get player information.", MessageDialogStyle.Affirmative);
							}

							IsAnalyzing = false;
							NotificationMessage = "Player added to whitelist.";
							CommandManager.InvalidateRequerySuggested();
							await Task.Delay(5000);
							HasNotification = false;
						}));
			}
		}

		/// <summary>
		/// Command when the checkbox to toggle specific player's stats is clicked
		/// </summary>
		public RelayCommand<bool> ShowAllPlayersCommand
		{
			get
			{
				return _showAllPlayersCommand
					?? (_showAllPlayersCommand = new RelayCommand<bool>(
						isChecked =>
						{
							var settingsViewModel = (new ViewModelLocator().Settings);
							settingsViewModel.IsShowAllPlayers = isChecked;
							if (!isChecked)
							{
								settingsViewModel.SelectedPlayer = CurrentDemo.Players[0];
							}
							RoundsCollection.Refresh();
						},
						isChecked => !IsAnalyzing && CurrentDemo.Players.Any()));
			}
		}

		/// <summary>
		/// Command to go to toggle the left side of the view
		/// </summary>
		public RelayCommand ToggleLeftSideCommand
		{
			get
			{
				return _toggleLeftSideCommand
					?? (_toggleLeftSideCommand = new RelayCommand(
					() =>
					{
						IsLeftSideVisible = !IsLeftSideVisible;
					}));
			}
		}

		/// <summary>
		/// Command to add a player to accounts list
		/// </summary>
		public RelayCommand<string> AddPlayerToAccountListCommand
		{
			get
			{
				return _addPlayerToAccountListCommand
					?? (_addPlayerToAccountListCommand = new RelayCommand<string>(
					async steamId =>
					{
						NotificationMessage = "Adding player to the account list...";
						HasNotification = true;
						IsAnalyzing = true;

						bool added = false;
						try
						{
							Account account = new Account
							{
								SteamId = steamId
							};

							if (AppSettings.IsInternetConnectionAvailable())
							{
								Suspect player = await _steamService.GetBanStatusForUser(steamId);
								account.Name = player.Nickname;
							}
							else
							{
								account.Name = steamId;
							}

							added = await _cacheService.AddAccountAsync(account);
							if (!added)
							{
								await
									_dialogService.ShowErrorAsync("This player is already in your account list.", MessageDialogStyle.Affirmative);
							}
							else
							{
								var settingsViewModel = (new ViewModelLocator()).Settings;
								settingsViewModel.Accounts.Add(account);
							}
						}
						catch (Exception e)
						{
							Logger.Instance.Log(e);
							await _dialogService.ShowErrorAsync("Error while trying to get player information.", MessageDialogStyle.Affirmative);
						}

						IsAnalyzing = false;
						if(added) NotificationMessage = "Player added to the account list.";
						CommandManager.InvalidateRequerySuggested();
						if(added) await Task.Delay(5000);
						HasNotification = false;
					}));
			}
		}

		/// <summary>
		/// Command to display demos within selected player has played
		/// </summary>
		public RelayCommand<PlayerExtended> ShowPlayerDemosCommand
		{
			get
			{
				return _showPlayerDemosCommand
					?? (_showPlayerDemosCommand = new RelayCommand<PlayerExtended>(
						async player =>
						{
							IsAnalyzing = true;
							HasNotification = true;
							NotificationMessage = "Searching demos with this player...";
							List<Demo> demos = await _demosService.GetDemosPlayer(player.SteamId.ToString());
							IsAnalyzing = false;
							HasNotification = false;
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
							Application.Current.Properties["LastPageViewed"] = mainViewModel.CurrentPage.CurrentPage;
							HomeView homeView = new HomeView();
							mainViewModel.CurrentPage.ShowPage(homeView);
						},
						player => SelectedPlayerTeam1 != null || SelectedPlayerTeam2 != null));
			}
		}

		#endregion

		public DetailsViewModel(IDemosService demosService, DialogService dialogService, ISteamService steamService,
			ICacheService cacheService, ExcelService excelService)
		{
			_demosService = demosService;
			_dialogService = dialogService;
			_steamService = steamService;
			_cacheService = cacheService;
			_excelService = excelService;

			if (IsInDesignModeStatic)
			{
				Application.Current.Dispatcher.Invoke(async () =>
				{
					CurrentDemo = await _demosService.AnalyzeDemo(new Demo(), CancellationToken.None);
				});
			}

			Messenger.Default.Register<SelectedPlayerChangedMessage>(this, HandleSelectedPlayerChangedMessage);
		}

		private void HandleSelectedPlayerChangedMessage(SelectedPlayerChangedMessage msg)
		{
			RoundsCollection.Refresh();
		}

		public override void Cleanup()
		{
			base.Cleanup();
			HasNotification = false;
			IsAnalyzing = false;
			SelectedPlayerTeam1 = null;
			SelectedPlayerTeam2 = null;
			PlayersTeam1Collection = null;
			PlayersTeam2Collection = null;
			RoundsCollection = null;
			SelectedRound = null;
			NotificationMessage = string.Empty;
		}
	}
}
