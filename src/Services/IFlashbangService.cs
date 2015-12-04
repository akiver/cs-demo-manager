using System.Collections.Generic;
using System.Threading.Tasks;
using CSGO_Demos_Manager.Models;
using CSGO_Demos_Manager.Models.Stats;

namespace CSGO_Demos_Manager.Services
{
	public interface IFlashbangService
	{
		Demo Demo { get; set; }

		Task<List<FlashbangDataPoint>> GetPlayersFlashTimesData();

		Task<List<FlashbangDataPoint>> GetTeamsFlashTimesData();

		Task<List<FlashbangDataPoint>> GetAverageFlashTimesPlayersData();
	}
}
