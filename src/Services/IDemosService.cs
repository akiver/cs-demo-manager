using CSGO_Demos_Manager.Models;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Threading.Tasks;

namespace CSGO_Demos_Manager.Services
{
	public interface IDemosService
	{
		/// <summary>
		/// Return only header's demos 
		/// </summary>
		/// <returns></returns>
		Task<List<Demo>> GetDemosHeader(List<string> folders);

		/// <summary>
		/// Analyze the demo passed on parameter
		/// </summary>
		/// <param name="demo"></param>
		/// <returns></returns>
		Task<Demo> AnalyzeDemo(Demo demo);

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

		Task<Demo> AnalyzePlayersPosition(Demo demo);

		Task<Demo> AnalyzeHeatmapPoints(Demo demo);

		Task<List<Demo>> GetDemosFromBackup(string jsonFile);

		Task<Demo> AnalyzeBannedPlayersAsync(Demo demo);

		/// <summary>
		/// Return the last rank detected of the selected account
		/// </summary>
		/// <returns></returns>
		Task<Rank> GetLastRankAccountStatsAsync();
	}
}
