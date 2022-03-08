using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Models;
using DemoInfo;
using Services.Interfaces;

namespace Services.Design
{
    public class DamageDesignService : IDamageService
    {
        public Task<double> GetTotalDamageAsync(Demo demo, List<long> steamIdList, List<int> roundNumberList)
        {
            return Task.FromResult(500.5);
        }

        public Task<double> GetHitGroupDamageAsync(Demo demo, Hitgroup hitGroup, List<long> steamIdList, List<int> roundNumberList)
        {
            double result = 0;
            switch (hitGroup)
            {
                case Hitgroup.Chest:
                    result = 110;
                    break;
                case Hitgroup.LeftArm:
                    result = 20;
                    break;
                case Hitgroup.RightArm:
                    result = 30;
                    break;
                case Hitgroup.Head:
                    result = 40;
                    break;
                case Hitgroup.LeftLeg:
                    result = 50;
                    break;
                case Hitgroup.RightLeg:
                    result = 60;
                    break;
                case Hitgroup.Stomach:
                    result = 70;
                    break;
            }

            return Task.FromResult(result);
        }
    }
}
