using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Models;
using MahApps.Metro.Controls.Dialogs;

namespace Manager.Services
{
	public interface IDialogService
	{
		Task ShowCustomDialogAsync(CustomDialog dialog);

		Task HideCurrentDialog();

		Task<MessageDialogResult> ShowMessageAsync(string message, MessageDialogStyle dialogStyle);

		Task<MessageDialogResult> ShowErrorAsync(string message, MessageDialogStyle dialogStyle);

		Task<string> ShowInputAsync(string title, string message);

		Task<MessageDialogResult> ShowDemosFailedAsync(List<Demo> demosFailed);

		Task<MessageDialogResult> ShowNoInternetConnectionAsync();

		Task<MessageDialogResult> ShowDemosNotFoundAsync(List<Demo> demosNotFound);

		Task<MessageDialogResult> ShowExportDemosAsync();

		Task<MessageDialogResult> ShowExportPlayerStatsAsync(string playerName);

		Task<MessageDialogResult> ShowAnalyzeAllDemosAsync();

		Task<MessageDialogResult> ShowSteamNotFoundAsync();

		Task<MessageDialogResult> ShowHighLowWatchAsync();

		Task<MessageDialogResult> ShowHeatmapDataNotFoundAsync(string eventType);

		Task<MessageDialogResult> ShowSendShareCodeToThirdPartyConfirmationAsync(string thirdPartyName);
	}
}
