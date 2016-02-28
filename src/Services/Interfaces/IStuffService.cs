using System.Collections.Generic;
using System.Threading.Tasks;
using CSGO_Demos_Manager.Models;

namespace CSGO_Demos_Manager.Services.Interfaces
{
	public interface IStuffService
	{
		Task<List<Stuff>> GetStuffPointListAsync(Demo demo, StuffType type);
	}
}
