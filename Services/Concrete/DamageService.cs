using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Core.Models;
using DemoInfo;
using Services.Interfaces;

namespace Services.Concrete
{
	public class DamageService : IDamageService
	{
		public async Task<double> GetHitGroupDamageAsync(Demo demo, Hitgroup hitGroup, List<long> steamIdList, List<int> roundNumberList)
		{
			double result = 0;
			await Task.Factory.StartNew(() =>
			{
				// get the total damage made at the specific hitgroup
				switch (hitGroup)
				{
					case Hitgroup.Chest:
						result += demo.PlayersHurted.Where(e => steamIdList.Contains(e.AttackerSteamId) && e.HitGroup == Hitgroup.Chest
						&& roundNumberList.Contains(e.RoundNumber)).Sum(e => e.HealthDamage);
						break;
					case Hitgroup.Head:
						result += demo.PlayersHurted.Where(e => steamIdList.Contains(e.AttackerSteamId) && e.HitGroup == Hitgroup.Head
						&& roundNumberList.Contains(e.RoundNumber)).Sum(e => e.HealthDamage);
						break;
					case Hitgroup.LeftArm:
						result += demo.PlayersHurted.Where(e => steamIdList.Contains(e.AttackerSteamId) && e.HitGroup == Hitgroup.LeftArm
						&& roundNumberList.Contains(e.RoundNumber)).Sum(e => e.HealthDamage);
						break;
					case Hitgroup.RightArm:
						result += demo.PlayersHurted.Where(e => steamIdList.Contains(e.AttackerSteamId) && e.HitGroup == Hitgroup.RightArm
						&& roundNumberList.Contains(e.RoundNumber)).Sum(e => e.HealthDamage);
						break;
					case Hitgroup.LeftLeg:
						result += demo.PlayersHurted.Where(e => steamIdList.Contains(e.AttackerSteamId) && e.HitGroup == Hitgroup.LeftLeg
						&& roundNumberList.Contains(e.RoundNumber)).Sum(e => e.HealthDamage);
						break;
					case Hitgroup.RightLeg:
						result += demo.PlayersHurted.Where(e => steamIdList.Contains(e.AttackerSteamId) && e.HitGroup == Hitgroup.RightLeg
						&& roundNumberList.Contains(e.RoundNumber)).Sum(e => e.HealthDamage);
						break;
					case Hitgroup.Stomach:
						result += demo.PlayersHurted.Where(e => steamIdList.Contains(e.AttackerSteamId) && e.HitGroup == Hitgroup.Stomach
						&& roundNumberList.Contains(e.RoundNumber)).Sum(e => e.HealthDamage);
						break;
				}
			});

			return result;
		}

		public async Task<double> GetTotalDamageAsync(Demo demo, List<long> steamIdList, List<int> roundNumberList)
		{
			double total = 0;
			await Task.Factory.StartNew(() =>
			{
				// get the total damage made at specific round(s) and player(s)
				total += demo.PlayersHurted.Where(e => e.AttackerSteamId != 0 && steamIdList.Contains(e.AttackerSteamId)
				&& roundNumberList.Contains(e.RoundNumber)).Sum(e => e.HealthDamage);
			});
			return total;
		}
	}
}
