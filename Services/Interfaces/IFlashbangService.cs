using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Models;
using Services.Models.Stats;

namespace Services.Interfaces
{
	public interface IFlashbangService
	{
		Demo Demo { get; set; }

		Task<List<FlashbangDataPoint>> GetPlayersFlashTimesData();

		Task<List<FlashbangDataPoint>> GetTeamsFlashTimesData();

		Task<List<FlashbangDataPoint>> GetAverageFlashTimesPlayersData();
	}
}
