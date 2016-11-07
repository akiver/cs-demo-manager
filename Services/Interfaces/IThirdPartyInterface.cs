using System.Threading.Tasks;
using Core.Models;
using Services.Models.ThirdParties;

namespace Services.Interfaces
{
	public interface IThirdPartyInterface
	{
		Task<ThirdPartyData> SendShareCode(Demo demo, string shareCode);
	}
}
