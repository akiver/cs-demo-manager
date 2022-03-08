using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Core.Models;
using Core.Models.Events;
using DemoInfo;
using Services.Interfaces;
using Services.Models.Timelines;

namespace Services.Concrete
{
    public class RoundService : IRoundService
    {
        public Task<List<TimelineEvent>> GetTimeLineEventList(Demo demo, Round round)
        {
            List<TimelineEvent> events = new List<TimelineEvent>();
            float tickrate = demo.ServerTickrate;

            foreach (KillEvent e in round.Kills)
            {
                events.Add(new KillEventTimeline(tickrate, e.Tick - round.Tick, (int)(e.Tick + demo.Tickrate) - round.Tick)
                {
                    VictimName = e.KilledName,
                    KillerName = e.KillerName,
                    WeaponName = e.Weapon.Name,
                });
            }

            List<WeaponFireEvent> flashs = round.WeaponFired.Where(e => e.Weapon.Element == EquipmentElement.Flash).ToList();
            foreach (WeaponFireEvent e in flashs)
            {
                events.Add(new FlashThrownEventTimeline(tickrate, e.Tick - round.Tick, e.Tick + (int)demo.Tickrate - round.Tick)
                {
                    ThrowerName = e.ShooterName,
                });
            }

            List<WeaponFireEvent> smokes = round.WeaponFired.Where(e => e.Weapon.Element == EquipmentElement.Smoke).ToList();
            foreach (WeaponFireEvent e in smokes)
            {
                events.Add(new SmokeThrownEventTimeline(tickrate, e.Tick - round.Tick, e.Tick + (int)demo.Tickrate - round.Tick)
                {
                    ThrowerName = e.ShooterName,
                });
            }

            List<WeaponFireEvent> he = round.WeaponFired.Where(e => e.Weapon.Element == EquipmentElement.HE).ToList();
            foreach (WeaponFireEvent e in he)
            {
                events.Add(new HeThrownEventTimeline(tickrate, e.Tick - round.Tick, e.Tick + (int)demo.Tickrate - round.Tick)
                {
                    ThrowerName = e.ShooterName,
                });
            }

            List<WeaponFireEvent> molotovs = round.WeaponFired.Where(e => e.Weapon.Element == EquipmentElement.Molotov).ToList();
            foreach (WeaponFireEvent e in molotovs)
            {
                events.Add(new MolotovThrownEventTimeline(tickrate, e.Tick - round.Tick, e.Tick + (int)demo.Tickrate - round.Tick)
                {
                    ThrowerName = e.ShooterName,
                });
            }

            List<WeaponFireEvent> incendiaries = round.WeaponFired.Where(e => e.Weapon.Element == EquipmentElement.Incendiary).ToList();
            foreach (WeaponFireEvent e in incendiaries)
            {
                events.Add(new IncendiaryThrownEventTimeline(tickrate, e.Tick - round.Tick, e.Tick + (int)demo.Tickrate - round.Tick)
                {
                    ThrowerName = e.ShooterName,
                });
            }

            List<WeaponFireEvent> decoys = round.WeaponFired.Where(e => e.Weapon.Element == EquipmentElement.Decoy).ToList();
            foreach (WeaponFireEvent e in decoys)
            {
                events.Add(new DecoyThrownEventTimeline(tickrate, e.Tick - round.Tick, e.Tick + (int)demo.Tickrate - round.Tick)
                {
                    ThrowerName = e.ShooterName,
                });
            }

            if (round.BombPlanted != null)
            {
                events.Add(new BombPlantedEventTimeline(tickrate, round.BombPlanted.Tick - round.Tick,
                    round.BombPlanted.Tick + (int)demo.Tickrate - round.Tick)
                {
                    PlanterName = round.BombPlanted.PlanterName,
                    Site = round.BombPlanted.Site,
                });
            }

            if (round.BombDefused != null)
            {
                events.Add(new BombDefusedEventTimeline(tickrate, round.BombDefused.Tick - round.Tick,
                    round.BombDefused.Tick + (int)demo.Tickrate - round.Tick)
                {
                    Site = round.BombDefused.Site,
                    DefuserName = round.BombDefused.DefuserName,
                });
            }

            if (round.BombExploded != null)
            {
                events.Add(new BombExplodedEventTimeline(tickrate, round.BombExploded.Tick - round.Tick,
                    round.BombExploded.Tick + (int)demo.Tickrate - round.Tick)
                {
                    PlanterName = round.BombExploded.PlanterName,
                    Site = round.BombExploded.Site,
                });
            }

            return Task.FromResult(events);
        }

