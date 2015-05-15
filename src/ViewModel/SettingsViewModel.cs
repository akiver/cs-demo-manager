using GalaSoft.MvvmLight;
using GalaSoft.MvvmLight.CommandWpf;
using System;
using CSGO_Demos_Manager.Services;
using MahApps.Metro.Controls.Dialogs;

namespace CSGO_Demos_Manager.ViewModel
{
	public class SettingsViewModel : ViewModelBase
	{
		#region Properties

		private int _resolutionWidth = Properties.Settings.Default.ResolutionWidth;

		private int _resolutionHeight = Properties.Settings.Default.ResolutionHeight;

		private bool _resolutionFullscreen = Properties.Settings.Default.IsFullscreen;

		private long _steamId = Properties.Settings.Default.SteamID;

		private RelayCommand<string> _saveResolutionWidthCommand;

		private RelayCommand<string> _saveResolutionHeightCommand;

		private RelayCommand<string> _saveSteamIdCommand;

		private RelayCommand _clearDataCacheCommand;

		private readonly ICacheService _cacheService;

		private readonly DialogService _dialogService;

		private bool _showDateColumn = Properties.Settings.Default.ShowDateColumn;

		private bool _showBombPlantedColumn = Properties.Settings.Default.ShowBombPlantedColumn;

		private bool _showBombDefusedColumn = Properties.Settings.Default.ShowBombDefusedColumn;

		private bool _showBombExplodedColumn = Properties.Settings.Default.ShowBombExplodedColumn;

		private bool _showDemoNameColumn = Properties.Settings.Default.ShowDemoNameColumn;

		private bool _showMapNameColumn = Properties.Settings.Default.ShowMapNameColumn;

		private bool _showTeam1NameColumn = Properties.Settings.Default.ShowTeam1NameColumn;

		private bool _showTeam2NameColumn = Properties.Settings.Default.ShowTeam2NameColumn;

		private bool _showScoreTeam1Column = Properties.Settings.Default.ShowScoreTeam1Column;

		private bool _showScoreTeam2Column = Properties.Settings.Default.ShowScoreTeam2Column;

		private bool _showHostnameColumn = Properties.Settings.Default.ShowHostnameColumn;

		private bool _showClientnameColumn = Properties.Settings.Default.ShowClientnameColumn;

		private bool _showDemoTypeColumn = Properties.Settings.Default.ShowDemoTypeColumn;

		private bool _showTickrateColumn = Properties.Settings.Default.ShowTickrateColumn;

		private bool _showOneKillColumn = Properties.Settings.Default.ShowOneKillColumn;

		private bool _showTwoKillsColumn = Properties.Settings.Default.ShowTwoKillsColumn;

		private bool _showThreeKillsColumn = Properties.Settings.Default.ShowThreeKillsColumn;

		private bool _showFourKillsColumn = Properties.Settings.Default.ShowFourKillsColumn;

		private bool _showFiveKillsColumn = Properties.Settings.Default.ShowFiveKillsColumn;

		private bool _showTotalKillsColumn = Properties.Settings.Default.ShowTotalKillsColumn;

		private bool _showDeathsColumn = Properties.Settings.Default.ShowDeathsColumn;

		private bool _showAssistsColumn = Properties.Settings.Default.ShowAssistsColumn;

		private bool _showKdColumn = Properties.Settings.Default.ShowKdColumn;

		private bool _showHsColumn = Properties.Settings.Default.ShowHsColumn;

		private bool _showTkColumn = Properties.Settings.Default.ShowTkColumn;

		private bool _showEkColumn = Properties.Settings.Default.ShowEkColumn;

		private bool _showMvpColumn = Properties.Settings.Default.ShowMvpColumn;

		private bool _showPlayerScoreColumn = Properties.Settings.Default.ShowPlayerScoreColumn;

		private bool _showClutch1v1Column = Properties.Settings.Default.ShowClutch1v1Column;

		private bool _showClutch1v2Column = Properties.Settings.Default.ShowClutch1v2Column;

		private bool _showClutch1v3Column = Properties.Settings.Default.ShowClutch1v3Column;

		private bool _showClutch1v4Column = Properties.Settings.Default.ShowClutch1v4Column;

