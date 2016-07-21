using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Diagnostics;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Data;
using System.Windows.Forms;
using System.Windows.Input;
using Core;
using Core.Models;
using Core.Models.Source;
using Core.Models.Steam;
using GalaSoft.MvvmLight;
using GalaSoft.MvvmLight.CommandWpf;
using GalaSoft.MvvmLight.Threading;
using MahApps.Metro.Controls.Dialogs;
using Manager.Properties;
using Manager.Services;
using Manager.Views.Demos;
using Manager.Views.Players;
using Manager.Views.Rounds;
using Services.Concrete.Excel;
using Services.Concrete.Maps;
using Services.Interfaces;
using Application = System.Windows.Application;
using Round = Core.Models.Round;

namespace Manager.ViewModel.Demos
{
	public class DemoDetailsViewModel : ViewModelBase
	{
		#region Properties

		private Demo _currentDemo;

		private Round _selectedRound;

		private readonly IDemosService _demosService;

		private readonly IRoundService _roundService;

		private readonly DialogService _dialogService;

		private readonly ExcelService _excelService;

		private readonly ISteamService _steamService;

		private readonly ICacheService _cacheService;

		// player selected in the scoreboard
		private Player _selectedPlayer;

		// player selected in the combobox
		private Player _selectedPlayerStats;

		private bool _isAnalyzing;

		private bool _isLeftSideVisible = Settings.Default.ShowLeftPartDetails;

		private bool _hasNotification;

		private string _notificationMessage;

		private CancellationTokenSource _cts;

		private RelayCommand _windowLoadedCommand;

		private RelayCommand _backToHomeCommand;

		private RelayCommand<Demo> _analyzeDemoCommand;

		private RelayCommand<int> _goToRoundCommand;

		private RelayCommand<Player> _goToPlayerCommand;

		private RelayCommand<Demo> _heatmapCommand;

		private RelayCommand<Demo> _overviewCommand;

		private RelayCommand<Demo> _goToKillsCommand;

		private RelayCommand<Demo> _goToDemoDamagesCommand;

		private RelayCommand<Demo> _goToDemoFlashbangsCommand;

		private RelayCommand<Demo> _showDemoStuffsCommand;

		private RelayCommand<string> _saveCommentDemoCommand;

		private RelayCommand<string> _addSuspectCommand;

		private RelayCommand<string> _addPlayerToWhitelistCommand;

		private RelayCommand<Round> _watchRoundCommand;

		private RelayCommand<Player> _goToSuspectProfileCommand;

		private RelayCommand<Player> _watchPlayerCommand;

		private RelayCommand<Player> _watchHighlightsCommand;

		private RelayCommand<Player> _watchLowlightsCommand;

		private RelayCommand _exportDemoToExcelCommand;

		private RelayCommand<bool> _showAllPlayersCommand;

		private RelayCommand _toggleLeftSideCommand;

		private RelayCommand<string> _addPlayerToAccountListCommand;

		private RelayCommand<Player> _showPlayerDemosCommand;

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

		public Player SelectedPlayer
		{
			get { return _selectedPlayer; }
			set { Set(() => SelectedPlayer, ref _selectedPlayer, value); }
		}

