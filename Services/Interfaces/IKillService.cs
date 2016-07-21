using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Models;
using Services.Models.Stats;

namespace Services.Interfaces
{
	public interface IKillService
	{
		Demo Demo { get; set; }

		Task<List<KillDataPoint>> GetPlayersKillsMatrix();
	}
}