using System;
using System.Diagnostics;
using System.Runtime.InteropServices;
using System.Text;

namespace Core
{
	public class Win32Utils
	{
		[DllImport("user32.dll", SetLastError = true, CharSet = CharSet.Auto)]
		public static extern bool SetWindowText(IntPtr hwnd, string lpString);

		[DllImport("User32.dll", CharSet = CharSet.Auto)]
		private static extern int SendMessage(IntPtr hWnd, int msg, int wParam, ref COPYDATASTRUCT lParam);

		[DllImport("user32.dll")]
		public static extern IntPtr SendMessage(IntPtr hwnd, uint msg, IntPtr wParam, IntPtr lParam);

		[DllImport("user32.dll")]
		public static extern IntPtr SendMessage(IntPtr hwnd, uint msg, int wParam, int lParam);

		[DllImport("user32.dll")]
		public static extern bool SetForegroundWindow(IntPtr hWnd);

		[DllImport("user32", SetLastError = true)]
		[return: MarshalAs(UnmanagedType.Bool)]
		private static extern bool EnumThreadWindows(int threadId, EnumThreadWindowsCallback callback, IntPtr lParam);
		public delegate bool EnumThreadWindowsCallback(IntPtr hwnd, int lParam);

		[DllImport("user32", SetLastError = true, CharSet = CharSet.Auto)]
		private static extern int GetWindowText(IntPtr hWnd, StringBuilder text, int maxCount);

		[DllImport("user32.dll")]
		private static extern IntPtr GetForegroundWindow();

		[DllImport("user32.dll")]
		private static extern int GetSystemMetrics(int smIndex);

		[DllImport("user32.dll")]
		[return: MarshalAs(UnmanagedType.Bool)]
		private static extern bool GetWindowRect(IntPtr hWnd, out W32RECT lpRect);

		public const int WM_COPYDATA = 0x4A;

		/// <summary>
		/// Sent to display suspects view
		/// </summary>
		public const int WM_SUSPECTS = 0X524F;

		/// <summary>
		/// Sent to update new suspect banned count
		/// </summary>
		public const int WM_BANNED_SUSPECT_COUNT = 0X5256;

		/// <summary>
		/// Sent to notify the bot that CSGO DM is loaded
		/// </summary>
		public const int WM_CSGO_DM_LOADED = 0XFDD8;

		/// <summary>
		/// Sent to notify the bot that CSGO DM is closed
		/// </summary>
		public const int WM_CSGO_DM_CLOSED = 0X5591;

		/// <summary>
		/// Sent to load a demo passed as argument
		/// </summary>
		public const int WM_LOAD_DEMO = 0XFF30;

		/// <summary>
		/// Sent to download last demos
		/// </summary>
		public const int WM_DOWNLOAD_DEMOS = 0X585F;

		public const int WM_CLOSE = 0x0010;

		[StructLayout(LayoutKind.Sequential, CharSet = CharSet.Ansi)]
		public struct SteamIdListStruct
		{
			[MarshalAs(UnmanagedType.ByValArray, SizeConst = 100)]
			public long[] SteamIdList;
		}

		[StructLayout(LayoutKind.Sequential, CharSet = CharSet.Ansi)]
		public struct COPYDATASTRUCT
		{
			public IntPtr dwData;
			public int cbData;
			public IntPtr lpData;
		}

		public static int SendWindowStringMessage(IntPtr hWnd, int msgCode, int wParam, string msg)
		{
			int result = 0;
			COPYDATASTRUCT cds = new COPYDATASTRUCT
			{
				dwData = (IntPtr)msgCode,
				cbData = msg.Length,
				lpData = Marshal.StringToCoTaskMemAnsi(msg)
			};

			try
			{
				result = SendMessage(hWnd, WM_COPYDATA, wParam, ref cds);
			}
			catch (Exception e)
			{
				Logger.Instance.Log(e);
			}
			finally
			{
				Marshal.FreeHGlobal(cds.lpData);
			}

			return result;
		}

		public static int SendWindowLongArrayMessage(IntPtr hWnd, int msgCode, int wParam, long[] msg)
		{
			int result = 0;
			SteamIdListStruct cs = new SteamIdListStruct
			{
				SteamIdList = msg
			};
			COPYDATASTRUCT cds = new COPYDATASTRUCT
			{
				dwData = (IntPtr)msgCode,
				cbData = Marshal.SizeOf(cs),
				lpData = Marshal.AllocHGlobal(Marshal.SizeOf(cs))
			};

			try
			{
				Marshal.StructureToPtr(cs, cds.lpData, false);
				result = SendMessage(hWnd, WM_COPYDATA, wParam, ref cds);
			}
			finally
			{
				Marshal.FreeHGlobal(cds.lpData);
			}

			return result;
		}

		public static IntPtr FindWindowInProcess(Process process, Func<string, bool> compareTitle)
		{
			IntPtr windowHandle = IntPtr.Zero;

			foreach (ProcessThread t in process.Threads)
			{
				windowHandle = FindWindowInThread(t.Id, compareTitle);
				if (windowHandle != IntPtr.Zero)
				{
					break;
				}
			}

			return windowHandle;
		}

		private static IntPtr FindWindowInThread(int threadId, Func<string, bool> compareTitle)
		{
			IntPtr windowHandle = IntPtr.Zero;
			EnumThreadWindows(threadId, (hWnd, lParam) =>
			{
				StringBuilder sb = new StringBuilder();
				GetWindowText(hWnd, sb, sb.MaxCapacity);
				if (compareTitle(sb.ToString()))
				{
					windowHandle = hWnd;
					return false;
				}
				return true;
			}, IntPtr.Zero);

			return windowHandle;
		}

		[StructLayout(LayoutKind.Sequential)]
		public struct W32RECT
		{
			public int Left;
			public int Top;
			public int Right;
			public int Bottom;
		}

		public static bool IsForegroundWwindowFullScreen()
		{
			int scrX = GetSystemMetrics(0);
			int scrY = GetSystemMetrics(1);

			IntPtr handle = GetForegroundWindow();
			if (handle == IntPtr.Zero) return false;

			W32RECT wRect;
			if (!GetWindowRect(handle, out wRect)) return false;

			return scrX == (wRect.Right - wRect.Left) && scrY == (wRect.Bottom - wRect.Top);
		}

		/// <summary>
		/// Workaround to send message to the bot, since it's a windowless app, messages registration doesn't work
		/// It uses GetWindowText to retrieve the right hwnd for each window in the process
		/// </summary>
		/// <param name="msg"></param>
		public static IntPtr SendMessageToBot(uint msg)
		{
			Process[] processes = Process.GetProcessesByName(AppSettings.BOT_PROCESS_NAME);
			if (processes.Length > 0)
			{
				foreach (Process process in processes)
				{
					IntPtr hwnd = FindWindowInProcess(process, s => s == AppSettings.BOT_PROCESS_NAME);
					if (hwnd != IntPtr.Zero)
					{
						return SendMessage(hwnd, msg, IntPtr.Zero, IntPtr.Zero);
					}
				}
			}

			return IntPtr.Zero;
		}
	}
}
