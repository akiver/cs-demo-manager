using System.Collections.Generic;
using DemoInfo;
using Newtonsoft.Json;

namespace CSGO_Demos_Manager.Models
{
	public class Weapon
	{
		[JsonIgnore]
		public EquipmentElement Element { get; set; }

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
				Name = "AK-47"
			},
			new Weapon
			{
				Element = EquipmentElement.AUG,
				Name = "AUG"
			},
			new Weapon
			{
				Element = EquipmentElement.AWP,
				Name = "AWP"
			},
			new Weapon
			{
				Element = EquipmentElement.Bizon,
				Name = "PP-Bizon"
			},
			new Weapon
			{
				Element = EquipmentElement.Bomb,
				Name = "C4"
			},
			new Weapon
			{
				Element = EquipmentElement.CZ,
				Name = "CZ75-Auto"
			},
			new Weapon
			{
				Element = EquipmentElement.Deagle,
				Name = "Deagle"
			},
			new Weapon
			{
				Element = EquipmentElement.DualBarettas,
				Name = "Dual Barettas"
			},
			new Weapon
			{
				Element = EquipmentElement.Famas,
				Name = "Famas"
			},
			new Weapon
			{
				Element = EquipmentElement.FiveSeven,
				Name = "Five-SeveN"
			},
			new Weapon
			{
				Element = EquipmentElement.G3SG1,
				Name = "G3SG1 (Autonoob)"
			},
			new Weapon
			{
				Element = EquipmentElement.Gallil,
				Name = "Galil AR"
			},
			new Weapon
			{
				Element = EquipmentElement.Glock,
				Name = "Glock-18"
			},
			new Weapon
			{
				Element = EquipmentElement.Knife,
				Name = "Knife"
			},
			new Weapon
			{
				Element = EquipmentElement.M249,
				Name = "M249"
			},
			new Weapon
			{
				Element = EquipmentElement.M4A1,
				Name = "M4A1"
			},
			new Weapon
			{
				Element = EquipmentElement.M4A4,
				Name = "M4A4"
			},
			new Weapon
			{
				Element = EquipmentElement.MP7,
				Name = "MP7"
			},
			new Weapon
			{
				Element = EquipmentElement.MP9,
				Name = "MP9"
			},
			new Weapon
			{
				Element = EquipmentElement.Mac10,
				Name = "MAC-10"
			},
			new Weapon
			{
				Element = EquipmentElement.Negev,
				Name = "Negev"
			},
			new Weapon
			{
				Element = EquipmentElement.Nova,
				Name = "Nova"
			},
			new Weapon
			{
				Element = EquipmentElement.P2000,
				Name = "P2000"
			},
			new Weapon
			{
				Element = EquipmentElement.P250,
				Name = "P250"
			},
			new Weapon
			{
				Element = EquipmentElement.P90,
				Name = "P90"
			},
			new Weapon
			{
				Element = EquipmentElement.SG556,
				Name = "SG 553"
			},
			new Weapon
			{
				Element = EquipmentElement.SawedOff,
				Name = "Sawed-Off"
			},
			new Weapon
			{
				Element = EquipmentElement.Scar20,
				Name = "Scar-20 (Autonoob)"
			},
			new Weapon
			{
				Element = EquipmentElement.Scout,
				Name = "SSG 08 (Scout)"
			},
			new Weapon
			{
				Element = EquipmentElement.Swag7,
				Name = "MAG-7"
			},
			new Weapon
			{
				Element = EquipmentElement.Tec9,
				Name = "Tec-9"
			},
			new Weapon
			{
				Element = EquipmentElement.UMP,
				Name = "UMP-45"
			},
			new Weapon
			{
				Element = EquipmentElement.USP,
				Name = "USP-S"
			},
			new Weapon
			{
				Element = EquipmentElement.XM1014,
				Name = "XM1014"
			},
			new Weapon
			{
				Element = EquipmentElement.Zeus,
				Name = "Zeus (Tazer)"
			},
			new Weapon
			{
				Element = EquipmentElement.Flash,
				Name = "Flashbang"
			},
			new Weapon
			{
				Element = EquipmentElement.HE,
				Name = "HE Grenade"
			},
			new Weapon
			{
				Element = EquipmentElement.Decoy,
				Name = "Decoy"
			},
			new Weapon
			{
				Element = EquipmentElement.Smoke,
				Name = "Smoke"
			},
			new Weapon
			{
				Element = EquipmentElement.Molotov,
				Name = "Molotov"
			},
			new Weapon
			{
				Element = EquipmentElement.Incendiary,
				Name = "Incendiary"
			},
			new Weapon
			{
				Element = EquipmentElement.Kevlar,
				Name = "Kevlar"
			},
			new Weapon
			{
				Element = EquipmentElement.Helmet,
				Name = "Helmet"
			},
			new Weapon
			{
				Element = EquipmentElement.DefuseKit,
				Name = "Defuse Kit"
			},
			new Weapon
			{
				Element = EquipmentElement.World,
				Name = "World"
			},
			new Weapon
			{
				Element = EquipmentElement.Unknown,
				Name = "Unknown"
			}
		};
	}
}