		public Player SelectedPlayerStats
		{
			get { return _selectedPlayerStats; }
			set
			{
				Set(() => SelectedPlayerStats, ref _selectedPlayerStats, value);
				UpdateRoundListStats();
			}
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
				Settings.Default.ShowLeftPartDetails = value;
				Settings.Default.Save();
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
					async () =>
					{
						var currentPage = new ViewModelLocator().Main.CurrentPage.CurrentPage;
						IsAnalyzing = true;
						NotificationMessage = "Loading...";
						HasNotification = true;
						// reload whole demo data if an account was selected and the current page was the demos list
						if (Settings.Default.SelectedStatsAccountSteamID != 0 && currentPage is DemoListView)
							_currentDemo = await _cacheService.GetDemoDataFromCache(CurrentDemo.Id);
						PlayersTeam1Collection = CollectionViewSource.GetDefaultView(CurrentDemo.TeamCT.Players);
						PlayersTeam2Collection = CollectionViewSource.GetDefaultView(CurrentDemo.TeamT.Players);
						PlayersTeam1Collection.SortDescriptions.Add(new SortDescription("RatingHltv", ListSortDirection.Descending));
						PlayersTeam2Collection.SortDescriptions.Add(new SortDescription("RatingHltv", ListSortDirection.Descending));
						RoundsCollection = CollectionViewSource.GetDefaultView(CurrentDemo.Rounds);
						if (AppSettings.IsInternetConnectionAvailable() && CurrentDemo.Players.Any())
						{
							IEnumerable<string> steamIdList = CurrentDemo.Players.Select(p => p.SteamId.ToString()).Distinct();
							List<PlayerSummary> playerSummaryList = await _steamService.GetUserSummaryAsync(steamIdList.ToList());
							foreach (PlayerSummary playerSummary in playerSummaryList)
							{
								CurrentDemo.Players.First(p => p.SteamId.ToString() == playerSummary.SteamId).AvatarUrl = playerSummary.AvatarFull;
							}
						}
						new ViewModelLocator().Settings.IsShowAllPlayers = true;
						IsAnalyzing = false;
						HasNotification = false;
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
						if (SelectedPlayerStats != null && SelectedPlayerStats.SteamId != 0)
						{
							var settingsViewModel = new ViewModelLocator().Settings;
							settingsViewModel.IsShowAllPlayers = true;
						}
						var mainViewModel = new ViewModelLocator().Main;
						Application.Current.Properties["LastPageViewed"] = mainViewModel.CurrentPage.CurrentPage;
						DemoListView demoListView = new DemoListView();
						mainViewModel.CurrentPage.ShowPage(demoListView);
						Cleanup();
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
						var roundViewModel = new ViewModelLocator().RoundDetails;
						roundViewModel.RoundNumber = roundNumber;
						roundViewModel.CurrentDemo = CurrentDemo;
						RoundDetailsView roundView = new RoundDetailsView();
						var mainViewModel = new ViewModelLocator().Main;
						mainViewModel.CurrentPage.ShowPage(roundView);
					}, roundNumber => !IsAnalyzing && CurrentDemo != null
					&& CurrentDemo.Source.GetType() != typeof(Pov) && SelectedRound != null));
			}
		}

		/// <summary>
		/// Command to go to player control
		/// </summary>
		public RelayCommand<Player> ShowPlayerCommand
		{
			get
			{
				return _goToPlayerCommand
					?? (_goToPlayerCommand = new RelayCommand<Player>(
					player =>
					{
						var playerViewModel = new ViewModelLocator().PlayerDetails;
						playerViewModel.CurrentPlayer = player;
						playerViewModel.CurrentDemo = CurrentDemo;
						PlayerDetailsView playerView = new PlayerDetailsView();
						var mainViewModel = new ViewModelLocator().Main;
						mainViewModel.CurrentPage.ShowPage(playerView);
					}, player => !IsAnalyzing && CurrentDemo != null
					&& CurrentDemo.Source.GetType() != typeof(Pov) && SelectedPlayer != null));
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
					async demo =>
					{
						if (!MapService.Maps.Contains(demo.MapName))
						{
							await _dialogService.ShowErrorAsync("This map doesn't support this feature.", MessageDialogStyle.Affirmative);
							return;
						}
						var heatmapViewModel = new ViewModelLocator().DemoHeatmap;
						heatmapViewModel.CurrentDemo = demo;
						DemoHeatmapView heatmapView = new DemoHeatmapView();
						var mainViewModel = new ViewModelLocator().Main;
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
						var overviewViewModel = new ViewModelLocator().DemoOverview;
						overviewViewModel.CurrentDemo = demo;
						DemoOverviewView overviewView = new DemoOverviewView();
						var mainViewModel = new ViewModelLocator().Main;
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
						var entryKillsViewModel = new ViewModelLocator().DemoKills;
						entryKillsViewModel.CurrentDemo = demo;
						DemoKillsView killsView = new DemoKillsView();
						var mainViewModel = new ViewModelLocator().Main;
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
						var demoDamagesViewModel = new ViewModelLocator().DemoDamages;
						demoDamagesViewModel.CurrentDemo = demo;
						DemoDamagesView demoDamagesView = new DemoDamagesView();
						var mainViewModel = new ViewModelLocator().Main;
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
						var demoFlashbangsViewModel = new ViewModelLocator().DemoFlashbangs;
						demoFlashbangsViewModel.CurrentDemo = demo;
						DemoFlashbangsView demoFlashbangsView = new DemoFlashbangsView();
						var mainViewModel = new ViewModelLocator().Main;
						mainViewModel.CurrentPage.ShowPage(demoFlashbangsView);
					}, demo => !IsAnalyzing && CurrentDemo != null && CurrentDemo.Source.GetType() != typeof(Pov)));
			}
		}

		public RelayCommand<Demo> ShowDemoStuffsCommand
		{
			get
			{
				return _showDemoStuffsCommand
					?? (_showDemoStuffsCommand = new RelayCommand<Demo>(
					async demo =>
					{
						if (!_cacheService.HasDemoInCache(demo))
						{
							await _dialogService.ShowMessageAsync("You have to analyze this demo first.", MessageDialogStyle.Affirmative);
							return;
						}
						var demoStuffsViewModel = new ViewModelLocator().DemoStuffs;
						demoStuffsViewModel.CurrentDemo = demo;
						DemoStuffsView demoStuffsView = new DemoStuffsView();
						var mainViewModel = new ViewModelLocator().Main;
						mainViewModel.CurrentPage.ShowPage(demoStuffsView);
					}, demo => !IsAnalyzing && CurrentDemo != null && CurrentDemo.Source.GetType() != typeof(Pov)));
			}
		}

		public RelayCommand<Player> GoToSuspectProfileCommand
		{
			get
			{
				return _goToSuspectProfileCommand
					?? (_goToSuspectProfileCommand = new RelayCommand<Player>(
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
						suspect => SelectedPlayer != null));
			}
		}

		public RelayCommand<Player> WatchPlayerCommand
		{
			get
			{
				return _watchPlayerCommand
					?? (_watchPlayerCommand = new RelayCommand<Player>(
						async player =>
						{
							if (AppSettings.SteamExePath() == null)
							{
								await _dialogService.ShowMessageAsync("Steam doesn't seems to be installed." + Environment.NewLine
									+ "Unable to start the game.", MessageDialogStyle.Affirmative);
								return;
							}
							Round firstRound = CurrentDemo.Rounds.FirstOrDefault();
							if (firstRound == null) return;
							GameLauncher launcher = new GameLauncher(CurrentDemo);
							launcher.WatchDemoAt(firstRound.Tick, false, player.SteamId);
						},
						suspect => SelectedPlayer != null));
			}
		}

		public RelayCommand<Player> WatchHighlights
		{
			get
			{
				return _watchHighlightsCommand
					?? (_watchHighlightsCommand = new RelayCommand<Player>(
						async player =>
						{
							if (AppSettings.SteamExePath() == null)
							{
								await _dialogService.ShowMessageAsync("Steam doesn't seems to be installed." + Environment.NewLine
									+ "Unable to start the game.", MessageDialogStyle.Affirmative);
								return;
							}
							string steamId = player.SteamId.ToString();
							GameLauncher launcher = new GameLauncher(CurrentDemo);
							var isPlayerPerspective = await _dialogService.ShowHighLowWatchAsync();
							launcher.WatchHighlightDemo(isPlayerPerspective == MessageDialogResult.Affirmative, steamId);
						},
						suspect => SelectedPlayer != null));
			}
		}

		public RelayCommand<Player> WatchLowlights
		{
			get
			{
				return _watchLowlightsCommand
					?? (_watchLowlightsCommand = new RelayCommand<Player>(
						async player =>
						{
							if (AppSettings.SteamExePath() == null)
							{
								await _dialogService.ShowMessageAsync("Steam doesn't seems to be installed." + Environment.NewLine
									+ "Unable to start the game.", MessageDialogStyle.Affirmative);
								return;
							}
							string steamId = player.SteamId.ToString();
							GameLauncher launcher = new GameLauncher(CurrentDemo);
							var isPlayerPerspective = await _dialogService.ShowHighLowWatchAsync();
							launcher.WatchLowlightDemo(isPlayerPerspective == MessageDialogResult.Affirmative, steamId);
						},
						suspect => SelectedPlayer != null));
			}
		}

		public RelayCommand ExportDemoToExcelCommand
		{
			get
			{
				return _exportDemoToExcelCommand
					?? (_exportDemoToExcelCommand = new RelayCommand(
						async () =>
						{
							if (SelectedPlayerStats != null && SelectedPlayerStats.SteamId != 0)
							{
								var isExportFocusedOnPlayer = await _dialogService.ShowExportPlayerStatsAsync(SelectedPlayerStats.Name);
								if (isExportFocusedOnPlayer == MessageDialogResult.Negative) return;
							}

							SaveFileDialog exportDialog = new SaveFileDialog
							{
								FileName = CurrentDemo.Name.Substring(0, CurrentDemo.Name.Length - 4) + "-export.xlsx",
								Filter = "XLSX file (*.xlsx)|*.xlsx"
							};

							if (exportDialog.ShowDialog() == DialogResult.OK)
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
									await _excelService.GenerateXls(CurrentDemo, exportDialog.FileName);
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
						new ViewModelLocator().Settings.IsShowAllPlayers = true;

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
						GameLauncher launcher = new GameLauncher(CurrentDemo);
						launcher.WatchDemoAt(round.Tick);
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
							var settingsViewModel = new ViewModelLocator().Settings;
							if (!isChecked)
								SelectedPlayerStats = CurrentDemo.Players[0];
							else
								SelectedPlayerStats = null;
							settingsViewModel.IsShowAllPlayers = isChecked;
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
								var settingsViewModel = new ViewModelLocator().Settings;
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
		public RelayCommand<Player> ShowPlayerDemosCommand
		{
			get
			{
				return _showPlayerDemosCommand
					?? (_showPlayerDemosCommand = new RelayCommand<Player>(
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

							var demoListViewModel = new ViewModelLocator().DemoList;
							demoListViewModel.SelectedDemos.Clear();
							demoListViewModel.Demos.Clear();
							foreach (Demo demo in demos)
							{
								demoListViewModel.Demos.Add(demo);
							}
							demoListViewModel.DataGridDemosCollection.Refresh();

							var mainViewModel = new ViewModelLocator().Main;
							Application.Current.Properties["LastPageViewed"] = mainViewModel.CurrentPage.CurrentPage;
							DemoListView demoListView = new DemoListView();
							mainViewModel.CurrentPage.ShowPage(demoListView);
						},
						player => SelectedPlayer != null));
			}
		}

		#endregion

		public DemoDetailsViewModel(
			IDemosService demosService, DialogService dialogService, ISteamService steamService,
			ICacheService cacheService, ExcelService excelService, IRoundService roundService)
		{
			_demosService = demosService;
			_dialogService = dialogService;
			_steamService = steamService;
			_cacheService = cacheService;
			_excelService = excelService;
			_roundService = roundService;

			if (IsInDesignMode)
			{
				DispatcherHelper.CheckBeginInvokeOnUI(async () =>
				{
					_currentDemo = await _cacheService.GetDemoDataFromCache(string.Empty);
					PlayersTeam1Collection = CollectionViewSource.GetDefaultView(CurrentDemo.TeamCT.Players);
					PlayersTeam2Collection = CollectionViewSource.GetDefaultView(CurrentDemo.TeamT.Players);
					RoundsCollection = CollectionViewSource.GetDefaultView(CurrentDemo.Rounds);
				});
			}
		}

		public override void Cleanup()
		{
			base.Cleanup();
			HasNotification = false;
			IsAnalyzing = false;
			SelectedPlayer = null;
			PlayersTeam1Collection = null;
			PlayersTeam2Collection = null;
			RoundsCollection = null;
			SelectedRound = null;
			SelectedPlayerStats = null;
			NotificationMessage = string.Empty;
		}

		private async void UpdateRoundListStats()
		{
			HasNotification = true;
			IsAnalyzing = true;
			NotificationMessage = "Loading...";
			if (SelectedPlayerStats == null && _cacheService.HasDemoInCache(CurrentDemo))
			{
				Demo demo = await _cacheService.GetDemoDataFromCache(CurrentDemo.Id);
				CurrentDemo.Rounds.Clear();
				foreach (Round round in demo.Rounds)
				{
					CurrentDemo.Rounds.Add(round);
				}
			}
			else
			{
				foreach (Round round in CurrentDemo.Rounds)
				{
					await _roundService.MapRoundValuesToSelectedPlayer(CurrentDemo, round, SelectedPlayerStats.SteamId);
				}
			}
			HasNotification = false;
			IsAnalyzing = false;
		}
	}
}
