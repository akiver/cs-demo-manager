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
using Manager.ViewModel.Shared;
using Manager.Views.Demos;
using Services.Concrete;
using Services.Concrete.Movie;
using Services.Interfaces;
using Services.Models;
using Services.Models.Charts;
using Services.Models.Stats;
using Telerik.Windows.Controls;
using Application = System.Windows.Application;

namespace Manager.ViewModel.Players
{
	public class PlayerDetailsViewModel : BaseViewModel
	{
		#region Properties

		private readonly IPlayerService _playerService;

		private readonly ICacheService _cacheService;

		private readonly IDialogService _dialogService;

		private Demo _demo;

		private Player _currentPlayer;

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

		public Demo Demo
		{
			get => _demo;
			set { Set(() => Demo, ref _demo, value); }
		}

		public Player CurrentPlayer
		{
			get { return _currentPlayer; }
			set { Set(() => CurrentPlayer, ref _currentPlayer, value); }
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

		public List<KillEvent> Kills => Demo.Kills.Where(k => k.KillerSteamId == CurrentPlayer.SteamId).ToList();

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
						Demo = null;
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
							GameLauncherConfiguration config = Config.BuildGameLauncherConfiguration(Demo);
							config.FocusPlayerSteamId = CurrentPlayer.SteamId;
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
							GameLauncherConfiguration config = Config.BuildGameLauncherConfiguration(Demo);
							config.FocusPlayerSteamId = CurrentPlayer.SteamId;
							GameLauncher launcher = new GameLauncher(config);
							launcher.WatchDemoAt(tick);
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
							GameLauncherConfiguration config = Config.BuildGameLauncherConfiguration(Demo);
							config.FocusPlayerSteamId = CurrentPlayer.SteamId;
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
							GameLauncherConfiguration config = Config.BuildGameLauncherConfiguration(Demo);
							config.FocusPlayerSteamId = CurrentPlayer.SteamId;
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
							Notification = Properties.Resources.NotificationAddingPlayerToSuspectsList;
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
									Notification = Properties.Resources.NotificationPlayedAddedToSuspectsList;
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
							Notification = Properties.Resources.NotificationAddingPlayerToWhitelist;
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
									Notification = Properties.Resources.NotificationPlayerAddedToWhitelist;
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
									FileName = $"{Demo.Name.Substring(0, Demo.Name.Length - 4)}-{CurrentPlayer.Name}-{fileNameSuffix}.png",
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
			Notification = Properties.Resources.NotificationLoading;
			Rounds = await _playerService.GetRoundListStatsAsync(Demo, CurrentPlayer);
			EquipmentValueData = await _playerService.GetEquipmentValueChartAsync(Demo, CurrentPlayer);
			MoneyEarnedData = await _playerService.GetCashEarnedChartAsync(Demo, CurrentPlayer);
			DamageHealthData = await _playerService.GetDamageHealthChartAsync(Demo, CurrentPlayer);
			DamageArmorData = await _playerService.GetDamageArmorChartAsync(Demo, CurrentPlayer);
			TotalDamageHealthData = await _playerService.GetTotalDamageHealthChartAsync(Demo, CurrentPlayer);
			TotalDamageArmorData = await _playerService.GetTotalDamageArmorChartAsync(Demo, CurrentPlayer);
			WeaponKillData = await _playerService.GetWeaponKillChartAsync(Demo, CurrentPlayer);
			IsBusy = false;
			HasNotification = false;
		}

		public override void Cleanup()
		{
			base.Cleanup();
			CurrentPlayer = null;
			EquipmentValueData.Clear();
			Rounds.Clear();
			DamageArmorData.Clear();
			DamageHealthData.Clear();
			MoneyEarnedData.Clear();
			TotalDamageArmorData.Clear();
			TotalDamageHealthData.Clear();
			WeaponKillData.Clear();
		}
	}
}
