using System;
using System.Runtime.InteropServices;
using System.Text;
using CSGO_Demos_Manager.Models.Events;
using DemoInfo;

namespace CSGO_Demos_Manager.Services
{
	public static class SoundService
	{
		[DllImport("winmm.dll")]
		public static extern int waveOutSetVolume(IntPtr hwo, uint dwVolume);

		[DllImport("winmm.dll")]
		static extern Int32 mciSendString(string command, StringBuilder buffer, int bufferSize, IntPtr hwndCallback);

		private static readonly string SoundsPath = AppDomain.CurrentDomain.BaseDirectory + "Resources\\sounds\\";

		public static void SetVolume(int value)
		{
			int volume = ((ushort.MaxValue / 10) * value);
			uint volumeAllChannels = (((uint)volume & 0x0000ffff) | ((uint)volume << 16));
			waveOutSetVolume(IntPtr.Zero, volumeAllChannels);
		}

		public static void PlayHeExploded()
		{
			PlaySound("he_explode.wav");
		}

		public static void PlayDecoyExploded()
		{
			PlaySound("he_explode.wav");
		}

		public static void PlayFlashbangExploded()
		{
			PlaySound("flashbang_explode.wav");
		}

		public static void PlaySmokeDetonated()
		{
			PlaySound("smoke_explode.wav");
		}

		public static void PlayMolotovThrowed(Team team)
		{
			if (team == Team.CounterTerrorist)
			{
				PlaySound("ct_molotov.wav");
				return;
			}
			PlaySound("t_molotov.wav");
		}

		public static void PlayFlashbangThrowed(Team team)
		{
			if (team == Team.CounterTerrorist)
			{
				PlaySound("ct_flashbang.wav");
				return;
			}
			PlaySound("t_flashbang.wav");
		}

		public static void PlayHeGrenadeThrowed(Team team)
		{
			if (team == Team.CounterTerrorist)
			{
				PlaySound("ct_grenade.wav");
				return;
			}
			PlaySound("t_grenade.wav");
		}

		public static void PlayDecoyThrowed(Team team)
		{
			if (team == Team.CounterTerrorist)
			{
				PlaySound("ct_decoy.wav");
				return;
			}
			PlaySound("t_decoy.wav");
		}

		public static void PlaySmokeThrowed(Team team)
		{
			if (team == Team.CounterTerrorist)
			{
				PlaySound("ct_smoke.wav");
				return;
			}
			PlaySound("t_smoke.wav");
		}

		public static void PlayMolotovExploded()
		{
			PlaySound("molotov_detonate.wav");
		}

		public static void PlayBombPlanted()
		{
			PlaySound("bomb_planted.wav");
		}

		public static void PlayBombDefused()
		{
			PlaySound("bomb_defused.wav");
		}

		public static void PlayBombExploded()
		{
			PlaySound("bomb_exploded.wav");
		}

		public static void PlayPlayerKilled(Team team)
		{
			if (team == Team.CounterTerrorist)
			{
				PlaySound("ct_death.wav");
				return;
			}
			PlaySound("t_death.wav");
		}

		public static void PlayWeaponFired(Team team, WeaponFire weapon)
		{
			switch (weapon.Weapon.Name)
			{
				case "flashbang":
					PlayFlashbangThrowed(team);
					break;
				case "smokegrenade":
					PlaySmokeThrowed(team);
					break;
				case "hegrenade":
					PlayHeGrenadeThrowed(team);
					break;
				case "decoy":
					PlayDecoyThrowed(team);
					break;
				case "molotov":
				case "incgrenade":
					PlayMolotovThrowed(team);
					break;
			}
		}

		private static void PlaySound(string fileName)
		{
			mciSendString("stop " + fileName, null, 0, IntPtr.Zero);
			mciSendString("close " + fileName, null, 0, IntPtr.Zero);
			mciSendString("open \"" + SoundsPath + fileName + "\" type waveaudio alias " + fileName, null, 0, IntPtr.Zero);
			mciSendString("play " + fileName, null, 0, IntPtr.Zero);
		}

		public static void CloseSounds()
		{
			mciSendString("close ct_death.wav", null, 0, IntPtr.Zero);
			mciSendString("close t_death.wav", null, 0, IntPtr.Zero);
			mciSendString("close bomb_exploded.wav", null, 0, IntPtr.Zero);
			mciSendString("close bomb_defused.wav", null, 0, IntPtr.Zero);
			mciSendString("close bomb_planted.wav", null, 0, IntPtr.Zero);
			mciSendString("close molotov_detonate.wav", null, 0, IntPtr.Zero);
			mciSendString("close t_smoke.wav", null, 0, IntPtr.Zero);
			mciSendString("close ct_smoke.wav", null, 0, IntPtr.Zero);
			mciSendString("close t_decoy.wav", null, 0, IntPtr.Zero);
			mciSendString("close ct_decoy.wav", null, 0, IntPtr.Zero);
			mciSendString("close t_grenade.wav", null, 0, IntPtr.Zero);
			mciSendString("close ct_grenade.wav", null, 0, IntPtr.Zero);
			mciSendString("close t_flashbang.wav", null, 0, IntPtr.Zero);
			mciSendString("close ct_flashbang.wav", null, 0, IntPtr.Zero);
			mciSendString("close t_molotov.wav", null, 0, IntPtr.Zero);
			mciSendString("close ct_molotov.wav", null, 0, IntPtr.Zero);
			mciSendString("close smoke_explode.wav", null, 0, IntPtr.Zero);
			mciSendString("close flashbang_explode.wav", null, 0, IntPtr.Zero);
			mciSendString("close he_explode.wav", null, 0, IntPtr.Zero);
		}
	}
}