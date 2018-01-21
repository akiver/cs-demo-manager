using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Windows.Forms;
using System.Windows.Input;
using System.Windows.Media.Imaging;
using Core;
using Core.Models;
using Core.Models.Events;
using GalaSoft.MvvmLight.CommandWpf;
using MahApps.Metro.Controls.Dialogs;
using Manager.Properties;
using Manager.Services;
using Manager.Services.Configuration;
using Manager.Views.Demos;
using Services.Interfaces;
using Services.Models.Charts;
using Services.Models.Stats;
using Telerik.Windows.Controls;
using Application = System.Windows.Application;
using ViewModelBase = GalaSoft.MvvmLight.ViewModelBase;

namespace Manager.ViewModel.Players
{
	public class PlayerDetailsViewModel : ViewModelBase
	{
		#region Properties

		private Demo _currentDemo;

		private readonly IPlayerService _playerService;

		private readonly ICacheService _cacheService;

		private readonly IDialogService _dialogService;

		private Player _currentPlayer;

		private bool _isBusy;

		private bool _hasNotification;

		private string _notificationMessage;

		private List<PlayerRoundStats> _rounds = new List<PlayerRoundStats>();

		private List<GenericDoubleChart> _equipmentValueData = new List<GenericDoubleChart>();

		private List<GenericDoubleChart> _moneyEarnedData = new List<GenericDoubleChart>();

		private List<GenericDoubleChart> _damageHealthData = new List<GenericDoubleChart>();

		private List<GenericDoubleChart> _damageArmorData = new List<GenericDoubleChart>();

		private List<GenericDoubleChart> _totalDamageHealthData = new List<GenericDoubleChart>();

		private List<GenericDoubleChart> _totalDamageArmorData = new List<GenericDoubleChart>();

		private List<GenericDoubleChart> _weaponKillData = new List<GenericDoubleChart>();

		private RelayCommand _windowLoadedCommand;

		private RelayCommand _backToDetailsCommand;

		private RelayCommand<int> _watchDemoWithDelayCommand;

		private RelayCommand<int> _watchDemoWithoutDelayCommand;

		private RelayCommand _watchHighlightsCommand;

		private RelayCommand _watchLowlightsCommand;

		private RelayCommand _addPlayerToSuspectListCommand;

		private RelayCommand _addPlayerToWhitelistCommand;

		private RelayCommand<RadCartesianChart> _exportChartCommand;

		#endregion

		#region Accessors

		public Demo CurrentDemo
		{
			get { return _currentDemo; }
			set { Set(() => CurrentDemo, ref _currentDemo, value); }
		}

		public Player CurrentPlayer
		{
			get { return _currentPlayer; }
			set { Set(() => CurrentPlayer, ref _currentPlayer, value); }
		}

