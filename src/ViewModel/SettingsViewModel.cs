using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Windows.Forms;
using CSGO_Demos_Manager.Internals;
using CSGO_Demos_Manager.Models;
using CSGO_Demos_Manager.Properties;
using CSGO_Demos_Manager.Services;
using GalaSoft.MvvmLight;
using GalaSoft.MvvmLight.CommandWpf;
using MahApps.Metro.Controls.Dialogs;
using OpenFileDialog = Microsoft.Win32.OpenFileDialog;

namespace CSGO_Demos_Manager.ViewModel
{
	public class SettingsViewModel : ViewModelBase
	{
		#region Properties

		private int _resolutionWidth = Settings.Default.ResolutionWidth;

		private int _resolutionHeight = Settings.Default.ResolutionHeight;

		private bool _resolutionFullscreen = Settings.Default.IsFullscreen;

		private long _steamId = Settings.Default.SteamID;

		private string _launchParameters = Settings.Default.LaunchParameters;

		private RelayCommand<string> _saveResolutionWidthCommand;

		private RelayCommand<string> _saveResolutionHeightCommand;

		private RelayCommand<string> _saveSteamIdCommand;

		private RelayCommand<string> _saveLaunchParametersCommand;

		private RelayCommand _clearDemosDataCacheCommand;

		private RelayCommand _importCustomDataCacheCommand;

		private RelayCommand _exportCustomDataCacheCommand;

		private RelayCommand _navigateToLogFile;

		private RelayCommand _selectCsgoExePathCommand;

		private RelayCommand _enableMoviemakerModeCommand;

		private readonly ICacheService _cacheService;

		private readonly IDemosService _demosService;

		private readonly DialogService _dialogService;

		private bool _showDateColumn = Settings.Default.ShowDateColumn;

		private bool _showBombPlantedColumn = Settings.Default.ShowBombPlantedColumn;

		private bool _showBombDefusedColumn = Settings.Default.ShowBombDefusedColumn;

		private bool _showBombExplodedColumn = Settings.Default.ShowBombExplodedColumn;

		private bool _showDemoNameColumn = Settings.Default.ShowDemoNameColumn;

		private bool _showMapNameColumn = Settings.Default.ShowMapNameColumn;

		private bool _showTeam1NameColumn = Settings.Default.ShowTeam1NameColumn;

		private bool _showTeam2NameColumn = Settings.Default.ShowTeam2NameColumn;

		private bool _showScoreTeam1Column = Settings.Default.ShowScoreTeam1Column;

		private bool _showScoreTeam2Column = Settings.Default.ShowScoreTeam2Column;

		private bool _showHostnameColumn = Settings.Default.ShowHostnameColumn;

		private bool _showClientnameColumn = Settings.Default.ShowClientnameColumn;

		private bool _showDemoTypeColumn = Settings.Default.ShowDemoTypeColumn;

		private bool _showFramerateColumn = Settings.Default.ShowFramerateColumn;

		private bool _showTickrateColumn = Settings.Default.ShowTickrateColumn;

		private bool _showOneKillColumn = Settings.Default.ShowOneKillColumn;

		private bool _showTwoKillsColumn = Settings.Default.ShowTwoKillsColumn;

		private bool _showThreeKillsColumn = Settings.Default.ShowThreeKillsColumn;

		private bool _showFourKillsColumn = Settings.Default.ShowFourKillsColumn;

		private bool _showFiveKillsColumn = Settings.Default.ShowFiveKillsColumn;

		private bool _showTotalKillsColumn = Settings.Default.ShowTotalKillsColumn;

		private bool _showDeathsColumn = Settings.Default.ShowDeathsColumn;

		private bool _showAssistsColumn = Settings.Default.ShowAssistsColumn;

		private bool _showKdColumn = Settings.Default.ShowKdColumn;

		private bool _showHsColumn = Settings.Default.ShowHsColumn;

		private bool _showTkColumn = Settings.Default.ShowTkColumn;

		private bool _showEkColumn = Settings.Default.ShowEkColumn;

		private bool _showMvpColumn = Settings.Default.ShowMvpColumn;

		private bool _showPlayerScoreColumn = Settings.Default.ShowPlayerScoreColumn;

