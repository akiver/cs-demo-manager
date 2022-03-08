using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Core.Models;
using Core.Models.Events;
using DemoInfo;
using Services.Interfaces;
using Player = Core.Models.Player;

namespace Services.Concrete
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
                            List<WeaponFireEvent> weaponFired = round.WeaponFired.Where(e => e.Weapon.Element == EquipmentElement.Smoke).ToList();
                            weaponFired.Sort((w1, w2) => w1.ShooterSteamId.CompareTo(w2.ShooterSteamId));
                            if (weaponFired.Count == round.SmokeStarted.Count)
                            {
                                List<SmokeNadeStartedEvent> smokeList = round.SmokeStarted.ToList();
                                smokeList.Sort((s1, s2) => s1.ThrowerSteamId.CompareTo(s2.ThrowerSteamId));
                                for (int i = 0; i < smokeList.Count; i++)
                                {
                                    if (smokeList[i].Point != null && smokeList[i].ThrowerSteamId == weaponFired[i].ShooterSteamId)
                                    {
                                        Stuff s = new Stuff
                                        {
                                            Tick = weaponFired[i].Tick,
                                            RoundSeconds =
                                                (float)Math.Round((weaponFired[i].Tick - round.FreezetimeEndTick) / demo.ServerTickrate, 2),
                                            DemoSeconds = (float)Math.Round(weaponFired[i].Tick / demo.ServerTickrate, 2),
                                            RoundNumber = round.Number,
                                            Type = StuffType.SMOKE,
                                            StartX = weaponFired[i].Point.X,
                                            StartY = weaponFired[i].Point.Y,
                                            EndX = smokeList[i].Point.X,
                                            EndY = smokeList[i].Point.Y,
                                            ThrowerName = weaponFired[i].ShooterName,
                                            ThrowerSteamId = weaponFired[i].ShooterSteamId,
                                            ShooterPosX = weaponFired[i].ShooterPosX,
                                            ShooterPosY = weaponFired[i].ShooterPosY,
                                            ShooterPosZ = weaponFired[i].ShooterPosZ,
                                            ShooterAnglePitch = weaponFired[i].ShooterAnglePitch,
                                            ShooterAngleYaw = weaponFired[i].ShooterAngleYaw,
                                        };
                                        stuffs.Add(s);
                                    }
                                }
                            }
                        }

                        break;
                    case StuffType.FLASHBANG:
                        foreach (Round round in demo.Rounds)
                        {
                            List<WeaponFireEvent> weaponFired = round.WeaponFired.Where(e => e.Weapon.Element == EquipmentElement.Flash).ToList();
                            weaponFired.Sort((w1, w2) => w1.ShooterSteamId.CompareTo(w2.ShooterSteamId));
                            if (weaponFired.Count == round.FlashbangsExploded.Count)
                            {
                                List<FlashbangExplodedEvent> flashList = round.FlashbangsExploded.ToList();
                                flashList.Sort((s1, s2) => s1.ThrowerSteamId.CompareTo(s2.ThrowerSteamId));
                                for (int i = 0; i < flashList.Count; i++)
                                {
                                    if (flashList[i].Point != null && flashList[i].ThrowerSteamId == weaponFired[i].ShooterSteamId)
                                    {
                                        Stuff s = new Stuff
                                        {
                                            Tick = weaponFired[i].Tick,
                                            RoundSeconds =
                                                (float)Math.Round((weaponFired[i].Tick - round.FreezetimeEndTick) / demo.ServerTickrate, 2),
                                            DemoSeconds = (float)Math.Round(weaponFired[i].Tick / demo.ServerTickrate, 2),
                                            RoundNumber = round.Number,
                                            Type = StuffType.FLASHBANG,
                                            StartX = weaponFired[i].Point.X,
                                            StartY = weaponFired[i].Point.Y,
                                            EndX = flashList[i].Point.X,
                                            EndY = flashList[i].Point.Y,
                                            ThrowerName = weaponFired[i].ShooterName,
                                            ThrowerSteamId = weaponFired[i].ShooterSteamId,
                                            ShooterPosX = weaponFired[i].ShooterPosX,
                                            ShooterPosY = weaponFired[i].ShooterPosY,
                                            ShooterPosZ = weaponFired[i].ShooterPosZ,
                                            ShooterAnglePitch = weaponFired[i].ShooterAnglePitch,
                                            ShooterAngleYaw = weaponFired[i].ShooterAngleYaw,
                                        };
                                        List<Player> flashedPlayerList = flashList[i].FlashedPlayerSteamIdList.Select(
                                            steamId => demo.Players.First(p => p.SteamId == steamId)).ToList();
                                        s.FlashedPlayers = flashedPlayerList;
                                        stuffs.Add(s);
                                    }
                                }
                            }
                        }

                        break;
                    case StuffType.HE:
                        foreach (Round round in demo.Rounds)
                        {
                            List<WeaponFireEvent> weaponFired = round.WeaponFired.Where(e => e.Weapon.Element == EquipmentElement.HE).ToList();
                            weaponFired.Sort((w1, w2) => w1.ShooterSteamId.CompareTo(w2.ShooterSteamId));
                            if (weaponFired.Count == round.ExplosiveGrenadesExploded.Count)
                            {
                                for (int i = 0; i < round.ExplosiveGrenadesExploded.Count; i++)
                                {
                                    List<ExplosiveNadeExplodedEvent> heList = round.ExplosiveGrenadesExploded.ToList();
                                    heList.Sort((s1, s2) => s1.ThrowerSteamId.CompareTo(s2.ThrowerSteamId));
                                    if (heList[i].Point != null && heList[i].ThrowerSteamId == weaponFired[i].ShooterSteamId)
                                    {
                                        Stuff s = new Stuff
                                        {
                                            Tick = weaponFired[i].Tick,
                                            RoundSeconds =
                                                (float)Math.Round((weaponFired[i].Tick - round.FreezetimeEndTick) / demo.ServerTickrate, 2),
                                            DemoSeconds = (float)Math.Round(weaponFired[i].Tick / demo.ServerTickrate, 2),
                                            RoundNumber = round.Number,
                                            Type = StuffType.HE,
                                            StartX = weaponFired[i].Point.X,
                                            StartY = weaponFired[i].Point.Y,
                                            EndX = heList[i].Point.X,
                                            EndY = heList[i].Point.Y,
                                            ThrowerName = weaponFired[i].ShooterName,
                                            ThrowerSteamId = weaponFired[i].ShooterSteamId,
                                            ShooterPosX = weaponFired[i].ShooterPosX,
                                            ShooterPosY = weaponFired[i].ShooterPosY,
                                            ShooterPosZ = weaponFired[i].ShooterPosZ,
                                            ShooterAnglePitch = weaponFired[i].ShooterAnglePitch,
                                            ShooterAngleYaw = weaponFired[i].ShooterAngleYaw,
                                        };
                                        stuffs.Add(s);
                                    }
                                }
                            }
                        }

                        break;
                    case StuffType.MOLOTOV:
                        foreach (Round round in demo.Rounds)
                        {
                            List<WeaponFireEvent> weaponFired = round.WeaponFired.Where(e => e.Weapon.Element == EquipmentElement.Molotov).ToList();
                            weaponFired.Sort((w1, w2) => w1.ShooterSteamId.CompareTo(w2.ShooterSteamId));
                            List<MolotovFireStartedEvent> fireStartedList =
                                demo.MolotovsFireStarted.Where(e => e.RoundNumber == round.Number).ToList();
                            fireStartedList.Sort((w1, w2) => w1.ThrowerSteamId.CompareTo(w2.ThrowerSteamId));
                            if (weaponFired.Count == fireStartedList.Count)
                            {
                                for (int i = 0; i < fireStartedList.Count; i++)
                                {
                                    if (fireStartedList[i].Point != null && fireStartedList[i].ThrowerSteamId == weaponFired[i].ShooterSteamId)
                                    {
                                        Stuff s = new Stuff
                                        {
                                            Tick = weaponFired[i].Tick,
                                            RoundSeconds =
                                                (float)Math.Round((weaponFired[i].Tick - round.FreezetimeEndTick) / demo.ServerTickrate, 2),
                                            DemoSeconds = (float)Math.Round(weaponFired[i].Tick / demo.ServerTickrate, 2),
                                            RoundNumber = round.Number,
                                            Type = StuffType.MOLOTOV,
                                            StartX = weaponFired[i].Point.X,
                                            StartY = weaponFired[i].Point.Y,
                                            EndX = fireStartedList[i].Point.X,
                                            EndY = fireStartedList[i].Point.Y,
                                            ThrowerName = weaponFired[i].ShooterName,
                                            ThrowerSteamId = weaponFired[i].ShooterSteamId,
                                            ShooterPosX = weaponFired[i].ShooterPosX,
                                            ShooterPosY = weaponFired[i].ShooterPosY,
                                            ShooterPosZ = weaponFired[i].ShooterPosZ,
                                            ShooterAnglePitch = weaponFired[i].ShooterAnglePitch,
                                            ShooterAngleYaw = weaponFired[i].ShooterAngleYaw,
                                        };
                                        stuffs.Add(s);
                                    }
                                }
                            }
                        }

                        break;
                    case StuffType.INCENDIARY:
                        foreach (Round round in demo.Rounds)
                        {
                            List<WeaponFireEvent> weaponFired =
                                round.WeaponFired.Where(e => e.Weapon.Element == EquipmentElement.Incendiary).ToList();
                            weaponFired.Sort((w1, w2) => w1.ShooterSteamId.CompareTo(w2.ShooterSteamId));
                            List<MolotovFireStartedEvent> fireStartedList =
                                demo.IncendiariesFireStarted.Where(e => e.RoundNumber == round.Number).ToList();
                            fireStartedList.Sort((w1, w2) => w1.ThrowerSteamId.CompareTo(w2.ThrowerSteamId));
                            if (weaponFired.Count == fireStartedList.Count)
                            {
                                for (int i = 0; i < fireStartedList.Count; i++)
                                {
                                    if (fireStartedList[i].Point != null && fireStartedList[i].ThrowerSteamId == weaponFired[i].ShooterSteamId)
                                    {
                                        Stuff s = new Stuff
                                        {
                                            Tick = weaponFired[i].Tick,
                                            RoundSeconds =
                                                (float)Math.Round((weaponFired[i].Tick - round.FreezetimeEndTick) / demo.ServerTickrate, 2),
                                            DemoSeconds = (float)Math.Round(weaponFired[i].Tick / demo.ServerTickrate, 2),
                                            RoundNumber = round.Number,
                                            Type = StuffType.INCENDIARY,
                                            StartX = weaponFired[i].Point.X,
                                            StartY = weaponFired[i].Point.Y,
                                            EndX = fireStartedList[i].Point.X,
                                            EndY = fireStartedList[i].Point.Y,
                                            ThrowerName = weaponFired[i].ShooterName,
                                            ThrowerSteamId = weaponFired[i].ShooterSteamId,
                                            ShooterPosX = weaponFired[i].ShooterPosX,
                                            ShooterPosY = weaponFired[i].ShooterPosY,
                                            ShooterPosZ = weaponFired[i].ShooterPosZ,
                                            ShooterAnglePitch = weaponFired[i].ShooterAnglePitch,
                                            ShooterAngleYaw = weaponFired[i].ShooterAngleYaw,
                                        };
                                        stuffs.Add(s);
                                    }
                                }
                            }
                        }

                        break;
                    case StuffType.DECOY:
                        foreach (Round round in demo.Rounds)
                        {
                            List<WeaponFireEvent> weaponFired = round.WeaponFired.Where(e => e.Weapon.Element == EquipmentElement.Decoy).ToList();
                            weaponFired.Sort((w1, w2) => w1.ShooterSteamId.CompareTo(w2.ShooterSteamId));
                            List<DecoyStartedEvent> decoyStartedList = demo.DecoyStarted.Where(e => e.RoundNumber == round.Number).ToList();
                            decoyStartedList.Sort((w1, w2) => w1.ThrowerSteamId.CompareTo(w2.ThrowerSteamId));
                            if (weaponFired.Count == decoyStartedList.Count)
                            {
                                for (int i = 0; i < decoyStartedList.Count; i++)
                                {
                                    if (decoyStartedList[i].Point != null && decoyStartedList[i].ThrowerSteamId == weaponFired[i].ShooterSteamId)
                                    {
                                        Stuff s = new Stuff
                                        {
                                            Tick = weaponFired[i].Tick,
                                            RoundSeconds =
                                                (float)Math.Round((weaponFired[i].Tick - round.FreezetimeEndTick) / demo.ServerTickrate, 2),
                                            DemoSeconds = (float)Math.Round(weaponFired[i].Tick / demo.ServerTickrate, 2),
                                            RoundNumber = round.Number,
                                            Type = StuffType.DECOY,
                                            StartX = weaponFired[i].Point.X,
                                            StartY = weaponFired[i].Point.Y,
                                            EndX = decoyStartedList[i].Point.X,
                                            EndY = decoyStartedList[i].Point.Y,
                                            ThrowerName = weaponFired[i].ShooterName,
                                            ThrowerSteamId = weaponFired[i].ShooterSteamId,
                                            ShooterPosX = weaponFired[i].ShooterPosX,
                                            ShooterPosY = weaponFired[i].ShooterPosY,
                                            ShooterPosZ = weaponFired[i].ShooterPosZ,
                                            ShooterAnglePitch = weaponFired[i].ShooterAnglePitch,
                                            ShooterAngleYaw = weaponFired[i].ShooterAngleYaw,
                                        };
                                        stuffs.Add(s);
                                    }
                                }
                            }
                        }

                        break;
                }
            });

            return stuffs.OrderBy(s => s.Tick).ToList();
        }
    }
}