		public bool IsBusy
		{
			get { return _isBusy; }
			set { Set(() => IsBusy, ref _isBusy, value); }
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

		public List<PlayerRoundStats> Rounds
		{
			get { return _rounds; }
			set { Set(() => Rounds, ref _rounds, value); }
		}

		public List<GenericDoubleChart> EquipmentValueData
		{
			get { return _equipmentValueData; }
			set { Set(() => EquipmentValueData, ref _equipmentValueData, value); }
		}

		public List<GenericDoubleChart> MoneyEarnedData
		{
			get { return _moneyEarnedData; }
			set { Set(() => MoneyEarnedData, ref _moneyEarnedData, value); }
		}

		public List<GenericDoubleChart> DamageHealthData
		{
			get { return _damageHealthData; }
			set { Set(() => DamageHealthData, ref _damageHealthData, value); }
		}

		public List<GenericDoubleChart> DamageArmorData
		{
			get { return _damageArmorData; }
			set { Set(() => DamageArmorData, ref _damageArmorData, value); }
		}

		public List<GenericDoubleChart> TotalDamageHealthData
		{
			get { return _totalDamageHealthData; }
			set { Set(() => TotalDamageHealthData, ref _totalDamageHealthData, value); }
		}

		public List<GenericDoubleChart> TotalDamageArmorData
		{
			get { return _totalDamageArmorData; }
			set { Set(() => TotalDamageArmorData, ref _totalDamageArmorData, value); }
		}

		public List<GenericDoubleChart> WeaponKillData
		{
			get { return _weaponKillData; }
			set { Set(() => WeaponKillData, ref _weaponKillData, value); }
		}

		public List<KillEvent> Kills => CurrentDemo.Kills.Where(k => k.KillerSteamId == CurrentPlayer.SteamId).ToList();

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
						await LoadDatas();
					}));
			}
		}

		public RelayCommand BackToDetailsCommand
		{
			get
			{
				return _backToDetailsCommand
					?? (_backToDetailsCommand = new RelayCommand(
					() =>
					{
						var mainViewModel = new ViewModelLocator().Main;
						Application.Current.Properties["LastPageViewed"] = mainViewModel.CurrentPage.CurrentPage;
						DemoDetailsView detailsView = new DemoDetailsView();
						mainViewModel.CurrentPage.ShowPage(detailsView);
						CurrentPlayer = null;
						CurrentDemo = null;
					}));
			}
		}

		public RelayCommand<int> WatchDemoWithDelayCommand
		{
			get
			{
				return _watchDemoWithDelayCommand
					?? (_watchDemoWithDelayCommand = new RelayCommand<int>(
						async tick =>
						{
							if (AppSettings.SteamExePath() == null)
							{
								await _dialogService.ShowSteamNotFoundAsync();
								return;
							}
							GameLauncherConfiguration config = new GameLauncherConfiguration(CurrentDemo)
							{
								SteamExePath = AppSettings.SteamExePath(),
								Width = Settings.Default.ResolutionWidth,
								Height = Settings.Default.ResolutionHeight,
								Fullscreen = Settings.Default.IsFullscreen,
								EnableHlae = Settings.Default.EnableHlae,
								CsgoExePath = Settings.Default.CsgoExePath,
								EnableHlaeConfigParent = Settings.Default.EnableHlaeConfigParent,
								HlaeConfigParentFolderPath = Settings.Default.HlaeConfigParentFolderPath,
								HlaeExePath = HlaeService.GetHlaeExePath(),
								LaunchParameters = Settings.Default.LaunchParameters,
								UseCustomActionsGeneration = Settings.Default.UseCustomActionsGeneration,
								FocusPlayerSteamId = CurrentPlayer.SteamId,
							};
							GameLauncher launcher = new GameLauncher(config);
							launcher.WatchDemoAt(tick, true);
						}));
			}
		}

		public RelayCommand<int> WatchDemoWithoutDelayCommand
		{
			get
			{
				return _watchDemoWithoutDelayCommand
					?? (_watchDemoWithoutDelayCommand = new RelayCommand<int>(
						async tick =>
						{
							if (AppSettings.SteamExePath() == null)
							{
								await _dialogService.ShowSteamNotFoundAsync();
								return;
							}
							GameLauncherConfiguration config = new GameLauncherConfiguration(CurrentDemo)
							{
								SteamExePath = AppSettings.SteamExePath(),
								Width = Settings.Default.ResolutionWidth,
								Height = Settings.Default.ResolutionHeight,
								Fullscreen = Settings.Default.IsFullscreen,
								EnableHlae = Settings.Default.EnableHlae,
								CsgoExePath = Settings.Default.CsgoExePath,
								EnableHlaeConfigParent = Settings.Default.EnableHlaeConfigParent,
								HlaeConfigParentFolderPath = Settings.Default.HlaeConfigParentFolderPath,
								HlaeExePath = HlaeService.GetHlaeExePath(),
								LaunchParameters = Settings.Default.LaunchParameters,
								UseCustomActionsGeneration = Settings.Default.UseCustomActionsGeneration,
								FocusPlayerSteamId = CurrentPlayer.SteamId,
							};
							GameLauncher launcher = new GameLauncher(config);
							launcher.WatchDemoAt(tick, false);
						}));
			}
		}

		public RelayCommand WatchHighlightsCommand
		{
			get
			{
				return _watchHighlightsCommand
					?? (_watchHighlightsCommand = new RelayCommand(
						async () =>
						{
							if (AppSettings.SteamExePath() == null)
							{
								await _dialogService.ShowMessageAsync(Properties.Resources.DialogSteamNotFound, MessageDialogStyle.Affirmative);
								return;
							}
							GameLauncherConfiguration config = new GameLauncherConfiguration(CurrentDemo)
							{
								SteamExePath = AppSettings.SteamExePath(),
								Width = Settings.Default.ResolutionWidth,
								Height = Settings.Default.ResolutionHeight,
								Fullscreen = Settings.Default.IsFullscreen,
								EnableHlae = Settings.Default.EnableHlae,
								CsgoExePath = Settings.Default.CsgoExePath,
								EnableHlaeConfigParent = Settings.Default.EnableHlaeConfigParent,
								HlaeConfigParentFolderPath = Settings.Default.HlaeConfigParentFolderPath,
								HlaeExePath = HlaeService.GetHlaeExePath(),
								LaunchParameters = Settings.Default.LaunchParameters,
								UseCustomActionsGeneration = Settings.Default.UseCustomActionsGeneration,
								FocusPlayerSteamId = CurrentPlayer.SteamId,
							};
							GameLauncher launcher = new GameLauncher(config);
							var isPlayerPerspective = await _dialogService.ShowHighLowWatchAsync();
							if (isPlayerPerspective == MessageDialogResult.FirstAuxiliary) return;
							launcher.WatchHighlightDemo(isPlayerPerspective == MessageDialogResult.Affirmative);
						}));
			}
		}

		public RelayCommand WatchLowlightsCommand
		{
			get
			{
				return _watchLowlightsCommand
					?? (_watchLowlightsCommand = new RelayCommand(
						async () =>
						{
							if (AppSettings.SteamExePath() == null)
							{
								await _dialogService.ShowMessageAsync(Properties.Resources.DialogSteamNotFound, MessageDialogStyle.Affirmative);
								return;
							}
							GameLauncherConfiguration config = new GameLauncherConfiguration(CurrentDemo)
							{
								SteamExePath = AppSettings.SteamExePath(),
								Width = Settings.Default.ResolutionWidth,
								Height = Settings.Default.ResolutionHeight,
								Fullscreen = Settings.Default.IsFullscreen,
								EnableHlae = Settings.Default.EnableHlae,
								CsgoExePath = Settings.Default.CsgoExePath,
								EnableHlaeConfigParent = Settings.Default.EnableHlaeConfigParent,
								HlaeConfigParentFolderPath = Settings.Default.HlaeConfigParentFolderPath,
								HlaeExePath = HlaeService.GetHlaeExePath(),
								LaunchParameters = Settings.Default.LaunchParameters,
								UseCustomActionsGeneration = Settings.Default.UseCustomActionsGeneration,
								FocusPlayerSteamId = CurrentPlayer.SteamId,
							};
							GameLauncher launcher = new GameLauncher(config);
							var isPlayerPerspective = await _dialogService.ShowHighLowWatchAsync();
							if (isPlayerPerspective == MessageDialogResult.FirstAuxiliary) return;
							launcher.WatchLowlightDemo(isPlayerPerspective == MessageDialogResult.Affirmative);
						}));
			}
		}

		public RelayCommand AddPlayerToSuspectsListCommand
		{
			get
			{
				return _addPlayerToSuspectListCommand
					?? (_addPlayerToSuspectListCommand = new RelayCommand(
						async () =>
						{
							NotificationMessage = Properties.Resources.NotificationAddingPlayerToSuspectsList;
							HasNotification = true;
							IsBusy = true;

							try
							{
								bool added = await _cacheService.AddSuspectToCache(CurrentPlayer.SteamId.ToString());
								if (!added)
								{
									IsBusy = false;
									HasNotification = false;
									await _dialogService.ShowMessageAsync(Properties.Resources.DialogPlayerAlreadyInAccountsList, MessageDialogStyle.Affirmative);
								}
								else
								{
									IsBusy = false;
									NotificationMessage = Properties.Resources.NotificationPlayedAddedToSuspectsList;
									await Task.Delay(5000);
									HasNotification = false;
								}
								CommandManager.InvalidateRequerySuggested();
							}
							catch (Exception e)
							{
								IsBusy = false;
								HasNotification = false;
								Logger.Instance.Log(e);
								await _dialogService.ShowErrorAsync(Properties.Resources.DialogErrorWhileAddingPlayerToSuspectsList, MessageDialogStyle.Affirmative);
							}
						}));
			}
		}

		public RelayCommand AddPlayerToWhitelistCommand
		{
			get
			{
				return _addPlayerToWhitelistCommand
					?? (_addPlayerToWhitelistCommand = new RelayCommand(
						async () =>
						{
							NotificationMessage = Properties.Resources.NotificationAddingPlayerToWhitelist;
							HasNotification = true;
							IsBusy = true;

							try
							{
								bool added = await _cacheService.AddPlayerToWhitelist(CurrentPlayer.SteamId.ToString());
								if (!added)
								{
									IsBusy = false;
									HasNotification = false;
									await _dialogService.ShowMessageAsync(Properties.Resources.DialogPlayerAlreadyInWhitelist, MessageDialogStyle.Affirmative);
								}
								else
								{
									IsBusy = false;
									NotificationMessage = Properties.Resources.NotificationPlayerAddedToWhitelist;
									await Task.Delay(5000);
									HasNotification = false;
								}
								CommandManager.InvalidateRequerySuggested();
							}
							catch (Exception e)
							{
								IsBusy = false;
								HasNotification = false;
								Logger.Instance.Log(e);
								await _dialogService.ShowErrorAsync(Properties.Resources.DialogErrorWhileAddingPlayerToWhitelist, MessageDialogStyle.Affirmative);
							}
						}));
			}
		}

		public RelayCommand<RadCartesianChart> ExportChartCommand
		{
			get
			{
				return _exportChartCommand
					?? (_exportChartCommand = new RelayCommand<RadCartesianChart>(
						async chart =>
						{
							try
							{
								string fileNameSuffix = "equipment";
								switch (chart.Name)
								{
									case "DamagesChart":
										fileNameSuffix = "damages";
										break;
									case "MoneyChart":
										fileNameSuffix = "money";
										break;
								}
								
								SaveFileDialog dialog = new SaveFileDialog
								{
									FileName = $"{CurrentDemo.Name.Substring(0, CurrentDemo.Name.Length - 4)}-{CurrentPlayer.Name}-{fileNameSuffix}.png",
									Filter = "PNG file (*.png)|*.png"
								};

								if (dialog.ShowDialog() == DialogResult.OK)
								{
									Telerik.Windows.Media.Imaging.ExportExtensions.ExportToImage(chart, dialog.FileName, new PngBitmapEncoder());
								}
							}
							catch (Exception e)
							{
								Logger.Instance.Log(e);
								await _dialogService.ShowErrorAsync(Properties.Resources.DialogErrorExportingChart, MessageDialogStyle.Affirmative).ConfigureAwait(false);
							}
						}));
			}
		}

		#endregion

		public PlayerDetailsViewModel(IPlayerService playerService, IDialogService dialogService, ICacheService cacheService)
		{
			_playerService = playerService;
			_dialogService = dialogService;
			_cacheService = cacheService;
		}

		private async Task LoadDatas()
		{
			IsBusy = true;
			HasNotification = true;
			NotificationMessage = Properties.Resources.NotificationLoading;
			Rounds = await _playerService.GetRoundListStatsAsync(CurrentDemo, CurrentPlayer);
			EquipmentValueData = await _playerService.GetEquipmentValueChartAsync(CurrentDemo, CurrentPlayer);
			MoneyEarnedData = await _playerService.GetCashEarnedChartAsync(CurrentDemo, CurrentPlayer);
			DamageHealthData = await _playerService.GetDamageHealthChartAsync(CurrentDemo, CurrentPlayer);
			DamageArmorData = await _playerService.GetDamageArmorChartAsync(CurrentDemo, CurrentPlayer);
			TotalDamageHealthData = await _playerService.GetTotalDamageHealthChartAsync(CurrentDemo, CurrentPlayer);
			TotalDamageArmorData = await _playerService.GetTotalDamageArmorChartAsync(CurrentDemo, CurrentPlayer);
			WeaponKillData = await _playerService.GetWeaponKillChartAsync(CurrentDemo, CurrentPlayer);
			IsBusy = false;
			HasNotification = false;
		}

		public override void Cleanup()
		{
			base.Cleanup();
			HasNotification = false;
			IsBusy = false;
			CurrentPlayer = null;
			EquipmentValueData.Clear();
			Rounds.Clear();
			DamageArmorData.Clear();
			DamageHealthData.Clear();
			MoneyEarnedData.Clear();
			TotalDamageArmorData.Clear();
			TotalDamageHealthData.Clear();
			WeaponKillData.Clear();
			NotificationMessage = string.Empty;
		}
	}
}
