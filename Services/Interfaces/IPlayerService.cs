using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Models;
using Services.Models.Charts;
using Services.Models.Stats;

namespace Services.Interfaces
{
	public interface IPlayerService
	{
		/// <summary>
		/// Return player list stats for a specific round
		/// </summary>
		/// <param name="demo"></param>
		/// <param name="round"></param>
		/// <returns></returns>
		Task<List<PlayerRoundStats>> GetPlayerRoundStatsListAsync(Demo demo, Round round);

		/// <summary>
		/// Return player stats for a specific round
		/// </summary>
		/// <param name="demo"></param>
		/// <param name="player"></param>
		/// <returns></returns>
		Task<List<PlayerRoundStats>> GetRoundListStatsAsync(Demo demo, Player player);

		/// <summary>
		/// Return data for the equipment value chart (LineSeries)
		/// </summary>
		/// <param name="demo"></param>
		/// <param name="player"></param>
		/// <returns></returns>
		Task<List<GenericDoubleChart>> GetEquipmentValueChartAsync(Demo demo, Player player);

		/// <summary>
		/// Return data for the money earned chart (LineSeries)
		/// </summary>
		/// <param name="demo"></param>
		/// <param name="player"></param>
		/// <returns></returns>
		Task<List<GenericDoubleChart>> GetCashEarnedChartAsync(Demo demo, Player player);

		/// <summary>
		/// Return data for the damages health chart (LineSeries)
		/// </summary>
		/// <param name="demo"></param>
		/// <param name="player"></param>
		/// <returns></returns>
		Task<List<GenericDoubleChart>> GetDamageHealthChartAsync(Demo demo, Player player);

		/// <summary>
		/// Return data for the damages armor chart (LineSeries)
		/// </summary>
		/// <param name="demo"></param>
		/// <param name="player"></param>
		/// <returns></returns>
		Task<List<GenericDoubleChart>> GetDamageArmorChartAsync(Demo demo, Player player);

		/// <summary>
		/// Return data for the total damages health chart (LineSeries)
		/// </summary>
		/// <param name="demo"></param>
		/// <param name="player"></param>
		/// <returns></returns>
		Task<List<GenericDoubleChart>> GetTotalDamageHealthChartAsync(Demo demo, Player player);

		/// <summary>
		/// Return data for the total damages armor chart (LineSeries)
		/// </summary>
		/// <param name="demo"></param>
		/// <param name="player"></param>
		/// <returns></returns>
		Task<List<GenericDoubleChart>> GetTotalDamageArmorChartAsync(Demo demo, Player player);

		/// <summary>
		/// Return data for the weapon kills chart (Pie)
		/// </summary>
		/// <param name="demo"></param>
		/// <param name="player"></param>
		/// <returns></returns>
		Task<List<GenericDoubleChart>> GetWeaponKillChartAsync(Demo demo, Player player);
	}
}
