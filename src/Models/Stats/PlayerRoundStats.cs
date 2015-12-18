namespace CSGO_Demos_Manager.Models.Stats
{
	/// <summary>
	/// Contains some stats about each player at a specific round
	/// </summary>
	public class PlayerRoundStats
	{
		public string Name { get; set; }

		public int ShotCount { get; set; }

		public int HitCount { get; set; }

		public int DamageHealthCount { get; set; }

		public int DamageArmorCount { get; set; }

		public int KillCount { get; set; }

		public int JumpKillCount { get; set; }

		public int StartMoneyValue { get; set; }

		public int EquipementValue { get; set; }
	}
}
