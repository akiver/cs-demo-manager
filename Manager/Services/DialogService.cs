using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Windows;
using Core;
using Core.Models;
using MahApps.Metro.Controls;
using MahApps.Metro.Controls.Dialogs;

namespace Manager.Services
{
	public class DialogService
	{
		public async Task<MessageDialogResult> ShowMessageAsync(string message, MessageDialogStyle dialogStyle)
		{
			var metroWindow = Application.Current.MainWindow as MetroWindow;
			return await metroWindow.ShowMessageAsync(Properties.Resources.Information, message, dialogStyle);
		}

		public async Task<MessageDialogResult> ShowErrorAsync(string message, MessageDialogStyle dialogStyle)
		{
			var metroWindow = Application.Current.MainWindow as MetroWindow;
			return await metroWindow.ShowMessageAsync(Properties.Resources.Error, message, dialogStyle);
		}

		public async Task<string> ShowInputAsync(string title, string message)
		{
			var metroWindow = Application.Current.MainWindow as MetroWindow;
			return await metroWindow.ShowInputAsync(title, message);
		}

		public async Task<MessageDialogResult> ShowDemosFailedAsync(List<Demo> demosFailed)
		{
			string errorMessage = Properties.Resources.DialogErrorAnalyzingDemos + Environment.NewLine;
			errorMessage = demosFailed.Aggregate(errorMessage, (current, demoFailed) => current + (demoFailed.Name + Environment.NewLine));
			errorMessage += string.Format(Properties.Resources.DialogDemosMayBeTooOld, AppSettings.APP_WEBSITE);

			var metroWindow = Application.Current.MainWindow as MetroWindow;
			return await metroWindow.ShowMessageAsync(Properties.Resources.Error, errorMessage);
		}

		public async Task<MessageDialogResult> ShowNoInternetConnectionAsync()
		{
			var metroWindow = Application.Current.MainWindow as MetroWindow;
			return await metroWindow.ShowMessageAsync(Properties.Resources.DialogNoConnexionDetected, Properties.Resources.DialogNoConnexionNoFeature);
		}

		public async Task<MessageDialogResult> ShowDemosNotFoundAsync(List<Demo> demosNotFound)
		{
			string errorMessage = Properties.Resources.DialogDemosNotFound + Environment.NewLine;
			errorMessage = demosNotFound.Aggregate(errorMessage, (current, demoNotFound) => current + (demoNotFound.Name + Environment.NewLine));

			var metroWindow = Application.Current.MainWindow as MetroWindow;
			return await metroWindow.ShowMessageAsync(Properties.Resources.Error, errorMessage);
		}

		public async Task<MessageDialogResult> ShowExportDemosAsync()
		{
			var metroWindow = Application.Current.MainWindow as MetroWindow;
			MetroDialogSettings dialogOptions = new MetroDialogSettings
			{
				AffirmativeButtonText = Properties.Resources.Single,
				NegativeButtonText = Properties.Resources.Multiple,
				FirstAuxiliaryButtonText = Properties.Resources.Cancel
			};

			return await metroWindow.ShowMessageAsync(Properties.Resources.Export, Properties.Resources.DialogExportMultipleOrSingle,
				MessageDialogStyle.AffirmativeAndNegativeAndSingleAuxiliary, dialogOptions);
		}

		public async Task<MessageDialogResult> ShowExportPlayerStatsAsync(string playerName)
		{
			var metroWindow = Application.Current.MainWindow as MetroWindow;
			MetroDialogSettings dialogOptions = new MetroDialogSettings
			{
				AffirmativeButtonText = Properties.Resources.Ok,
				NegativeButtonText = Properties.Resources.Cancel
			};

			return await metroWindow.ShowMessageAsync(Properties.Resources.Export, string.Format(Properties.Resources.DialogExportPlayer, playerName), MessageDialogStyle.AffirmativeAndNegative, dialogOptions);
		}

		public async Task<MessageDialogResult> ShowAnalyzeAllDemosAsync()
		{
			var metroWindow = Application.Current.MainWindow as MetroWindow;
			MetroDialogSettings dialogOptions = new MetroDialogSettings
			{
				AffirmativeButtonText = Properties.Resources.Selection,
				NegativeButtonText = Properties.Resources.AllFemale,
				FirstAuxiliaryButtonText = Properties.Resources.Cancel
			};

			return await metroWindow.ShowMessageAsync(Properties.Resources.Analyze, Properties.Resources.DialogAnalyzeAllDemosConfirmation, MessageDialogStyle.AffirmativeAndNegativeAndSingleAuxiliary, dialogOptions);
		}

		public async Task<MessageDialogResult> ShowSteamNotFoundAsync()
		{
			string errorMessage = Properties.Resources.DialogSteamNotFound;

			var metroWindow = Application.Current.MainWindow as MetroWindow;
			return await metroWindow.ShowMessageAsync(Properties.Resources.Error, errorMessage);
		}

		public async Task<MessageDialogResult> ShowHighLowWatchAsync()
		{
			MetroWindow metroWindow = Application.Current.MainWindow as MetroWindow;
			MetroDialogSettings dialogOptions = new MetroDialogSettings
			{
				AffirmativeButtonText = Properties.Resources.PlayerPov,
				NegativeButtonText = Properties.Resources.EnemyPov,
				FirstAuxiliaryButtonText = Properties.Resources.Cancel
			};

			return await metroWindow.ShowMessageAsync(Properties.Resources.Pov, Properties.Resources.DialogPovSelection, MessageDialogStyle.AffirmativeAndNegativeAndSingleAuxiliary, dialogOptions);
		}
	}
}
