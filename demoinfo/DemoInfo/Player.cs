using DemoInfo.DP;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DemoInfo
{
	public class Player
	{
		public string Name { get; set; }

		public long SteamID { get; set; }

		public Vector Position { get; set; }

		public int EntityID { get; set; }

		public int HP { get; set; }

		public int Armor { get; set; }

		public Vector LastAlivePosition { get; set; }

		public Vector Velocity { get; set; }

		public float ViewDirectionX { get; set; }

		public float ViewDirectionY { get; set; }

		public float FlashDuration { get; set; }

		public int Money { get; set; }

		public int CurrentEquipmentValue { get; set; }

		public int FreezetimeEndEquipmentValue { get; set; }

		public int RoundStartEquipmentValue { get; set; }

		public bool IsDucking { get; set; }

		internal Entity Entity;

		public bool Disconnected { get; set; }

		internal int ActiveWeaponID;

		public Equipment ActiveWeapon
		{
			get
			{
				if (ActiveWeaponID == DemoParser.INDEX_MASK) return null;
				return rawWeapons[ActiveWeaponID];
			}
		}

		internal Dictionary<int, Equipment> rawWeapons = new Dictionary<int, Equipment>();
		public IEnumerable<Equipment> Weapons { get { return rawWeapons.Values; } }

		public bool IsAlive {
			get { return HP > 0; }
		}

		public Team Team { get; set; }

		public bool HasDefuseKit { get; set; }

		public bool HasHelmet { get; set; }

		internal int TeamID;

		internal int[] AmmoLeft = new int[32];

		public AdditionalPlayerInformation AdditionaInformations { get; internal set; }



		public Player()
		{
			Velocity = new Vector();
			LastAlivePosition = new Vector();

		}

		/// <summary>
		/// Copy this instance for multi-threading use. 
		/// </summary>
		public Player Copy()
		{
			Player me = new Player();
			me.EntityID = -1; //this should bot be copied
			me.Entity = null;

			me.Name = Name;
			me.SteamID = SteamID;
			me.HP = HP;
			me.Armor = Armor;

			me.ViewDirectionX = ViewDirectionX;
			me.ViewDirectionY = ViewDirectionY;
			me.Disconnected = Disconnected;
			me.FlashDuration = FlashDuration;

			me.Team = Team;

			me.HasDefuseKit = HasDefuseKit;
			me.HasHelmet = HasHelmet;

			if (Position != null)
				me.Position = Position.Copy(); //Vector is a class, not a struct - thus we need to make it thread-safe. 

			if (LastAlivePosition != null)
				me.LastAlivePosition = LastAlivePosition.Copy();

			if (Velocity != null)
				me.Velocity = Velocity.Copy();

			return me;
		}

	}

	public enum Team
	{
		Spectate = 1,
		Terrorist = 2,
		CounterTerrorist = 3,
	}
}