        public Task<Round> MapRoundValuesToSelectedPlayer(Demo demo, Round round, long playerSteamId = 0)
        {
            if (playerSteamId != 0)
            {
                int playerKillCount = round.Kills.Count(k => k.KillerSteamId == playerSteamId);
                round.KillCount = round.Kills.Count(k => k.KillerSteamId == playerSteamId);
                round.OneKillCount = playerKillCount == 1 ? 1 : 0;
                round.TwoKillCount = playerKillCount == 2 ? 1 : 0;
                round.ThreeKillCount = playerKillCount == 3 ? 1 : 0;
                round.FourKillCount = playerKillCount == 4 ? 1 : 0;
                round.FiveKillCount = playerKillCount == 5 ? 1 : 0;
                round.TradeKillCount = round.Kills.Count(k => k.KillerSteamId == playerSteamId && k.IsTradeKill);
                round.CrouchKillCount = round.Kills.Count(k => k.KillerSteamId == playerSteamId && k.IsKillerCrouching);
                round.JumpKillCount = round.Kills.Count(k => k.KillerSteamId == playerSteamId && k.KillerVelocityZ > 0);
                round.DamageHealthCount = round.PlayersHurted.Where(h => h.AttackerSteamId == playerSteamId)
                    .Sum(h => h.HealthDamage);
                round.DamageArmorCount = round.PlayersHurted.Where(h => h.AttackerSteamId == playerSteamId)
                    .Sum(h => h.ArmorDamage);
                round.AverageHealthDamagePerPlayer = demo.Rounds.Count > 0 ? Math.Round((double)round.DamageHealthCount / demo.Rounds.Count, 1) : 0;
                round.BombExplodedCount = round.BombExploded != null && round.BombExploded.PlanterSteamId == playerSteamId ? 1 : 0;
                round.BombPlantedCount = round.BombPlanted != null && round.BombPlanted.PlanterSteamId == playerSteamId ? 1 : 0;
                round.BombDefusedCount = round.BombDefused != null && round.BombDefused.DefuserSteamId == playerSteamId ? 1 : 0;
                round.FlashbangThrownCount =
                    round.WeaponFired.Count(e => e.ShooterSteamId == playerSteamId && e.Weapon.Element == EquipmentElement.Flash);
                round.SmokeThrownCount =
                    round.WeaponFired.Count(e => e.ShooterSteamId == playerSteamId && e.Weapon.Element == EquipmentElement.Smoke);
                round.HeGrenadeThrownCount =
                    round.WeaponFired.Count(e => e.ShooterSteamId == playerSteamId && e.Weapon.Element == EquipmentElement.HE);
                round.DecoyThrownCount =
                    round.WeaponFired.Count(e => e.ShooterSteamId == playerSteamId && e.Weapon.Element == EquipmentElement.Decoy);
                round.MolotovThrownCount =
                    round.WeaponFired.Count(e => e.ShooterSteamId == playerSteamId && e.Weapon.Element == EquipmentElement.Molotov);
                round.IncendiaryThrownCount =
                    round.WeaponFired.Count(e => e.ShooterSteamId == playerSteamId && e.Weapon.Element == EquipmentElement.Incendiary);
            }

            return Task.FromResult(round);
        }
    }
}
