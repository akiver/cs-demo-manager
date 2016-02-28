using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CSGO_Demos_Manager.Models;
using CSGO_Demos_Manager.Models.Events;
using CSGO_Demos_Manager.Services.Interfaces;
using DemoInfo;

namespace CSGO_Demos_Manager.Services
{
	public class StuffService : IStuffService
	{
		public async Task<List<Stuff>> GetStuffPointListAsync(Demo demo, StuffType type)
		{
			List<Stuff> stuffs = new List<Stuff>();

			await Task.Factory.StartNew(() =>
			{
				switch (type)
				{
					case StuffType.SMOKE:
						foreach (Round round in demo.Rounds)
						{
							List<WeaponFire> weaponFired = demo.WeaponFired.Where(e => e.RoundNumber == round.Number
							&& e.Weapon.Element == EquipmentElement.Smoke).ToList();
							for (int i = 0; i < round.SmokeStarted.Count; i++)
							{
								Stuff s = new Stuff
								{
									Tick = weaponFired[i].Tick,
									RoundNumber = round.Number,
									Type = StuffType.SMOKE,
									StartX = weaponFired[i].Point.X,
									StartY = weaponFired[i].Point.Y,
									EndX = round.SmokeStarted[i].Point.X,
									EndY = round.SmokeStarted[i].Point.Y,
									ThrowerName = weaponFired[i].ShooterName
								};
								stuffs.Add(s);
							}
						}
						break;
					case StuffType.FLASHBANG:
						foreach (Round round in demo.Rounds)
						{
							List<WeaponFire> weaponFired = demo.WeaponFired.Where(e => e.RoundNumber == round.Number
							&& e.Weapon.Element == EquipmentElement.Flash).ToList();
							for (int i = 0; i < round.FlashbangsExploded.Count; i++)
							{
								Stuff s = new Stuff
								{
									Tick = weaponFired[i].Tick,
									RoundNumber = round.Number,
									Type = StuffType.FLASHBANG,
									StartX = weaponFired[i].Point.X,
									StartY = weaponFired[i].Point.Y,
									EndX = round.FlashbangsExploded[i].Point.X,
									EndY = round.FlashbangsExploded[i].Point.Y,
									ThrowerName = weaponFired[i].ShooterName
								};
								stuffs.Add(s);
							}
						}
						break;
					case StuffType.HE:
						foreach (Round round in demo.Rounds)
						{
							List<WeaponFire> weaponFired = demo.WeaponFired.Where(e => e.RoundNumber == round.Number
							&& e.Weapon.Element == EquipmentElement.HE).ToList();
							for (int i = 0; i < round.ExplosiveGrenadesExploded.Count; i++)
							{
								Stuff s = new Stuff
								{
									Tick = weaponFired[i].Tick,
									RoundNumber = round.Number,
									Type = StuffType.HE,
									StartX = weaponFired[i].Point.X,
									StartY = weaponFired[i].Point.Y,
									EndX = round.ExplosiveGrenadesExploded[i].Point.X,
									EndY = round.ExplosiveGrenadesExploded[i].Point.Y,
									ThrowerName = weaponFired[i].ShooterName
								};
								stuffs.Add(s);
							}
						}
						break;
					case StuffType.MOLOTOV:
					case StuffType.INCENDIARY:
						foreach (Round round in demo.Rounds)
						{
							List<WeaponFire> weaponFired = demo.WeaponFired.Where(e => e.RoundNumber == round.Number
							&& (e.Weapon.Element == EquipmentElement.Incendiary || e.Weapon.Element == EquipmentElement.Molotov)).ToList();
							List<MolotovFireStartedEvent> fireStartedList = demo.MolotovFireStarted.Where(e => e.RoundNumber == round.Number).ToList();
							for (int i = 0; i < fireStartedList.Count; i++)
							{
								Stuff s = new Stuff
								{
									Tick = weaponFired[i].Tick,
									RoundNumber = round.Number,
									Type = StuffType.MOLOTOV,
									StartX = weaponFired[i].Point.X,
									StartY = weaponFired[i].Point.Y,
									EndX = fireStartedList[i].Point.X,
									EndY = fireStartedList[i].Point.Y,
									ThrowerName = weaponFired[i].ShooterName
								};
								stuffs.Add(s);
							}
						}
						break;
					case StuffType.DECOY:
						foreach (Round round in demo.Rounds)
						{
							List<WeaponFire> weaponFired = demo.WeaponFired.Where(e => e.RoundNumber == round.Number
							&& e.Weapon.Element == EquipmentElement.Decoy).ToList();
							List<DecoyStartedEvent> decoyStartedList = demo.DecoyStarted.Where(e => e.RoundNumber == round.Number).ToList();
							for (int i = 0; i < decoyStartedList.Count; i++)
							{
								Stuff s = new Stuff
								{
									Tick = weaponFired[i].Tick,
									RoundNumber = round.Number,
									Type = StuffType.DECOY,
									StartX = weaponFired[i].Point.X,
									StartY = weaponFired[i].Point.Y,
									EndX = decoyStartedList[i].Point.X,
									EndY = decoyStartedList[i].Point.Y,
									ThrowerName = weaponFired[i].ShooterName
								};
								stuffs.Add(s);
							}
						}
						break;
				}
			});

			return stuffs;
		}
	}
}
