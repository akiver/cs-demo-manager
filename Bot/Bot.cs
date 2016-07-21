using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Threading;
using System.Threading.Tasks;
using Core;
using Services.Concrete;

namespace SuspectsBot
{
	public class Bot
	{
		private readonly SteamService _steamService;

		private readonly CacheService _cacheService;

		public bool IsRunning { get; set; }

		/// <summary>
		/// If CSGO DM is running, this flag is set to true when it has fully loaded
		/// </summary>
		private bool _isCsgoDmLoaded;

		private CancellationTokenSource _cts;

		public bool IsCsgoDmLoaded
		{
			get { return _isCsgoDmLoaded; }
			set
			{
				_isCsgoDmLoaded = value;
				// Start a check when CSGO DM is loaded
				if (value) Task.Factory.StartNew(async () => await Check());
			}
		}

		/// <summary>
		/// Last time a check has been done
		/// </summary>
		private DateTime _lastCheckDate;

		public event EventHandler<SuspectBannedEventArgs> SuspectBanned;

		public async Task<bool> Check()
		{
			List<string> steamIdList = await _cacheService.GetSuspectsListFromCache();
			List<string> bannedSteamIdList = await _cacheService.GetSuspectsBannedList();
			List<string> newBannedSteamIdList = await _steamService.GetNewSuspectBannedArray(steamIdList, bannedSteamIdList);
			_lastCheckDate = DateTime.Now;

			if (newBannedSteamIdList.Count > 0)
			{
				// add new ban to cache
				foreach (string steamId in newBannedSteamIdList)
				{
					await _cacheService.AddSteamIdToBannedList(steamId);
				}
				SuspectBannedEventArgs e = new SuspectBannedEventArgs
				{
					SteamIdList = newBannedSteamIdList
				};
				SuspectBanned?.Invoke(this, e);

				return true;
			}

			return false;
		}

		public Bot()
		{
			_cacheService = new CacheService();
			_steamService = new SteamService();
			Start();
		}

		public void Start()
		{
			Task.Run(async () =>
			{
				IsRunning = true;
				if (_cts == null) _cts = new CancellationTokenSource();
				while (IsRunning)
				{
					try
					{
						if (ShouldCheck()) await Check();
						await Task.Delay(60000, _cts.Token);
					}
					catch (Exception e)
					{
						if (!(e is TaskCanceledException))
						{
							Logger.Instance.Log(e);
						}
					}
				}
			});
		}

		public void Stop()
		{
			IsRunning = false;
			_cts.Cancel();
			_cts = null;
			_lastCheckDate = DateTime.MinValue;
		}

		private bool ShouldCheck()
		{
			if ((DateTime.Now - _lastCheckDate).TotalMinutes < Properties.Settings.Default.CheckDelayMinutes)
			{
				return false;
			}
			if (Win32Utils.IsForegroundWwindowFullScreen())
			{
				return false;
			}
			if (Process.GetProcessesByName("csgo").Length > 0)
			{
				return false;
			}
			// don't check if CSGO DM is started but not fully loaded to prevent early notifications
			if (AppSettings.IsRunning() && !IsCsgoDmLoaded)
			{
				return false;
			}

			return true;
		}
	}

	public class SuspectBannedEventArgs : EventArgs
	{
		public List<string> SteamIdList { get; set; }
	}
}