		private bool _showClutch1v5Column = Properties.Settings.Default.ShowClutch1v5Column;

		private bool _showStartMoneyTeam1Column = Properties.Settings.Default.ShowStartMoneyTeam1Column;

		private bool _showStartMoneyTeam2Column = Properties.Settings.Default.ShowStartMoneyTeam2Column;

		private bool _showEquipementValueTeam1Column = Properties.Settings.Default.ShowEquipementValueTeam1Column;

		private bool _showEquipementValueTeam2Column = Properties.Settings.Default.ShowEquipementValueTeam2Column;

		private bool _showWinnerClanNameColumn = Properties.Settings.Default.ShowWinnerClanNameColumn;

		private bool _showWinnerSideColumn = Properties.Settings.Default.ShowWinnerSideColumn;

		private bool _dateFormatEuropean = Properties.Settings.Default.DateFormatEuropean;

		#endregion

		#region Accessors

		public int ResolutionWidth
		{
			get { return _resolutionWidth; }
			set { Set(() => ResolutionWidth, ref _resolutionWidth, value); }
		}

		public int ResolutionHeight
		{
			get { return _resolutionHeight; }
			set { Set(() => ResolutionHeight, ref _resolutionHeight, value); }
		}

		public bool ResolutionFullscreen
		{
			get { return _resolutionFullscreen; }
			set
			{
				Properties.Settings.Default.IsFullscreen = value;
				Properties.Settings.Default.Save();
				Set(() => ResolutionFullscreen, ref _resolutionFullscreen, value);
			}
		}

		public bool DateFormatUsa
		{
			get { return _dateFormatEuropean; }
			set
			{
				Properties.Settings.Default.DateFormatEuropean = value;
				Properties.Settings.Default.Save();
				Set(() => DateFormatUsa, ref _dateFormatEuropean, value);
			}
		}

		public bool ShowWinnerClanNameColumn
		{
			get { return _showWinnerClanNameColumn; }
			set
			{
				Properties.Settings.Default.ShowWinnerClanNameColumn = value;
				Properties.Settings.Default.Save();
				Set(() => ShowWinnerClanNameColumn, ref _showWinnerClanNameColumn, value);
			}
		}

		public bool ShowWinnerSideColumn
		{
			get { return _showWinnerSideColumn; }
			set
			{
				Properties.Settings.Default.ShowWinnerSideColumn = value;
				Properties.Settings.Default.Save();
				Set(() => ShowWinnerSideColumn, ref _showWinnerSideColumn, value);
			}
		}

		public bool ShowStartMoneyTeam1Column
		{
			get { return _showStartMoneyTeam1Column; }
			set
			{
				Properties.Settings.Default.ShowStartMoneyTeam1Column = value;
				Properties.Settings.Default.Save();
				Set(() => ShowStartMoneyTeam1Column, ref _showStartMoneyTeam1Column, value);
			}
		}

		public bool ShowStartMoneyTeam2Column
		{
			get { return _showStartMoneyTeam2Column; }
			set
			{
				Properties.Settings.Default.ShowStartMoneyTeam2Column = value;
				Properties.Settings.Default.Save();
				Set(() => ShowStartMoneyTeam2Column, ref _showStartMoneyTeam2Column, value);
			}
		}

		public bool ShowEquipementValueTeam1Column
		{
			get { return _showEquipementValueTeam1Column; }
			set
			{
				Properties.Settings.Default.ShowEquipementValueTeam1Column = value;
				Properties.Settings.Default.Save();
				Set(() => ShowEquipementValueTeam1Column, ref _showEquipementValueTeam1Column, value);
			}
		}

		public bool ShowEquipementValueTeam2Column
		{
			get { return _showEquipementValueTeam2Column; }
			set
			{
				Properties.Settings.Default.ShowEquipementValueTeam2Column = value;
				Properties.Settings.Default.Save();
				Set(() => ShowEquipementValueTeam2Column, ref _showEquipementValueTeam2Column, value);
			}
		}

		public bool ShowDateColumn
		{
			get { return _showDateColumn; }
			set
			{
				Properties.Settings.Default.ShowDateColumn = value;
				Properties.Settings.Default.Save();
				Set(() => ShowDateColumn, ref _showDateColumn, value);
			}
		}

