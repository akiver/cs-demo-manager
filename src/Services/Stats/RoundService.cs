using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CSGO_Demos_Manager.Models;
using CSGO_Demos_Manager.Models.Events;
using CSGO_Demos_Manager.Models.Timeline;
using CSGO_Demos_Manager.Services.Interfaces;
using DemoInfo;

namespace CSGO_Demos_Manager.Services.Stats
{
	public class RoundService : IRoundService
	{
		public async Task<List<RoundEvent>> GetTimeLineEventList(Demo demo, Round round)
		{
			List<RoundEvent> roundEventList = new List<RoundEvent>();
			await Task.Factory.StartNew(() =>
			{
				foreach (KillEvent e in demo.Kills)
				{
					if (e.RoundNumber == round.Number)
					{
						roundEventList.Add(new RoundEvent
						{
							StartTime = DateTime.Today.AddSeconds(e.Seconds - round.StartTimeSeconds),
							EndTime = DateTime.Today.AddSeconds(e.Seconds - round.StartTimeSeconds + 1),
							Category = "Kills",
							Message = e.KillerName + " killed " + e.KilledName,
							Type = "kill"
						});
					}
				}
				foreach (WeaponFire e in demo.WeaponFired)
				{
					if (e.RoundNumber == round.Number)
					{
						string type = string.Empty;
						string message = string.Empty;
						string category = string.Empty;
						switch (e.Weapon.Element)
						{
							case EquipmentElement.Flash:
								type = "flash";
								category = "Flashbang";
								message = e.ShooterName + " thrown a flashbang";
								break;
							case EquipmentElement.Smoke:
								type = "smoke";
								category = "Smoke";
								message = e.ShooterName + " thrown a smoke";
								break;
							case EquipmentElement.Decoy:
								type = "decoy";
								category = "Decoy";
								message = e.ShooterName + " thrown a decoy";
								break;
							case EquipmentElement.HE:
								type = "he";
								category = "HE";
								message = e.ShooterName + " thrown a HE grenade";
								break;
							case EquipmentElement.Molotov:
								type = "molotov";
								category = "Molotov";
								message = e.ShooterName + " thrown a molotov";
								break;
							case EquipmentElement.Incendiary:
								type = "incendiary";
								category = "Molotov";
								message = e.ShooterName + " thrown an incendiary";
								break;
						}

						if (type != string.Empty)
						{
							roundEventList.Add(new RoundEvent
							{
								StartTime = DateTime.Today.AddSeconds(e.Seconds - round.StartTimeSeconds),
								EndTime = DateTime.Today.AddSeconds(e.Seconds - round.StartTimeSeconds + 1),
								Category = category,
								Message = message,
								Type = type
							});
						}
					}
				}

				if (round.BombPlanted != null)
				{
					roundEventList.Add(new RoundEvent
					{
						StartTime = DateTime.Today.AddSeconds(round.BombPlanted.Seconds - round.StartTimeSeconds),
						EndTime = DateTime.Today.AddSeconds(round.BombPlanted.Seconds - round.StartTimeSeconds + 1),
						Category = "Bomb",
						Message = round.BombPlanted.PlanterName + " planted the bomb on bomb site " + round.BombPlanted.Site,
						Type = "bomb_planted"
					});
				}

				if (round.BombDefused != null)
				{
					roundEventList.Add(new RoundEvent
					{
						StartTime = DateTime.Today.AddSeconds(round.BombDefused.Seconds - round.StartTimeSeconds),
						EndTime = DateTime.Today.AddSeconds(round.BombDefused.Seconds - round.StartTimeSeconds + 1),
						Category = "Bomb",
						Message = round.BombDefused.DefuserName + " defused the bomb on bomb site " + round.BombDefused.Site,
						Type = "bomb_defused"
					});
				}
				if (round.BombExploded != null)
				{
					roundEventList.Add(new RoundEvent
					{
						StartTime = DateTime.Today.AddSeconds(round.BombExploded.Seconds - round.StartTimeSeconds),
						EndTime = DateTime.Today.AddSeconds(round.BombExploded.Seconds - round.StartTimeSeconds + 1),
						Category = "Bomb",
						Message = "The bomb exploded on bomb site " + round.BombExploded.Site,
						Type = "bomb_exploded"
					});
				}
			});
			return roundEventList;
		}
	}
}
