using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Threading;
using System.Threading.Tasks;
using Core.Models;
using Demo = Core.Models.Demo;

namespace Services.Interfaces
{
	public interface IDemosService
	{
		/// <summary>
		/// Path where demos will be saved
		/// </summary>
		string DownloadFolderPath { get; set; }

		long SelectedStatsAccountSteamId { get; set; }

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
		/// <param name="limit"></param>
		/// /// <param name="accountSteamId"></param>
		/// <returns></returns>
		Task<List<Demo>> GetDemosHeader(List<string> folders, List<Demo> currentDemos = null, bool limit = false, long accountSteamId = 0);

		/// <summary>
		/// Return the whole demo
		/// </summary>
		/// <param name="demo"></param>
		/// <returns></returns>
		Task<Demo> GetDemoDataAsync(Demo demo);

		/// <summary>
		/// Analyze the demo passed on parameter
		/// </summary>
		/// <param name="demo"></param>
		/// <param name="token"></param>
		/// <returns></returns>
		Task<Demo> AnalyzeDemo(Demo demo, CancellationToken token);

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

		Task SetSource(ObservableCollection<Demo> demos, string source);

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
	}
}
