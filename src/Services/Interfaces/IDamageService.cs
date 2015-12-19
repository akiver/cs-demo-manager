using System.Collections.Generic;
using System.Threading.Tasks;
using CSGO_Demos_Manager.Models;
using DemoInfo;

namespace CSGO_Demos_Manager.Services.Interfaces
{
	public interface IDamageService
	{
		/// <summary>
		/// Return total damages value for the selection passed in parameters
		/// </summary>
		/// <param name="demo"></param>
		/// <param name="steamIdList"></param>
		/// <param name="roundNumberList"></param>
		/// <returns></returns>
		Task<double> GetTotalDamageAsync(Demo demo, List<long> steamIdList, List<int> roundNumberList);

		/// <summary>
		/// Return hit group damage value for selection passed in parameters
		/// </summary>
		/// <param name="demo"></param>
		/// <param name="hitGroup"></param>
		/// <param name="steamIdList"></param>
		/// <param name="roundNumberList"></param>
		/// <returns></returns>
		Task<double> GetHitGroupDamageAsync(Demo demo, Hitgroup hitGroup, List<long> steamIdList, List<int> roundNumberList);
	}
}