		private bool _showClutch1v1Column = Settings.Default.ShowClutch1v1Column;

		private bool _showClutch1v2Column = Settings.Default.ShowClutch1v2Column;

		private bool _showClutch1v3Column = Settings.Default.ShowClutch1v3Column;

		private bool _showClutch1v4Column = Settings.Default.ShowClutch1v4Column;

		private bool _showClutch1v5Column = Settings.Default.ShowClutch1v5Column;

		private bool _showStartMoneyTeam1Column = Settings.Default.ShowStartMoneyTeam1Column;

		private bool _showStartMoneyTeam2Column = Settings.Default.ShowStartMoneyTeam2Column;

		private bool _showEquipementValueTeam1Column = Settings.Default.ShowEquipementValueTeam1Column;

		private bool _showEquipementValueTeam2Column = Settings.Default.ShowEquipementValueTeam2Column;

		private bool _showWinnerClanNameColumn = Settings.Default.ShowWinnerClanNameColumn;

		private bool _showWinnerSideColumn = Settings.Default.ShowWinnerSideColumn;

		private bool _showDurationColumn = Settings.Default.ShowDurationColumn;

		private bool _dateFormatEuropean = Settings.Default.DateFormatEuropean;

		private bool _showOnlyUserStats = Settings.Default.ShowOnlyUserStats;

		private bool _showCommentColumn = Settings.Default.ShowCommentColumn;

		private bool _showClutchCountColumn = Settings.Default.ShowClutchCountColumn;

		private bool _showTotalDamageHealthColumn = Settings.Default.ShowTotalDamageHealthColumn;

		private bool _showTotalDamageArmorColumn = Settings.Default.ShowTotalDamageArmorColumn;

		private bool _showAverageDamageColumn = Settings.Default.ShowAverageDamageColumn;

		private bool _showBanColumns = Settings.Default.ShowBanColumns;

		private string _csgoExePath = Settings.Default.CsgoExePath;

