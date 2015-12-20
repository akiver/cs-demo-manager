using System.Collections.Generic;
using DemoInfo;
using Newtonsoft.Json;

namespace CSGO_Demos_Manager.Models
{
	public enum WeaponType
	{
		Pistol = 1,
		Rifle = 2,
		Sniper = 3,
		SMG = 4,
		Heavy = 5,
		Equipment = 6,
		Grenade = 7,
		Unkown = 8
	}

	public class Weapon
	{
		[JsonProperty("element")]
		public EquipmentElement Element { get; set; }

		[JsonProperty("type")]
		public WeaponType Type { get; set; }

		[JsonProperty("weapon_name")]
		public string Name { get; set; }

		public override bool Equals(object obj)
		{
			var item = (Weapon)obj;

			return item != null && Element == item.Element;
		}

		public override int GetHashCode()
		{
			return 1;
		}

		public static List<Weapon> WeaponList = new List<Weapon>
		{
			new Weapon
			{
				Element = EquipmentElement.AK47,
				Name = "AK-47",
				Type = WeaponType.Rifle
			},
			new Weapon
			{
				Element = EquipmentElement.AUG,
				Name = "AUG",
				Type = WeaponType.Rifle
			},
			new Weapon
			{
				Element = EquipmentElement.AWP,
				Name = "AWP",
				Type = WeaponType.Sniper
			},
			new Weapon
			{
				Element = EquipmentElement.Bizon,
				Name = "PP-Bizon",
				Type = WeaponType.SMG
			},
			new Weapon
			{
				Element = EquipmentElement.Bomb,
				Name = "C4",
				Type = WeaponType.Equipment
			},
			new Weapon
			{
				Element = EquipmentElement.CZ,
				Name = "CZ75-Auto",
				Type = WeaponType.Pistol
			},
			new Weapon
			{
				Element = EquipmentElement.Deagle,
				Name = "Deagle",
				Type = WeaponType.Pistol
			},
			new Weapon
			{
				Element = EquipmentElement.DualBarettas,
				Name = "Dual Barettas",
				Type = WeaponType.Pistol
			},
			new Weapon
			{
				Element = EquipmentElement.Famas,
				Name = "Famas",
				Type = WeaponType.Rifle
			},
			new Weapon
			{
				Element = EquipmentElement.FiveSeven,
				Name = "Five-SeveN",
				Type = WeaponType.Pistol
			},
			new Weapon
			{
				Element = EquipmentElement.G3SG1,
				Name = "G3SG1 (Autonoob)",
				Type = WeaponType.Sniper
			},
			new Weapon
			{
				Element = EquipmentElement.Gallil,
				Name = "Galil AR",
				Type = WeaponType.Rifle
			},
			new Weapon
			{
				Element = EquipmentElement.Glock,
				Name = "Glock-18",
				Type = WeaponType.Pistol
			},
			new Weapon
			{
				Element = EquipmentElement.Knife,
				Name = "Knife",
				Type = WeaponType.Equipment
			},
			new Weapon
			{
				Element = EquipmentElement.M249,
				Name = "M249",
				Type = WeaponType.Heavy
			},
			new Weapon
			{
				Element = EquipmentElement.M4A1,
				Name = "M4A1",
				Type = WeaponType.Rifle
			},
			new Weapon
			{
				Element = EquipmentElement.M4A4,
				Name = "M4A4",
				Type = WeaponType.Rifle
			},
			new Weapon
			{
				Element = EquipmentElement.MP7,
				Name = "MP7",
				Type = WeaponType.SMG
			},
			new Weapon
			{
				Element = EquipmentElement.MP9,
				Name = "MP9",
				Type = WeaponType.SMG
			},
			new Weapon
			{
				Element = EquipmentElement.Mac10,
				Name = "MAC-10",
				Type = WeaponType.SMG
			},
			new Weapon
			{
				Element = EquipmentElement.Negev,
				Name = "Negev"
			},
			new Weapon
			{
				Element = EquipmentElement.Nova,
				Name = "Nova",
				Type = WeaponType.Heavy
			},
			new Weapon
			{
				Element = EquipmentElement.P2000,
				Name = "P2000",
				Type = WeaponType.Pistol
			},
			new Weapon
			{
				Element = EquipmentElement.P250,
				Name = "P250",
				Type = WeaponType.Pistol
			},
			new Weapon
			{
				Element = EquipmentElement.P90,
				Name = "P90",
				Type = WeaponType.SMG
			},
			new Weapon
			{
				Element = EquipmentElement.SG556,
				Name = "SG 553",
				Type = WeaponType.Rifle
			},
			new Weapon
			{
				Element = EquipmentElement.SawedOff,
				Name = "Sawed-Off",
				Type = WeaponType.Heavy
			},
			new Weapon
			{
				Element = EquipmentElement.Scar20,
				Name = "Scar-20 (Autonoob)",
				Type = WeaponType.Sniper
			},
			new Weapon
			{
				Element = EquipmentElement.Scout,
				Name = "SSG 08 (Scout)",
				Type = WeaponType.Sniper
			},
			new Weapon
			{
				Element = EquipmentElement.Swag7,
				Name = "MAG-7",
				Type = WeaponType.Heavy
			},
			new Weapon
			{
				Element = EquipmentElement.Tec9,
				Name = "Tec-9",
				Type = WeaponType.Pistol
			},
			new Weapon
			{
				Element = EquipmentElement.UMP,
				Name = "UMP-45",
				Type = WeaponType.SMG
			},
			new Weapon
			{
				Element = EquipmentElement.USP,
				Name = "USP-S",
				Type = WeaponType.Pistol
			},
			new Weapon
			{
				Element = EquipmentElement.Revolver,
				Name = "R8 Revolver",
				Type = WeaponType.Pistol
			},
			new Weapon
			{
				Element = EquipmentElement.XM1014,
				Name = "XM1014",
				Type = WeaponType.Heavy
			},
			new Weapon
			{
				Element = EquipmentElement.Zeus,
				Name = "Zeus (Tazer)",
				Type = WeaponType.Equipment 
			},
			new Weapon
			{
				Element = EquipmentElement.Flash,
				Name = "Flashbang",
				Type = WeaponType.Grenade
			},
			new Weapon
			{
				Element = EquipmentElement.HE,
				Name = "HE Grenade",
				Type = WeaponType.Grenade
			},
			new Weapon
			{
				Element = EquipmentElement.Decoy,
				Name = "Decoy",
				Type = WeaponType.Grenade
			},
			new Weapon
			{
				Element = EquipmentElement.Smoke,
				Name = "Smoke",
				Type = WeaponType.Grenade
			},
			new Weapon
			{
				Element = EquipmentElement.Molotov,
				Name = "Molotov",
				Type = WeaponType.Grenade
			},
			new Weapon
			{
				Element = EquipmentElement.Incendiary,
				Name = "Incendiary",
				Type = WeaponType.Grenade
			},
			new Weapon
			{
				Element = EquipmentElement.Kevlar,
				Name = "Kevlar",
				Type = WeaponType.Equipment
			},
			new Weapon
			{
				Element = EquipmentElement.Helmet,
				Name = "Helmet",
				Type = WeaponType.Equipment
			},
			new Weapon
			{
				Element = EquipmentElement.DefuseKit,
				Name = "Defuse Kit",
				Type = WeaponType.Equipment
			},
			new Weapon
			{
				Element = EquipmentElement.World,
				Name = "World",
				Type = WeaponType.Unkown
			},
			new Weapon
			{
				Element = EquipmentElement.Unknown,
				Name = "Unknown",
				Type = WeaponType.Unkown
			}
		};
	}
}