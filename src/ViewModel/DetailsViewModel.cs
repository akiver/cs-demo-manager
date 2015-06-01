using System;
using System.ComponentModel;
using System.Diagnostics;
using CSGO_Demos_Manager.Models;
using GalaSoft.MvvmLight;
using GalaSoft.MvvmLight.CommandWpf;
using System.Threading.Tasks;
using System.Windows.Data;
using CSGO_Demos_Manager.Views;
using CSGO_Demos_Manager.Services;
using MahApps.Metro.Controls.Dialogs;
using System.Windows.Forms;
using CSGO_Demos_Manager.Exceptions.Heatmap;
using CSGO_Demos_Manager.Internals;
using CSGO_Demos_Manager.Services.Excel;

namespace CSGO_Demos_Manager.ViewModel
{
	public class DetailsViewModel : ViewModelBase
	{
		#region Properties

		private Demo _currentDemo;

		private Round _currentRound;

		private readonly IDemosService _demosService;

		private readonly DialogService _dialogService;

		private readonly ExcelService _excelService;

		private readonly ISteamService _steamService;

		private readonly ICacheService _cacheService;

		private PlayerExtended _selectedPlayerTeam1;

		private PlayerExtended _selectedPlayerTeam2;

		private bool _isAnalyzing;

		private bool _hasNotification;

		private string _notificationMessage;

		private RelayCommand<Demo> _analyzeDemoCommand;

		private RelayCommand<Demo> _heatmapCommand;

		private RelayCommand<Demo> _overviewCommand;

		private RelayCommand<Demo> _goToKillsCommand;

		private RelayCommand<string> _saveCommentDemoCommand;

		private RelayCommand<string> _addSuspectCommand;

		private RelayCommand<Round> _watchRoundCommand;

		private RelayCommand<PlayerExtended> _goToSuspectProfileCommand;

		private RelayCommand<PlayerExtended> _watchHighlightsCommand;

		private RelayCommand<PlayerExtended> _watchLowlightsCommand;

		private RelayCommand _exportDemoToExcelCommand;

		private ICollectionView _playersTeam1Collection;

		private ICollectionView _playersTeam2Collection;

		#endregion

		#region Accessors

		public Demo CurrentDemo
		{
			get { return _currentDemo; }
			set
			{
				Set(() => CurrentDemo, ref _currentDemo, value);
				PlayersTeam1Collection = CollectionViewSource.GetDefaultView(_currentDemo.PlayersTeam1);
				PlayersTeam2Collection = CollectionViewSource.GetDefaultView(_currentDemo.PlayersTeam2);
				PlayersTeam1Collection.SortDescriptions.Add(new SortDescription("RatingHltv", ListSortDirection.Descending));
				PlayersTeam2Collection.SortDescriptions.Add(new SortDescription("RatingHltv", ListSortDirection.Descending));
			}
		}

		public Round CurrentRound
		{
			get { return _currentRound; }
			set { Set(() => CurrentRound, ref _currentRound, value); }
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

		public ICollectionView PlayersTeam2Collection
		{
			get { return _playersTeam2Collection; }
			set { Set(() => PlayersTeam2Collection, ref _playersTeam2Collection, value); }
		}

		#endregion

		#region Commands

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
						try
						{
							var heatmapViewModel = (new ViewModelLocator()).Heatmap;
							heatmapViewModel.CurrentDemo = demo;
							heatmapViewModel.HasGeneratedHeatmap = false;

							HeatmapView heatmapView = new HeatmapView();
							var mainViewModel = (new ViewModelLocator()).Main;
							mainViewModel.CurrentPage.ShowPage(heatmapView);
						}
						catch (MapHeatmapUnavailableException e)
						{
							await _dialogService.ShowErrorAsync(e.Message, MessageDialogStyle.Affirmative);
						}
					}, demo => !IsAnalyzing));
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
					}, demo => !IsAnalyzing));
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
					}, demo => !IsAnalyzing));
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
						player =>
						{
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
						player =>
						{
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
								await _excelService.GenerateXls(CurrentDemo, saveHeatmapDialog.FileName);
							}

						},
						() => CurrentDemo != null && !IsAnalyzing));
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

						try
						{
							CurrentDemo = await _demosService.AnalyzeDemo(demo);
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
					},
					demo => !IsAnalyzing));
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
					round =>
					{
						GameLauncher launcher = new GameLauncher();
						launcher.WatchDemoAt(CurrentDemo, round.Tick);
					},
					round => CurrentDemo != null && CurrentRound != null && AppSettings.IsCsgoInstalled()));
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
								if (!added)
								{
									HasNotification = false;
									IsAnalyzing = false;
									await _dialogService.ShowErrorAsync("Error while adding user to suspects list.", MessageDialogStyle.Affirmative);
									return;
								}
							}
							catch (Exception e)
							{
								Logger.Instance.Log(e);
								await _dialogService.ShowErrorAsync("Error while trying to get suspect information.", MessageDialogStyle.Affirmative);
							}

							IsAnalyzing = false;
							NotificationMessage = "Player added to suspects list.";
							await Task.Delay(5000);
							HasNotification = false;
						}));
			}
		}

		#endregion

		public DetailsViewModel(IDemosService demosService, DialogService dialogService, ISteamService steamService, ICacheService cacheService, ExcelService excelService)
		{
			_demosService = demosService;
			_dialogService = dialogService;
			_steamService = steamService;
			_cacheService = cacheService;
			_excelService = excelService;

			if (IsInDesignModeStatic)
			{
				var demo = _demosService.AnalyzeDemo(new Demo());
				CurrentDemo = demo.Result;
			}
		}
	}
}
