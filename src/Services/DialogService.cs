using MahApps.Metro.Controls;
using MahApps.Metro.Controls.Dialogs;
using System.Threading.Tasks;
using System.Windows;

namespace CSGO_Demos_Manager.Services
{
	public class DialogService
	{
		public async Task<MessageDialogResult> ShowMessageAsync(string message, MessageDialogStyle dialogStyle)
		{
			var metroWindow = (Application.Current.MainWindow as MetroWindow);
			metroWindow.MetroDialogOptions.ColorScheme = MetroDialogColorScheme.Accented;

			return await metroWindow.ShowMessageAsync("Information", message, dialogStyle, metroWindow.MetroDialogOptions);
		}

		public async Task<MessageDialogResult> ShowErrorAsync(string message, MessageDialogStyle dialogStyle)
		{
			var metroWindow = (Application.Current.MainWindow as MetroWindow);
			metroWindow.MetroDialogOptions.ColorScheme = MetroDialogColorScheme.Accented;

			return await metroWindow.ShowMessageAsync("Error", message, dialogStyle, metroWindow.MetroDialogOptions);
		}

		public async Task<string> ShowInputAsync(string title, string message)
		{
			var metroWindow = (App.Current.MainWindow as MetroWindow);
			metroWindow.MetroDialogOptions.ColorScheme = MetroDialogColorScheme.Accented;

			return await metroWindow.ShowInputAsync(title, message, metroWindow.MetroDialogOptions);
		}
	}
}
