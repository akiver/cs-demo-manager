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
	public class DialogService : IDialogService
	{
		private CustomDialog _currentDialog;

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

		public async Task<MessageDialogResult> ShowHeatmapDataNotFoundAsync(string eventType)
		{
			string type = string.Empty;
			switch (eventType)
			{
				case "kills":
					type = Properties.Resources.Kills;
					break;
				case "deaths":
					type = Properties.Resources.Deaths;
					break;
				case "shots":
					type = Properties.Resources.Shots;
					break;
				case "flashbangs":
					type = Properties.Resources.Flashbangs;
					break;
				case "he":
					type = Properties.Resources.HeGrenades;
					break;
				case "smokes":
					type = Properties.Resources.Smokes;
					break;
				case "molotovs":
					type = Properties.Resources.Molotovs;
					break;
				case "incendiaries":
					type = Properties.Resources.Incendiaries;
					break;
				case "decoys":
					type = Properties.Resources.Decoys;
					break;
			}
			return await ShowMessageAsync(string.Format(Properties.Resources.NoHeatmapDataFound, type.ToLower()), MessageDialogStyle.Affirmative);
		}

		public async Task ShowCustomDialogAsync(CustomDialog dialog)
		{
			_currentDialog = dialog;
			var metroWindow = Application.Current.MainWindow as MetroWindow;
			await metroWindow.ShowMetroDialogAsync(dialog);
		}

		public async Task HideCurrentDialog()
		{
			if (_currentDialog != null)
			{
				var metroWindow = Application.Current.MainWindow as MetroWindow;
				await metroWindow.HideMetroDialogAsync(_currentDialog);
				_currentDialog = null;
			}
		}

		public async Task<MessageDialogResult> ShowSendShareCodeToThirdPartyConfirmationAsync(string thirdPartyName)
		{
			MetroWindow metroWindow = Application.Current.MainWindow as MetroWindow;
			MetroDialogSettings dialogOptions = new MetroDialogSettings
			{
				AffirmativeButtonText = Properties.Resources.Yes,
				NegativeButtonText = Properties.Resources.No,
				FirstAuxiliaryButtonText = Properties.Resources.YesDontAsk
			};

			return await metroWindow.ShowMessageAsync(Properties.Resources.Information, string.Format(Properties.Resources.DialogSendThirdPartyConfirmation, thirdPartyName), MessageDialogStyle.AffirmativeAndNegativeAndSingleAuxiliary, dialogOptions);
		}
	}
}
