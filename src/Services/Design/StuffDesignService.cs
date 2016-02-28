using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CSGO_Demos_Manager.Models;
using CSGO_Demos_Manager.Services.Interfaces;

namespace CSGO_Demos_Manager.Services.Design
{
	public class StuffDesignService : IStuffService
	{
		public Task<List<Stuff>> GetStuffPointListAsync(Demo demo, StuffType type)
		{
			throw new NotImplementedException();
		}
	}
}
