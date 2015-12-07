using System;
using System.Collections.Generic;
using System.Linq;
using MahApps.Metro.Controls;
using MahApps.Metro.Controls.Dialogs;
using System.Threading.Tasks;
using System.Windows;
using CSGO_Demos_Manager.Models;

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

		public async Task<MessageDialogResult> ShowDemosFailedAsync(List<Demo> demosFailed)
		{
			string errorMessage = "An error occured while analyzing the following demos : " + Environment.NewLine;
			errorMessage = demosFailed.Aggregate(errorMessage, (current, demoFailed) => current + (demoFailed.Name + Environment.NewLine));
			errorMessage += "This demos may be too old, if not please send an email with the attached demos." +
				"You can find more information on http://csgo-demos-manager.com.";

			var metroWindow = (Application.Current.MainWindow as MetroWindow);
			metroWindow.MetroDialogOptions.ColorScheme = MetroDialogColorScheme.Accented;

			return await metroWindow.ShowMessageAsync("Error", errorMessage, MessageDialogStyle.Affirmative, metroWindow.MetroDialogOptions);
		}

		public async Task<MessageDialogResult> ShowNoInternetConnectionAsync()
		{
			var metroWindow = (Application.Current.MainWindow as MetroWindow);
			metroWindow.MetroDialogOptions.ColorScheme = MetroDialogColorScheme.Accented;

			return await metroWindow.ShowMessageAsync("No Internet Connection", "No Internet connection detected, you can't use this feature.", MessageDialogStyle.Affirmative, metroWindow.MetroDialogOptions);
		}

		public async Task<MessageDialogResult> ShowDemosNotFoundAsync(List<Demo> demosNotFound)
		{
			string errorMessage = "The following demos have not been found : " + Environment.NewLine;
			errorMessage = demosNotFound.Aggregate(errorMessage, (current, demoNotFound) => current + (demoNotFound.Name + Environment.NewLine));

			var metroWindow = (Application.Current.MainWindow as MetroWindow);
			metroWindow.MetroDialogOptions.ColorScheme = MetroDialogColorScheme.Accented;

			return await metroWindow.ShowMessageAsync("Error", errorMessage, MessageDialogStyle.Affirmative, metroWindow.MetroDialogOptions);
		}

		public async Task<MessageDialogResult> ShowExportDemosAsync()
		{
			var metroWindow = (Application.Current.MainWindow as MetroWindow);
			MetroDialogSettings dialogOptions = new MetroDialogSettings
			{
				AffirmativeButtonText = "Single",
				NegativeButtonText = "Multiple",
				FirstAuxiliaryButtonText = "Cancel",
				ColorScheme = MetroDialogColorScheme.Accented
			};

			return await metroWindow.ShowMessageAsync("Export", "Do you want to export data into a single file or in multiple files?",
				MessageDialogStyle.AffirmativeAndNegativeAndSingleAuxiliary, dialogOptions);
		}
	}
}
