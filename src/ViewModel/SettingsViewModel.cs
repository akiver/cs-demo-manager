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