		public bool ShowDemoNameColumn
		{
			get { return _showDemoNameColumn; }
			set
			{
				Properties.Settings.Default.ShowDemoNameColumn = value;
				Properties.Settings.Default.Save();
				Set(() => ShowDemoNameColumn, ref _showDemoNameColumn, value);
			}
		}

		public bool ShowMapNameColumn
		{
			get { return _showMapNameColumn; }
			set
			{
				Properties.Settings.Default.ShowMapNameColumn = value;
				Properties.Settings.Default.Save();
				Set(() => ShowMapNameColumn, ref _showMapNameColumn, value);
			}
		}

		public bool ShowHostnameColumn
		{
			get { return _showHostnameColumn; }
			set
			{
				Properties.Settings.Default.ShowHostnameColumn = value;
				Properties.Settings.Default.Save();
				Set(() => ShowHostnameColumn, ref _showHostnameColumn, value);
			}
		}

		public bool ShowClientnameColumn
		{
			get { return _showClientnameColumn; }
			set
			{
				Properties.Settings.Default.ShowClientnameColumn = value;
				Properties.Settings.Default.Save();
				Set(() => ShowClientnameColumn, ref _showClientnameColumn, value);
			}
		}

		public bool ShowDemoTypeColumn
		{
			get { return _showDemoTypeColumn; }
			set
			{
				Properties.Settings.Default.ShowDemoTypeColumn = value;
				Properties.Settings.Default.Save();
				Set(() => ShowDemoTypeColumn, ref _showDemoTypeColumn, value);
			}
		}

		public bool ShowTickrateColumn
		{
			get { return _showTickrateColumn; }
			set
			{
				Properties.Settings.Default.ShowTickrateColumn = value;
				Properties.Settings.Default.Save();
				Set(() => ShowTickrateColumn, ref _showTickrateColumn, value);
			}
		}

		public bool ShowTeam1NameColumn
		{
			get { return _showTeam1NameColumn; }
			set
			{
				Properties.Settings.Default.ShowTeam1NameColumn = value;
				Properties.Settings.Default.Save();
				Set(() => ShowTeam1NameColumn, ref _showTeam1NameColumn, value);
			}
		}

		public bool ShowTeam2NameColumn
		{
			get { return _showTeam2NameColumn; }
			set
			{
				Properties.Settings.Default.ShowTeam2NameColumn = value;
				Properties.Settings.Default.Save();
				Set(() => ShowTeam2NameColumn, ref _showTeam2NameColumn, value);
			}
		}

		public bool ShowScoreTeam1Column
		{
			get { return _showScoreTeam1Column; }
			set
			{
				Properties.Settings.Default.ShowScoreTeam1Column = value;
				Properties.Settings.Default.Save();
				Set(() => ShowScoreTeam1Column, ref _showScoreTeam1Column, value);
			}
		}

		public bool ShowScoreTeam2Column
		{
			get { return _showScoreTeam2Column; }
			set
			{
				Properties.Settings.Default.ShowScoreTeam2Column = value;
				Properties.Settings.Default.Save();
				Set(() => ShowScoreTeam2Column, ref _showScoreTeam2Column, value);
			}
		}

		public bool ShowBombPlantedColumn
		{
			get { return _showBombPlantedColumn; }
			set
			{
				Properties.Settings.Default.ShowBombPlantedColumn = value;
				Properties.Settings.Default.Save();
				Set(() => ShowBombPlantedColumn, ref _showBombPlantedColumn, value);
			}
		}

		public bool ShowBombExplodedColumn
		{
			get { return _showBombExplodedColumn; }
			set
			{
				Properties.Settings.Default.ShowBombExplodedColumn = value;
				Properties.Settings.Default.Save();
				Set(() => ShowBombExplodedColumn, ref _showBombExplodedColumn, value);
			}
		}

		public bool ShowBombDefusedColumn
		{
			get { return _showBombDefusedColumn; }
			set
			{
				Properties.Settings.Default.ShowBombDefusedColumn = value;
				Properties.Settings.Default.Save();
				Set(() => ShowBombDefusedColumn, ref _showBombDefusedColumn, value);
			}
		}

