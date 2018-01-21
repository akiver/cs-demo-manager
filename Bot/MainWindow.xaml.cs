using System;
using System.Diagnostics;
using System.Windows;
using System.Windows.Interop;
using Core;

namespace SuspectsBot
{
	public partial class MainWindow : Window
	{
		public MainWindow()
		{
			InitializeComponent();
		}

		private void MainWindow_OnLoaded(object sender, RoutedEventArgs e)
		{
			Process p = Process.GetCurrentProcess();
			Win32Utils.SetWindowText(p.MainWindowHandle, AppSettings.BOT_PROCESS_NAME);
			ShowInTaskbar = false;
		}

		protected override void OnSourceInitialized(EventArgs e)
		{
			base.OnSourceInitialized(e);
			HwndSource source = PresentationSource.FromVisual(this) as HwndSource;
			source?.AddHook(WndProc);
		}

		private static IntPtr WndProc(IntPtr hwnd, int msg, IntPtr wParam, IntPtr lParam, ref bool handled)
		{
			if (msg == Win32Utils.WM_CSGO_DM_LOADED)
			{
				var dataContext = App.NotifyIcon.DataContext as NotifyIconViewModel;
				dataContext?.UpdateCsgoDmStatus(true);
				handled = true;
			}

			if (msg == Win32Utils.WM_CSGO_DM_CLOSED)
			{
				var dataContext = App.NotifyIcon.DataContext as NotifyIconViewModel;
				dataContext?.UpdateCsgoDmStatus(false);
				handled = true;
			}

			if (msg == Win32Utils.WM_TOGGLE_DOWNLOAD_NOTIFICATION)
			{
				NotifyIconViewModel dataContext = App.NotifyIcon.DataContext as NotifyIconViewModel;
				if (dataContext != null)
					dataContext.SendDownloadNotificationOnGameClosed = !dataContext.SendDownloadNotificationOnGameClosed;
				handled = true;
			}

			return IntPtr.Zero;
		}
	}
}
