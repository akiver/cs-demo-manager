using System.Collections.Generic;
using System.Threading.Tasks;
using CSGO_Demos_Manager.Models;
using CSGO_Demos_Manager.Models.Timeline;

namespace CSGO_Demos_Manager.Services.Interfaces
{
	public interface IRoundService
	{
		/// <summary>
		/// Return round's events (used for timeline)
		/// </summary>
		/// <param name="demo"></param>
		/// <param name="round"></param>
		/// <returns></returns>
		Task<List<RoundEvent>> GetTimeLineEventList(Demo demo, Round round);
	}
}