		public bool ShowOneKillColumn
		{
			get { return _showOneKillColumn; }
			set
			{
				Properties.Settings.Default.ShowOneKillColumn = value;
				Properties.Settings.Default.Save();
				Set(() => ShowOneKillColumn, ref _showOneKillColumn, value);
			}
		}

		public bool ShowTwoKillsColumn
		{
			get { return _showTwoKillsColumn; }
			set
			{
				Properties.Settings.Default.ShowTwoKillsColumn = value;
				Properties.Settings.Default.Save();
				Set(() => ShowTwoKillsColumn, ref _showTwoKillsColumn, value);
			}
		}

		public bool ShowThreeKillsColumn
		{
			get { return _showThreeKillsColumn; }
			set
			{
				Properties.Settings.Default.ShowThreeKillsColumn = value;
				Properties.Settings.Default.Save();
				Set(() => ShowThreeKillsColumn, ref _showThreeKillsColumn, value);
			}
		}

		public bool ShowFourKillsColumn
		{
			get { return _showFourKillsColumn; }
			set
			{
				Properties.Settings.Default.ShowFourKillsColumn = value;
				Properties.Settings.Default.Save();
				Set(() => ShowFourKillsColumn, ref _showFourKillsColumn, value);
			}
		}

		public bool ShowFiveKillsColumn
		{
			get { return _showFiveKillsColumn; }
			set
			{
				Properties.Settings.Default.ShowFiveKillsColumn = value;
				Properties.Settings.Default.Save();
				Set(() => ShowFiveKillsColumn, ref _showFiveKillsColumn, value);
			}
		}

		public bool ShowTotalKillsColumn
		{
			get { return _showTotalKillsColumn; }
			set
			{
				Properties.Settings.Default.ShowTotalKillsColumn = value;
				Properties.Settings.Default.Save();
				Set(() => ShowTotalKillsColumn, ref _showTotalKillsColumn, value);
			}
		}

		public bool ShowDeathsColumn
		{
			get { return _showDeathsColumn; }
			set
			{
				Properties.Settings.Default.ShowDeathsColumn = value;
				Properties.Settings.Default.Save();
				Set(() => ShowDeathsColumn, ref _showDeathsColumn, value);
			}
		}

		public bool ShowAssistsColumn
		{
			get { return _showAssistsColumn; }
			set
			{
				Properties.Settings.Default.ShowAssistsColumn = value;
				Properties.Settings.Default.Save();
				Set(() => ShowAssistsColumn, ref _showAssistsColumn, value);
			}
		}

		public bool ShowHsColumn
		{
			get { return _showHsColumn; }
			set
			{
				Properties.Settings.Default.ShowHsColumn = value;
				Properties.Settings.Default.Save();
				Set(() => ShowHsColumn, ref _showHsColumn, value);
			}
		}

		public bool ShowKdColumn
		{
			get { return _showKdColumn; }
			set
			{
				Properties.Settings.Default.ShowKdColumn = value;
				Properties.Settings.Default.Save();
				Set(() => ShowKdColumn, ref _showKdColumn, value);
			}
		}

		public bool ShowMvpColumn
		{
			get { return _showMvpColumn; }
			set
			{
				Properties.Settings.Default.ShowMvpColumn = value;
				Properties.Settings.Default.Save();
				Set(() => ShowMvpColumn, ref _showMvpColumn, value);
			}
		}

		public bool ShowTkColumn
		{
			get { return _showTkColumn; }
			set
			{
				Properties.Settings.Default.ShowTkColumn = value;
				Properties.Settings.Default.Save();
				Set(() => ShowTkColumn, ref _showTkColumn, value);
			}
		}

		public bool ShowEkColumn
		{
			get { return _showEkColumn; }
			set
			{
				Properties.Settings.Default.ShowEkColumn = value;
				Properties.Settings.Default.Save();
				Set(() => ShowEkColumn, ref _showEkColumn, value);
			}
		}

		public bool ShowPlayerScoreColumn
		{
			get { return _showPlayerScoreColumn; }
			set
			{
				Properties.Settings.Default.ShowPlayerScoreColumn = value;
				Properties.Settings.Default.Save();
				Set(() => ShowPlayerScoreColumn, ref _showPlayerScoreColumn, value);
			}
		}

