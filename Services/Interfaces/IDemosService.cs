using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Threading;
using System.Threading.Tasks;
using Core.Models;
using Services.Models.Timelines;
using Demo = Core.Models.Demo;

namespace Services.Interfaces
{
	public interface IDemosService
	{
		/// <summary>
		/// Path where demos will be saved
		/// </summary>
		string DownloadFolderPath { get; set; }

		/// <summary>
		/// Selected account SteamID to focus on
		/// </summary>
		long SelectedStatsAccountSteamId { get; set; }

		/// <summary>
		/// Flag to focus on selected SteamID
		/// </summary>
		bool ShowOnlyAccountDemos { get; set; }

		bool IgnoreLaterBan { get; set; }

		/// <summary>
		/// Return demo's header
		/// </summary>
		/// <param name="demoFilePath"></param>
		/// <returns></returns>
		Task<Demo> GetDemoHeaderAsync(string demoFilePath);

		/// <summary>
		/// Return only demos header
		/// </summary>
		/// <param name="folders"></param>
		/// <param name="currentDemos"></param>
		/// <param name="size">Limit the demos list size returned</param>
		/// <returns></returns>
		Task<List<Demo>> GetDemosHeader(List<string> folders, List<Demo> currentDemos = null, int size = 0);

		/// <summary>
		/// Return the whole demo
		/// </summary>
		/// <param name="demo"></param>
		/// <returns></returns>
		Task<Demo> GetDemoDataAsync(Demo demo);

		/// <summary>
		/// Retrurn demo's data by demo's ID
		/// </summary>
		/// <param name="demoId"></param>
		/// <returns></returns>
		Task<Demo> GetDemoDataByIdAsync(string demoId);

		/// <summary>
		/// Analyze the demo passed on parameter
		/// </summary>
		/// <param name="demo"></param>
		/// <param name="token"></param>
		/// <param name="progressCallback"></param>
		/// <returns></returns>
		Task<Demo> AnalyzeDemo(Demo demo, CancellationToken token, Action<string, float> progressCallback = null);

		/// <summary>
		/// Save the demo's comment
		/// </summary>
		/// <param name="demo"></param>
		/// <param name="comment"></param>
		/// <returns></returns>
		Task SaveComment(Demo demo, string comment);

		/// <summary>
		/// Save the demo's status
		/// </summary>
		/// <param name="demo"></param>
		/// <param name="status"></param>
		/// <returns></returns>
		Task SaveStatus(Demo demo, string status);

		/// <summary>
		/// Change multiple demos source
		/// </summary>
		/// <param name="demos"></param>
		/// <param name="source"></param>
		/// <returns></returns>
		Task<ObservableCollection<Demo>> SetSource(ObservableCollection<Demo> demos, string source);

		/// <summary>
		/// Change a single demo's source
		/// </summary>
		/// <param name="demo"></param>
		/// <param name="source"></param>
		/// <returns></returns>
		Task<Demo> SetSource(Demo demo, string source);

		Task<Demo> AnalyzePlayersPosition(Demo demo, CancellationToken token);

		Task<List<Demo>> GetDemosFromBackup(string jsonFile);

		Task<Demo> AnalyzeBannedPlayersAsync(Demo demo);

		/// <summary>
		/// Return the last rank detected for the specific steamId
		/// </summary>
		/// <param name="steamId"></param>
		/// <returns></returns>
		Task<Rank> GetLastRankAccountStatsAsync(long steamId);

		/// <summary>
		/// Return demos that contains the SteamID
		/// </summary>
		/// <param name="steamId"></param>
		/// <returns></returns>
		Task<List<Demo>> GetDemosPlayer(string steamId);

		/// <summary>
		/// Delete a demo from file system
		/// </summary>
		/// <param name="demo"></param>
		/// <returns></returns>
		Task<bool> DeleteDemo(Demo demo);

		/// <summary>
		/// Return the list of demos that need to be downloaded
		/// demo name => demo URL 
		/// </summary>
		/// <returns></returns>
		Task<Dictionary<string, string>> GetDemoListUrl();

		/// <summary>
		/// Download the demo archive
		/// </summary>
		/// <param name="url">Url of the demo archive</param>
		/// <param name="location">Location where the archive will be saved</param>
		/// <returns></returns>
		Task<bool> DownloadDemo(string url, string location);

		/// <summary>
		/// Decompress the demo archive
		/// </summary>
		/// <param name="demoName"></param>
		/// <returns></returns>
		Task<bool> DecompressDemoArchive(string demoName);

		/// <summary>
		/// Create a txt file containing demo's chat messages
		/// </summary>
		/// <param name="demo"></param>
		/// <param name="filePath"></param>
		/// <returns></returns>
		void WriteChatFile(Demo demo, string filePath);

		/// <summary>
		/// Return demo's share code
		/// </summary>
		/// <param name="demo"></param>
		/// <returns></returns>
		Task<string> GetShareCode(Demo demo);

		/// <summary>
		/// Return the demo ID used in version prior to 2.11 version
		/// </summary>
		/// <returns></returns>
		Task<string> GetOldId(Demo demo);

		/// <summary>
		/// Return demo's timeline events.
		/// </summary>
		/// <param name="demo"></param>
		/// <returns></returns>
		Task<List<TimelineEvent>> GetTimeLineEventList(Demo demo);
	}
}
