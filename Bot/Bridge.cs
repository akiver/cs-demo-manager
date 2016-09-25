using System;
using System.Collections.Generic;
using System.Diagnostics;
using Core;

namespace SuspectsBot
{
	public class Bridge
	{
		private Process _csgoDmProcess;

		public bool StartCsgoDemosManager()
		{
			Process[] processes = Process.GetProcessesByName(AppSettings.PROCESS_NAME);
			if (processes.Length > 0)
			{
				_csgoDmProcess = processes[0];
				Win32Utils.SetForegroundWindow(_csgoDmProcess.MainWindowHandle);

				return true;
			}

			_csgoDmProcess = Process.Start(AppSettings.PROCESS_NAME);

			return true;
		}

		public bool ShowSuspectsList()
		{
			Process[] processes = Process.GetProcessesByName(AppSettings.PROCESS_NAME);
			if (processes.Length > 0)
			{
				_csgoDmProcess = processes[0];
				Win32Utils.SetForegroundWindow(_csgoDmProcess.MainWindowHandle);
				Win32Utils.SendMessage(_csgoDmProcess.MainWindowHandle, Win32Utils.WM_SUSPECTS, IntPtr.Zero, IntPtr.Zero);

				return true;
			}

			_csgoDmProcess = new Process
			{
				StartInfo =
					{
						FileName = AppSettings.PROCESS_NAME,
						Arguments = "/suspects"
					}
			};
			_csgoDmProcess.Start();

			return true;
		}

		public void SendSuspectBannedCount(int bannedCount)
		{
			Process[] processes = Process.GetProcessesByName(AppSettings.PROCESS_NAME);
			if (processes.Length > 0)
			{
				_csgoDmProcess = processes[0];
				Win32Utils.SetForegroundWindow(_csgoDmProcess.MainWindowHandle);
				Win32Utils.SendMessage(_csgoDmProcess.MainWindowHandle, Win32Utils.WM_BANNED_SUSPECT_COUNT, bannedCount, 0);
			}
		}

		public void SendSteamIdList(List<string> steamIdList)
		{
			long[] steamIdLongList = new long[100];
			for (int i = 0; i < 100; i++)
			{
				if (steamIdList.Count > i)
				{
					steamIdLongList[i] = Convert.ToInt64(steamIdList[i]);
				}
				else
				{
					steamIdLongList[i] = 0;
				}
			}
			Win32Utils.SendWindowLongArrayMessage(_csgoDmProcess.MainWindowHandle, Win32Utils.WM_SUSPECTS, 0, steamIdLongList);
		}

		public bool DownloadDemos()
		{
			Process[] processes = Process.GetProcessesByName(AppSettings.PROCESS_NAME);
			if (processes.Length > 0)
			{
				_csgoDmProcess = processes[0];
				Win32Utils.SetForegroundWindow(_csgoDmProcess.MainWindowHandle);
				Win32Utils.SendMessage(_csgoDmProcess.MainWindowHandle, Win32Utils.WM_DOWNLOAD_DEMOS, IntPtr.Zero, IntPtr.Zero);

				return true;
			}

			_csgoDmProcess = new Process
			{
				StartInfo =
					{
						FileName = AppSettings.PROCESS_NAME,
						Arguments = "/download"
					}
			};
			_csgoDmProcess.Start();

			return true;
		}
	}
}