		private bool _enableMoviemakerMode = Settings.Default.MoviemakerMode;

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
				Settings.Default.IsFullscreen = value;
				Settings.Default.Save();
				Set(() => ResolutionFullscreen, ref _resolutionFullscreen, value);
			}
		}

		public string LaunchParameters
		{
			get { return _launchParameters; }
			set { Set(() => LaunchParameters, ref _launchParameters, value); }
		}

		public bool DateFormatUsa
		{
			get { return _dateFormatEuropean; }
			set
			{
				Settings.Default.DateFormatEuropean = value;
				Settings.Default.Save();
				Set(() => DateFormatUsa, ref _dateFormatEuropean, value);
			}
		}

		public bool ShowWinnerClanNameColumn
		{
			get { return _showWinnerClanNameColumn; }
			set
			{
				Settings.Default.ShowWinnerClanNameColumn = value;
				Settings.Default.Save();
				Set(() => ShowWinnerClanNameColumn, ref _showWinnerClanNameColumn, value);
			}
		}

		public bool ShowWinnerSideColumn
		{
			get { return _showWinnerSideColumn; }
			set
			{
				Settings.Default.ShowWinnerSideColumn = value;
				Settings.Default.Save();
				Set(() => ShowWinnerSideColumn, ref _showWinnerSideColumn, value);
			}
		}

		public bool ShowStartMoneyTeam1Column
		{
			get { return _showStartMoneyTeam1Column; }
			set
			{
				Settings.Default.ShowStartMoneyTeam1Column = value;
				Settings.Default.Save();
				Set(() => ShowStartMoneyTeam1Column, ref _showStartMoneyTeam1Column, value);
			}
		}

		public bool ShowStartMoneyTeam2Column
		{
			get { return _showStartMoneyTeam2Column; }
			set
			{
				Settings.Default.ShowStartMoneyTeam2Column = value;
				Settings.Default.Save();
				Set(() => ShowStartMoneyTeam2Column, ref _showStartMoneyTeam2Column, value);
			}
		}

		public bool ShowEquipementValueTeam1Column
		{
			get { return _showEquipementValueTeam1Column; }
			set
			{
				Settings.Default.ShowEquipementValueTeam1Column = value;
				Settings.Default.Save();
				Set(() => ShowEquipementValueTeam1Column, ref _showEquipementValueTeam1Column, value);
			}
		}

		public bool ShowEquipementValueTeam2Column
		{
			get { return _showEquipementValueTeam2Column; }
			set
			{
				Settings.Default.ShowEquipementValueTeam2Column = value;
				Settings.Default.Save();
				Set(() => ShowEquipementValueTeam2Column, ref _showEquipementValueTeam2Column, value);
			}
		}

		public bool ShowDateColumn
		{
			get { return _showDateColumn; }
			set
			{
				Settings.Default.ShowDateColumn = value;
				Settings.Default.Save();
				Set(() => ShowDateColumn, ref _showDateColumn, value);
			}
		}

		public bool ShowDemoNameColumn
		{
			get { return _showDemoNameColumn; }
			set
			{
				Settings.Default.ShowDemoNameColumn = value;
				Settings.Default.Save();
				Set(() => ShowDemoNameColumn, ref _showDemoNameColumn, value);
			}
		}

		public bool ShowMapNameColumn
		{
			get { return _showMapNameColumn; }
			set
			{
				Settings.Default.ShowMapNameColumn = value;
				Settings.Default.Save();
				Set(() => ShowMapNameColumn, ref _showMapNameColumn, value);
			}
		}

		public bool ShowHostnameColumn
		{
			get { return _showHostnameColumn; }
			set
			{
				Settings.Default.ShowHostnameColumn = value;
				Settings.Default.Save();
				Set(() => ShowHostnameColumn, ref _showHostnameColumn, value);
			}
		}

		public bool ShowClientnameColumn
		{
			get { return _showClientnameColumn; }
			set
			{
				Settings.Default.ShowClientnameColumn = value;
				Settings.Default.Save();
				Set(() => ShowClientnameColumn, ref _showClientnameColumn, value);
			}
		}

		public bool ShowDemoTypeColumn
		{
			get { return _showDemoTypeColumn; }
			set
			{
				Settings.Default.ShowDemoTypeColumn = value;
				Settings.Default.Save();
				Set(() => ShowDemoTypeColumn, ref _showDemoTypeColumn, value);
			}
		}

		public bool ShowFramerateColumn
		{
			get { return _showFramerateColumn; }
			set
			{
				Settings.Default.ShowFramerateColumn = value;
				Settings.Default.Save();
				Set(() => ShowFramerateColumn, ref _showFramerateColumn, value);
			}
		}

		public bool ShowTickrateColumn
		{
			get { return _showTickrateColumn; }
			set
			{
				Settings.Default.ShowTickrateColumn = value;
				Settings.Default.Save();
				Set(() => ShowTickrateColumn, ref _showTickrateColumn, value);
			}
		}

		public bool ShowTeam1NameColumn
		{
			get { return _showTeam1NameColumn; }
			set
			{
				Settings.Default.ShowTeam1NameColumn = value;
				Settings.Default.Save();
				Set(() => ShowTeam1NameColumn, ref _showTeam1NameColumn, value);
			}
		}

		public bool ShowTeam2NameColumn
		{
			get { return _showTeam2NameColumn; }
			set
			{
				Settings.Default.ShowTeam2NameColumn = value;
				Settings.Default.Save();
				Set(() => ShowTeam2NameColumn, ref _showTeam2NameColumn, value);
			}
		}

		public bool ShowScoreTeam1Column
		{
			get { return _showScoreTeam1Column; }
			set
			{
				Settings.Default.ShowScoreTeam1Column = value;
				Settings.Default.Save();
				Set(() => ShowScoreTeam1Column, ref _showScoreTeam1Column, value);
			}
		}

		public bool ShowScoreTeam2Column
		{
			get { return _showScoreTeam2Column; }
			set
			{
				Settings.Default.ShowScoreTeam2Column = value;
				Settings.Default.Save();
				Set(() => ShowScoreTeam2Column, ref _showScoreTeam2Column, value);
			}
		}

		public bool ShowBombPlantedColumn
		{
			get { return _showBombPlantedColumn; }
			set
			{
				Settings.Default.ShowBombPlantedColumn = value;
				Settings.Default.Save();
				Set(() => ShowBombPlantedColumn, ref _showBombPlantedColumn, value);
			}
		}

		public bool ShowBombExplodedColumn
		{
			get { return _showBombExplodedColumn; }
			set
			{
				Settings.Default.ShowBombExplodedColumn = value;
				Settings.Default.Save();
				Set(() => ShowBombExplodedColumn, ref _showBombExplodedColumn, value);
			}
		}

		public bool ShowBombDefusedColumn
		{
			get { return _showBombDefusedColumn; }
			set
			{
				Settings.Default.ShowBombDefusedColumn = value;
				Settings.Default.Save();
				Set(() => ShowBombDefusedColumn, ref _showBombDefusedColumn, value);
			}
		}

		public bool ShowOneKillColumn
		{
			get { return _showOneKillColumn; }
			set
			{
				Settings.Default.ShowOneKillColumn = value;
				Settings.Default.Save();
				Set(() => ShowOneKillColumn, ref _showOneKillColumn, value);
			}
		}

		public bool ShowTwoKillsColumn
		{
			get { return _showTwoKillsColumn; }
			set
			{
				Settings.Default.ShowTwoKillsColumn = value;
				Settings.Default.Save();
				Set(() => ShowTwoKillsColumn, ref _showTwoKillsColumn, value);
			}
		}

		public bool ShowThreeKillsColumn
		{
			get { return _showThreeKillsColumn; }
			set
			{
				Settings.Default.ShowThreeKillsColumn = value;
				Settings.Default.Save();
				Set(() => ShowThreeKillsColumn, ref _showThreeKillsColumn, value);
			}
		}

		public bool ShowFourKillsColumn
		{
			get { return _showFourKillsColumn; }
			set
			{
				Settings.Default.ShowFourKillsColumn = value;
				Settings.Default.Save();
				Set(() => ShowFourKillsColumn, ref _showFourKillsColumn, value);
			}
		}

		public bool ShowFiveKillsColumn
		{
			get { return _showFiveKillsColumn; }
			set
			{
				Settings.Default.ShowFiveKillsColumn = value;
				Settings.Default.Save();
				Set(() => ShowFiveKillsColumn, ref _showFiveKillsColumn, value);
			}
		}

		public bool ShowTotalKillsColumn
		{
			get { return _showTotalKillsColumn; }
			set
			{
				Settings.Default.ShowTotalKillsColumn = value;
				Settings.Default.Save();
				Set(() => ShowTotalKillsColumn, ref _showTotalKillsColumn, value);
			}
		}

		public bool ShowDeathsColumn
		{
			get { return _showDeathsColumn; }
			set
			{
				Settings.Default.ShowDeathsColumn = value;
				Settings.Default.Save();
				Set(() => ShowDeathsColumn, ref _showDeathsColumn, value);
			}
		}

		public bool ShowAssistsColumn
		{
			get { return _showAssistsColumn; }
			set
			{
				Settings.Default.ShowAssistsColumn = value;
				Settings.Default.Save();
				Set(() => ShowAssistsColumn, ref _showAssistsColumn, value);
			}
		}

		public bool ShowHsColumn
		{
			get { return _showHsColumn; }
			set
			{
				Settings.Default.ShowHsColumn = value;
				Settings.Default.Save();
				Set(() => ShowHsColumn, ref _showHsColumn, value);
			}
		}

		public bool ShowKdColumn
		{
			get { return _showKdColumn; }
			set
			{
				Settings.Default.ShowKdColumn = value;
				Settings.Default.Save();
				Set(() => ShowKdColumn, ref _showKdColumn, value);
			}
		}

		public bool ShowMvpColumn
		{
			get { return _showMvpColumn; }
			set
			{
				Settings.Default.ShowMvpColumn = value;
				Settings.Default.Save();
				Set(() => ShowMvpColumn, ref _showMvpColumn, value);
			}
		}

		public bool ShowTkColumn
		{
			get { return _showTkColumn; }
			set
			{
				Settings.Default.ShowTkColumn = value;
				Settings.Default.Save();
				Set(() => ShowTkColumn, ref _showTkColumn, value);
			}
		}

		public bool ShowEkColumn
		{
			get { return _showEkColumn; }
			set
			{
				Settings.Default.ShowEkColumn = value;
				Settings.Default.Save();
				Set(() => ShowEkColumn, ref _showEkColumn, value);
			}
		}

		public bool ShowPlayerScoreColumn
		{
			get { return _showPlayerScoreColumn; }
			set
			{
				Settings.Default.ShowPlayerScoreColumn = value;
				Settings.Default.Save();
				Set(() => ShowPlayerScoreColumn, ref _showPlayerScoreColumn, value);
			}
		}

		public bool ShowClutch1v1Column
		{
			get { return _showClutch1v1Column; }
			set
			{
				Settings.Default.ShowClutch1v1Column = value;
				Settings.Default.Save();
				Set(() => ShowClutch1v1Column, ref _showClutch1v1Column, value);
			}
		}

		public bool ShowClutch1v2Column
		{
			get { return _showClutch1v2Column; }
			set
			{
				Settings.Default.ShowClutch1v2Column = value;
				Settings.Default.Save();
				Set(() => ShowClutch1v2Column, ref _showClutch1v2Column, value);
			}
		}

		public bool ShowClutch1v3Column
		{
			get { return _showClutch1v3Column; }
			set
			{
				Settings.Default.ShowClutch1v3Column = value;
				Settings.Default.Save();
				Set(() => ShowClutch1v3Column, ref _showClutch1v3Column, value);
			}
		}

		public bool ShowClutch1v4Column
		{
			get { return _showClutch1v4Column; }
			set
			{
				Settings.Default.ShowClutch1v4Column = value;
				Settings.Default.Save();
				Set(() => ShowClutch1v4Column, ref _showClutch1v4Column, value);
			}
		}

		public bool ShowClutch1v5Column
		{
			get { return _showClutch1v5Column; }
			set
			{
				Settings.Default.ShowClutch1v5Column = value;
				Settings.Default.Save();
				Set(() => ShowClutch1v5Column, ref _showClutch1v5Column, value);
			}
		}

		public bool ShowDurationColumn
		{
			get { return _showDurationColumn; }
			set
			{
				Settings.Default.ShowDurationColumn = value;
				Settings.Default.Save();
				Set(() => ShowDurationColumn, ref _showDurationColumn, value);
			}
		}

		public bool ShowOnlyUserStats
		{
			get { return _showOnlyUserStats; }
			set
			{
				if (Settings.Default.SteamID == 0) return;
				Settings.Default.ShowOnlyUserStats = value;
				Settings.Default.Save();
				Set(() => ShowOnlyUserStats, ref _showOnlyUserStats, value);
			}
		}

		public bool ShowCommentColumn
		{
			get { return _showCommentColumn; }
			set
			{
				Settings.Default.ShowCommentColumn = value;
				Settings.Default.Save();
				Set(() => ShowCommentColumn, ref _showCommentColumn, value);
			}
		}

		public bool ShowClutchCountColumn
		{
			get { return _showClutchCountColumn; }
			set
			{
				Settings.Default.ShowClutchCountColumn = value;
				Settings.Default.Save();
				Set(() => ShowClutchCountColumn, ref _showClutchCountColumn, value);
			}
		}

		public bool ShowTotalDamageHealthColumn
		{
			get { return _showTotalDamageHealthColumn; }
			set
			{
				Settings.Default.ShowTotalDamageHealthColumn = value;
				Settings.Default.Save();
				Set(() => ShowTotalDamageHealthColumn, ref _showTotalDamageHealthColumn, value);
			}
		}

		public bool ShowTotalDamageArmorColumn
		{
			get { return _showTotalDamageArmorColumn; }
			set
			{
				Settings.Default.ShowTotalDamageArmorColumn = value;
				Settings.Default.Save();
				Set(() => ShowTotalDamageArmorColumn, ref _showTotalDamageArmorColumn, value);
			}
		}

		public bool ShowAverageDamageColumn
		{
			get { return _showAverageDamageColumn; }
			set
			{
				Settings.Default.ShowAverageDamageColumn = value;
				Settings.Default.Save();
				Set(() => ShowAverageDamageColumn, ref _showAverageDamageColumn, value);
			}
		}

		public bool ShowBanColumns
		{
			get { return _showBanColumns; }
			set
			{
				Settings.Default.ShowBanColumns = value;
				Settings.Default.Save();
				Set(() => ShowBanColumns, ref _showBanColumns, value);
			}
		}

		public string CsgoExePath
		{
			get { return _csgoExePath; }
			set
			{
				Settings.Default.CsgoExePath = value;
				Settings.Default.Save();
				Set(() => CsgoExePath, ref _csgoExePath, value);
			}
		}

		public bool EnableMoviemakerMode
		{
			get { return _enableMoviemakerMode; }
			set
			{
				Settings.Default.MoviemakerMode = value;
				Settings.Default.Save();
				Set(() => EnableMoviemakerMode, ref _enableMoviemakerMode, value);
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
		/// Command to go to the log file
		/// </summary>
		public RelayCommand NavigateToLogFile
		{
			get
			{
				return _navigateToLogFile
					?? (_navigateToLogFile = new RelayCommand(
						async () =>
						{
							if (!File.Exists(AppDomain.CurrentDomain.BaseDirectory + Logger.LOG_FILENAME))
							{
								await _dialogService.ShowErrorAsync("There is no errors log file.", MessageDialogStyle.Affirmative);
								return;
							}
							string argument = "/select, \"" + AppDomain.CurrentDomain.BaseDirectory + Logger.LOG_FILENAME + "\"";
							Process.Start("explorer.exe", argument);
						}));
			}
		}

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
							Settings.Default.ResolutionWidth = Convert.ToInt32(width);
							Settings.Default.Save();
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
							Settings.Default.ResolutionHeight = Convert.ToInt32(height);
							Settings.Default.Save();
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
		/// Command to save additionals launch parameters
		/// </summary>
		public RelayCommand<string> SaveLaunchParametersCommand
		{
			get
			{
				return _saveLaunchParametersCommand
					?? (_saveLaunchParametersCommand = new RelayCommand<string>(
						parameters =>
						{
							Settings.Default.LaunchParameters = parameters;
							Settings.Default.Save();
						}));
			}
		}

		/// <summary>
		/// Command to clear demos data from cache
		/// </summary>
		public RelayCommand ClearDemosDataCacheCommand
		{
			get
			{
				return _clearDemosDataCacheCommand
					?? (_clearDemosDataCacheCommand = new RelayCommand(
					async () =>
					{
						var result = await _dialogService.ShowMessageAsync("Demos data will be deleted! Are you sure?", MessageDialogStyle.AffirmativeAndNegative);
						if (result == MessageDialogResult.Negative) return;
						await _cacheService.ClearDemosFile();
						await _dialogService.ShowMessageAsync("Demos data cleared.", MessageDialogStyle.Affirmative);
					}));
			}
		}

		/// <summary>
		/// Command to export custom data from the cache
		/// </summary>
		public RelayCommand ExportCustomDataCacheCommand
		{
			get
			{
				return _exportCustomDataCacheCommand
					?? (_exportCustomDataCacheCommand = new RelayCommand(
					async () =>
					{
						SaveFileDialog saveCustomDataDialog = new SaveFileDialog
						{
							FileName = "backup.json",
							Filter = "JSON file (*.json)|*.json"
						};

						if (saveCustomDataDialog.ShowDialog() == DialogResult.OK)
						{
							try
							{
								await _cacheService.CreateBackupCustomDataFile(saveCustomDataDialog.FileName);
								await _dialogService.ShowMessageAsync("The backup file has been created, you can re-import it from settings.", MessageDialogStyle.Affirmative);
							}
							catch (Exception e)
							{
								Logger.Instance.Log(e);
								await _dialogService.ShowErrorAsync("An error occured while exporting custom data.", MessageDialogStyle.Affirmative);
							}
						}
					}));
			}
		}

		/// <summary>
		/// Command to import custom data to the cache
		/// </summary>
		public RelayCommand ImportCustomDataCacheCommand
		{
			get
			{
				return _importCustomDataCacheCommand
					?? (_importCustomDataCacheCommand = new RelayCommand(
					async () =>
					{
						OpenFileDialog fileDialog = new OpenFileDialog
						{
							DefaultExt = ".json",
							Filter = "JSON file (.json)|*.json"
						};

						bool? result = fileDialog.ShowDialog();

						if (result == true)
						{
							try
							{
								string filename = fileDialog.FileName;

								// contains demos with only custom data
								List<Demo> demosFromBackup = await _demosService.GetDemosFromBackup(filename);

								// Retrieve needed demos information for serialization from headers
								List<string> folders = AppSettings.GetFolders().ToList();
								List<Demo> demosHeader = await _demosService.GetDemosHeader(folders);

								// Update custom data if the demo has been found
								foreach (Demo demo in demosFromBackup)
								{
									foreach (Demo demoHeader in demosHeader)
									{
										if (demoHeader.Equals(demo))
										{
											demoHeader.Comment = demo.Comment;
											demoHeader.Status = demo.Status;
											await _cacheService.WriteDemoDataCache(demoHeader);
											break;
										}
									}
								}

								await _dialogService.ShowMessageAsync("Custom data has been imported.", MessageDialogStyle.Affirmative);
							}
							catch (Exception e)
							{
								Logger.Instance.Log(e);
								await _dialogService.ShowErrorAsync("An error occured while importing custom data. The backup file may be corrupt.", MessageDialogStyle.Affirmative);
							}
						}
					}));
			}
		}

		/// <summary>
		/// Command to enable moviemaker mode
		/// </summary>
		public RelayCommand EnableMoviemakerModeCommand
		{
			get
			{
				return _enableMoviemakerModeCommand
					?? (_enableMoviemakerModeCommand = new RelayCommand(
					async () =>
					{
						string warningMessage =
							"Enabling moviemaker mode change the way the game is started (when you click on all \"Watch\" buttons."
							+ Environment.NewLine + "It will use the tool \"Half-Life Advanced Effects\" (HLAE) which is technically a hack."
							+ Environment.NewLine + "You should use it ONLY if you know what you are doing AND to make moviemaking related stuff."
							+ Environment.NewLine + "If you don't know what is this or you are not planning to make movies just click on cancel."
							+ Environment.NewLine + "If you enable it, the game is launched with the \"-insecure\" parameter (everytime), which means that you will not be able to join server protected by VAC and prevent from a VAC ban.";

						if (Settings.Default.CsgoExePath == string.Empty)
						{
							warningMessage += Environment.NewLine + "Please select the csgo.exe file location to enable it.";
						}

						var enable = await _dialogService.ShowMessageAsync(warningMessage, MessageDialogStyle.AffirmativeAndNegative);

						if (enable == MessageDialogResult.Affirmative)
						{
							if (Settings.Default.CsgoExePath == string.Empty)
							{
								EnableMoviemakerMode = ShowCsgoExeDialog();
							}
						}
						else
						{
							EnableMoviemakerMode = false;
						}
					}));
			}
		}

		/// <summary>
		/// Command to select the csgo.exe location
		/// </summary>
		public RelayCommand SelectCsgoExePathCommand
		{
			get
			{
				return _selectCsgoExePathCommand
					?? (_selectCsgoExePathCommand = new RelayCommand(
					() =>
					{
						ShowCsgoExeDialog();
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
			Settings.Default.SteamID = Convert.ToInt64(steamId);
			Settings.Default.Save();
		}

		#endregion

		public SettingsViewModel(DialogService dialogService, ICacheService chacheService, IDemosService demosService)
		{
			_dialogService = dialogService;
			_cacheService = chacheService;
			_demosService = demosService;
		}

		/// <summary>
		/// Display a file dialog to select the csgo.exe location
		/// </summary>
		/// <returns></returns>
		private bool ShowCsgoExeDialog()
		{
			bool enableMoviemakerMode = false;

			OpenFileDialog dialog = new OpenFileDialog
			{
				DefaultExt = "csgo.exe",
				Filter = "EXE Files (csgo.exe)|csgo.exe"
			};

			bool? result = dialog.ShowDialog();
			if (result != null && (bool)result)
			{
				CsgoExePath = dialog.FileName;
				enableMoviemakerMode = true;
			}

			return enableMoviemakerMode;
		}
	}
}
