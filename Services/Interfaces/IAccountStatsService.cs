using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Models;
using Services.Models.Charts;
using Services.Models.Stats;

namespace Services.Interfaces
{
	public interface IAccountStatsService
	{
		long SelectedStatsAccountSteamId { get; set; }

		/// <summary>
		/// Change the demo's data to the selected SteamID
		/// Used to change on the fly data displayed when the user want to see stats for a specific player
		/// </summary>
		/// <param name="demo"></param>
		/// <param name="accountSteamId"></param>
		/// <returns></returns>
		Task<Demo> MapSelectedAccountValues(Demo demo, long accountSteamId);

		/// <summary>
		/// Return Rank model evolution for the rank chart
		/// </summary>
		/// <returns></returns>
		Task<List<RankDateChart>> GetRankDateChartDataAsync(string scale);

		/// <summary>
		/// Return overall stats for the selected account
		/// </summary>
		/// <returns></returns>
		Task<OverallStats> GetGeneralAccountStatsAsync();

		/// <summary>
		/// Return stats for the map stats view
		/// </summary>
		/// <returns></returns>
		Task<MapStats> GetMapStatsAsync();

		/// <summary>
		/// Return stats for the weapon stats view
		/// </summary>
		/// <returns></returns>
		Task<WeaponStats> GetWeaponStatsAsync();

		/// <summary>
		/// Return stats for the progression stats view
		/// </summary>
		/// <returns></returns>
		Task<ProgressStats> GetProgressStatsAsync();
	}
}
