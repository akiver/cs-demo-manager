using System.Collections.Generic;
using System.Threading.Tasks;
using CSGO_Demos_Manager.Models;
using CSGO_Demos_Manager.Models.Stats;

namespace CSGO_Demos_Manager.Services.Interfaces
{
	public interface IPlayerService
	{
		/// <summary>
		/// Return players stats for a specific round
		/// </summary>
		/// <param name="demo"></param>
		/// <param name="round"></param>
		/// <returns></returns>
		Task<List<PlayerRoundStats>> GetRoundStats(Demo demo, Round round);
	}
}
