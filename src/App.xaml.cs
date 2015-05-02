using CefSharp;
using CSGO_Demos_Manager.Services;
using GalaSoft.MvvmLight.Threading;
using MahApps.Metro.Controls.Dialogs;
using System.Windows;
using System.Windows.Threading;

namespace CSGO_Demos_Manager
{
	public partial class App
	{
		private readonly DialogService _dialogService;

		public App()
		{
			_dialogService = new DialogService();
			DispatcherHelper.Initialize();
			#if RELEASE
			DispatcherUnhandledException += Application_DispatcherUnhandledException;
			#endif
			Exit += Application_Exit;
		}

		private void Application_Exit(object sender, ExitEventArgs e)
		{
			if (Cef.IsInitialized)
			{
				Cef.Shutdown();
			}
		}

		#if RELEASE
		private async void Application_DispatcherUnhandledException(object sender, DispatcherUnhandledExceptionEventArgs e)
		{
			await _dialogService.ShowErrorAsync(e.Exception.Message, MessageDialogStyle.Affirmative);
			e.Handled = true;
		}
		#endif
	}
}
