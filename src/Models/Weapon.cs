using DemoInfo;
using Newtonsoft.Json;

namespace CSGO_Demos_Manager.Models
{
	public class Weapon
	{
		[JsonProperty("weapon_name")]
		public string Name { get; set; }

		[JsonProperty("weapon_reserve_ammo")]
		public int ReserveAmmo { get; set; }

		[JsonProperty("weapon_ammo_in_magazine")]
		public int AmmoInMagazine { get; set; }

		[JsonIgnore]
		public int KillCount { get; set; }

		[JsonIgnore]
		public int DeathCount { get; set; }

		[JsonIgnore]
		public int TotalDamageHealth { get; set; }

		[JsonIgnore]
		public int TotalDamageArmor { get; set; }

		public override bool Equals(object obj)
		{
			var item = (Weapon)obj;

			return item != null && (Name.Equals(item.Name));
		}

		public override int GetHashCode()
		{
			return base.GetHashCode();
		}

		public Weapon()
		{
		}

		public Weapon(Equipment e)
		{
			switch (e.Weapon)
			{
				case EquipmentElement.AK47:
					Name = "AK-47";
					break;
				case EquipmentElement.AUG:
					Name = "AUG";
					break;
				case EquipmentElement.AWP:
					Name = "AWP";
					break;
				case EquipmentElement.Bizon:
					Name = "PP-Bizon";
					break;
				case EquipmentElement.Bomb:
					Name = "C4";
					break;
				case EquipmentElement.CZ:
					Name = "CZ75-Auto";
					break;
				case EquipmentElement.Deagle:
					Name = "Deagle";
					break;
				case EquipmentElement.DualBarettas:
					Name = "Dual Barettas";
					break;
				case EquipmentElement.Famas:
					Name = "Famas";
					break;
				case EquipmentElement.FiveSeven:
					Name = "Five-SeveN";
					break;
				case EquipmentElement.G3SG1:
					Name = "G3SG1 (Autonoob)";
					break;
				case EquipmentElement.Gallil:
					Name = "Galil AR";
					break;
				case EquipmentElement.Glock:
					Name = "Glock-18";
					break;
				case EquipmentElement.Knife:
					Name = "Knife";
					break;
				case EquipmentElement.M249:
					Name = "M249";
					break;
				case EquipmentElement.M4A1:
					Name = "M4A1";
					break;
				case EquipmentElement.M4A4:
					Name = "M4A4";
					break;
				case EquipmentElement.MP7:
					Name = "MP7";
					break;
				case EquipmentElement.MP9:
					Name = "MP9";
					break;
				case EquipmentElement.Mac10:
					Name = "MAC-10";
					break;
				case EquipmentElement.Negev:
					Name = "Negev";
					break;
				case EquipmentElement.Nova:
					Name = "Nova";
					break;
				case EquipmentElement.P2000:
					Name = "P2000";
					break;
				case EquipmentElement.P250:
					Name = "P250";
					break;
				case EquipmentElement.P90:
					Name = "P90";
					break;
				case EquipmentElement.SG556:
					Name = "SG 553";
					break;
				case EquipmentElement.SawedOff:
					Name = "Sawed-Off";
					break;
				case EquipmentElement.Scar20:
					Name = "Scar-20 (Autonoob)";
					break;
				case EquipmentElement.Scout:
					Name = "SSG 08 (Scout)";
					break;
				case EquipmentElement.Swag7:
					Name = "MAG-7";
					break;
				case EquipmentElement.Tec9:
					Name = "Tec-9";
					break;
				case EquipmentElement.UMP:
					Name = "UMP-45";
					break;
				case EquipmentElement.USP:
					Name = "USP-S";
					break;
				case EquipmentElement.XM1014:
					Name = "XM1014";
					break;
				case EquipmentElement.Zeus:
					Name = "Zeus (Tazer)";
					break;
				case EquipmentElement.Flash:
					Name = "Flashbang";
					break;
				case EquipmentElement.HE:
					Name = "He grenade";
					break;
				case EquipmentElement.Decoy:
					Name = "Decoy";
					break;
				case EquipmentElement.Smoke:
					Name = "Smoke";
					break;
				case EquipmentElement.Molotov:
					Name = "Molotov";
					break;
				case EquipmentElement.Incendiary:
					Name = "Incendiary";
					break;
				case EquipmentElement.Kevlar:
					Name = "Kevlar";
					break;
				case EquipmentElement.Helmet:
					Name = "Helmet";
					break;
				case EquipmentElement.DefuseKit:
					Name = "Defuse Kit";
					break;
				case EquipmentElement.World:
					Name = "World";
					break;
				case EquipmentElement.Unknown:
					Name = "Unknown 2 stronk";
					break;
				default:
					Name = "";
					break;
			}
			ReserveAmmo = e.ReserveAmmo;
			AmmoInMagazine = e.AmmoInMagazine;
		}
	}
}