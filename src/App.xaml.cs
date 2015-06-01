using GalaSoft.MvvmLight.Threading;
using System.Windows;
#if RELEASE
using MahApps.Metro.Controls.Dialogs;
using System.Windows.Threading;
using CSGO_Demos_Manager.Internals;
using CSGO_Demos_Manager.Services;
#endif

namespace CSGO_Demos_Manager
{
	public partial class App
	{
#if RELEASE
		private readonly DialogService _dialogService;
#endif

		public App()
		{
			DispatcherHelper.Initialize();
#if RELEASE
			_dialogService = new DialogService();
			DispatcherUnhandledException += Application_DispatcherUnhandledException;
#endif
			Exit += Application_Exit;
		}

		private void Application_Exit(object sender, ExitEventArgs e)
		{
		}

#if RELEASE
		private async void Application_DispatcherUnhandledException(object sender, DispatcherUnhandledExceptionEventArgs e)
		{
			Logger.Instance.log(e.Exception);
			await _dialogService.ShowErrorAsync(e.Exception.Message, MessageDialogStyle.Affirmative);
			e.Handled = true;
		}
#endif
	}
}
