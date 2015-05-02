using System;
using System.Net.Http;
using MahApps.Metro.Controls;
using System.Windows;
using System.Windows.Input;
using MahApps.Metro.Controls.Dialogs;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using CSGO_Demos_Manager.ViewModel;
using GalaSoft.MvvmLight.Threading;

namespace CSGO_Demos_Manager
{
	public partial class MainWindow : MetroWindow
	{
		public MainWindow()
		{
			InitializeComponent();
			Closing += (s, e) => ViewModelLocator.Cleanup();
		}

		private void MetroWindow_Loaded(object sender, RoutedEventArgs e)
		{
			if (!AppSettings.IsCsgoInstalled())
			{
				DispatcherHelper.CheckBeginInvokeOnUI(
				async () =>
				{
					await this.ShowMessageAsync("CSGO Not Found", "CSGO doesn't seems to be installed, you will not be able to launch the game.");
				});
			}

			if (Properties.Settings.Default.EnableCheckUpdate)
			{
				DispatcherHelper.CheckBeginInvokeOnUI(
				async () =>
				{
					bool isUpdateAvailable = await CheckUpdate();
					if (isUpdateAvailable)
					{
						var dialogOptions = MetroDialogOptions;
						dialogOptions.ColorScheme = MetroDialogColorScheme.Accented;
						var download = await this.ShowMessageAsync("Update available", "A new version is available. Do you want to download it?", MessageDialogStyle.AffirmativeAndNegative, dialogOptions);
						if (download == MessageDialogResult.Affirmative)
						{
							System.Diagnostics.Process.Start(AppSettings.APP_WEBSITE);
						}
						
					}
				});
			}
		}

		private static async Task<bool> CheckUpdate()
		{
			using (var httpClient = new HttpClient())
			{
				//  Grab general infos from user
				string url = AppSettings.APP_WEBSITE + "/update";
				HttpResponseMessage result = await httpClient.GetAsync(url);
				string version = await result.Content.ReadAsStringAsync();

				Version lastVersion = new Version(version);
				Version currentVersion = new Version(AppSettings.APP_VERSION);

				var resultCompare = currentVersion.CompareTo(lastVersion);
				if (resultCompare < 0)
				{
					return true;
				}
				return false;
			}
		}

		private void NumberPreviewTextInput(object sender, TextCompositionEventArgs e)
		{
			Regex regex = new Regex("[^0-9]+");
			e.Handled = regex.IsMatch(e.Text);
		}
	}
}
