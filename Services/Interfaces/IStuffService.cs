using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Models;
using Demo = Core.Models.Demo;

namespace Services.Interfaces
{
    public interface IStuffService
    {
        Task<List<Stuff>> GetStuffPointListAsync(Demo demo, StuffType type);
    }
}