		public bool ShowClutch1v1Column
		{
			get { return _showClutch1v1Column; }
			set
			{
				Properties.Settings.Default.ShowClutch1v1Column = value;
				Properties.Settings.Default.Save();
				Set(() => ShowClutch1v1Column, ref _showClutch1v1Column, value);
			}
		}

		public bool ShowClutch1v2Column
		{
			get { return _showClutch1v2Column; }
			set
			{
				Properties.Settings.Default.ShowClutch1v2Column = value;
				Properties.Settings.Default.Save();
				Set(() => ShowClutch1v2Column, ref _showClutch1v2Column, value);
			}
		}

		public bool ShowClutch1v3Column
		{
			get { return _showClutch1v3Column; }
			set
			{
				Properties.Settings.Default.ShowClutch1v3Column = value;
				Properties.Settings.Default.Save();
				Set(() => ShowClutch1v3Column, ref _showClutch1v3Column, value);
			}
		}

		public bool ShowClutch1v4Column
		{
			get { return _showClutch1v4Column; }
			set
			{
				Properties.Settings.Default.ShowClutch1v4Column = value;
				Properties.Settings.Default.Save();
				Set(() => ShowClutch1v4Column, ref _showClutch1v4Column, value);
			}
		}

		public bool ShowClutch1v5Column
		{
			get { return _showClutch1v5Column; }
			set
			{
				Properties.Settings.Default.ShowClutch1v5Column = value;
				Properties.Settings.Default.Save();
				Set(() => ShowClutch1v5Column, ref _showClutch1v5Column, value);
			}
		}

		public long SteamId
		{
			get { return _steamId; }
			set { Set(() => SteamId, ref _steamId, value); }
		}

		#endregion

		#region Commands

		/// <summary>
		/// Command to save width resolution
		/// </summary>
		public RelayCommand<string> SaveResolutionWidthCommand
		{
			get
			{
				return _saveResolutionWidthCommand
					?? (_saveResolutionWidthCommand = new RelayCommand<string>(
						width =>
						{
							Properties.Settings.Default.ResolutionWidth = Convert.ToInt32(width);
							Properties.Settings.Default.Save();
						},
						width => !string.IsNullOrEmpty(width)));
			}
		}

		/// <summary>
		/// Command to save height resolution
		/// </summary>
		public RelayCommand<string> SaveResolutionHeightCommand
		{
			get
			{
				return _saveResolutionHeightCommand
					?? (_saveResolutionHeightCommand = new RelayCommand<string>(
						height =>
						{
							Properties.Settings.Default.ResolutionHeight = Convert.ToInt32(height);
							Properties.Settings.Default.Save();
						}, height => !string.IsNullOrEmpty(height)));
			}
		}

		/// <summary>
		/// Command to save User's SteamID
		/// </summary>
		public RelayCommand<string> SaveSteamIdCommand
		{
			get
			{
				return _saveSteamIdCommand
					?? (_saveSteamIdCommand = new RelayCommand<string>(
						SaveSteamId,
						steamId =>
						{
							long steamIdAsLong;
							return Int64.TryParse(steamId, out steamIdAsLong);
						}));
			}
		}

		/// <summary>
		/// Command to clear data cache
		/// </summary>
		public RelayCommand ClearDataCacheCommand
		{
			get
			{
				return _clearDataCacheCommand
					?? (_clearDataCacheCommand = new RelayCommand(
					async () =>
					{
						var result = await _dialogService.ShowMessageAsync("Data will be deleted! Are you sure?", MessageDialogStyle.AffirmativeAndNegative);
						if (result == MessageDialogResult.Negative) return;
						await _cacheService.ClearData();
						await _dialogService.ShowMessageAsync("Data cleared.", MessageDialogStyle.Affirmative);
					}));
			}
		}

		#endregion

		#region Callbacks

		/// <summary>
		/// Callback to save SteamID
		/// </summary>
		/// <param name="steamId"></param>
		private void SaveSteamId(string steamId)
		{
			Properties.Settings.Default.SteamID = Convert.ToInt64(steamId);
			Properties.Settings.Default.Save();
		}

		#endregion

		public SettingsViewModel(DialogService dialogService, ICacheService chacheService)
		{
			_dialogService = dialogService;
			_cacheService = chacheService;
		}
	}
}
