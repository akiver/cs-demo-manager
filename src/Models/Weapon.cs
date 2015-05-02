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

		public override bool Equals(object obj)
		{
			var item = (Weapon)obj;

			return item != null && (Name.Equals(item.Name));
		}

		public override int GetHashCode()
		{
			return 1;
		}
	}
}