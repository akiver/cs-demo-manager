using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Diagnostics;

namespace DemoInfo
{
	public class HeaderParsedEventArgs : EventArgs
	{
		public DemoHeader Header { get; private set; }

		public HeaderParsedEventArgs(DemoHeader header)
		{
			this.Header = header;
		}
	}

	public class TickDoneEventArgs : EventArgs
	{
	}

	public class MatchStartedEventArgs : EventArgs
	{
	}

	public class RoundAnnounceMatchStartedEventArgs : EventArgs
	{
	}

	public class RoundEndedEventArgs : EventArgs
	{
		public RoundEndReason Reason { get; set; }

		public string Message { get; set; }

		/// <summary>
		/// The winning team. Spectate for everything that isn't CT or T. 
		/// </summary>
		public Team Winner;

	}

	public class RoundOfficiallyEndedEventArgs : EventArgs
	{
	}

	public class RoundMVPEventArgs : EventArgs
	{
		public Player Player { get; set; }

		public RoundMVPReason Reason  { get; set; }
	}

	public class RoundStartedEventArgs : EventArgs
	{
		public int TimeLimit  { get; set; }
		public int FragLimit  { get; set; }
		public string Objective { get; set; }
	}

	public class WinPanelMatchEventArgs : EventArgs
	{
	}

	public class RoundFinalEventArgs : EventArgs
	{
	}

	public class LastRoundHalfEventArgs : EventArgs
	{
	}

	public class FreezetimeEndedEventArgs : EventArgs
	{
	}

	public class PlayerTeamEventArgs : EventArgs
	{
		public Player Swapped { get; internal set; }

		public Team NewTeam { get; internal set; }

		public Team OldTeam { get; internal set; }

		public bool Silent { get; internal set; }

		public bool IsBot { get; internal set; }
	}

	public class PlayerKilledEventArgs : EventArgs
	{
		public Equipment Weapon { get; internal set; }

		[Obsolete("Use \"Victim\" instead. This will be removed soon™", false)]
		public Player DeathPerson { get { return Victim; } }

		public Player Victim { get; internal set; }

		public Player Killer { get; internal set; }

		public Player Assister { get; internal set; }

		public int PenetratedObjects { get; internal set; }

		public bool Headshot { get; internal set; }
	}

	public class BotTakeOverEventArgs : EventArgs
	{
		public Player Taker { get; internal set; }
	}

	public class WeaponFiredEventArgs : EventArgs
	{
		public Equipment Weapon { get; internal set; }

		public Player Shooter { get; internal set; }
	}

	public class NadeEventArgs : EventArgs
	{
		public Vector Position { get; internal set; }
		public EquipmentElement NadeType { get; internal set; }
		public Player ThrownBy { get; internal set; }

		internal NadeEventArgs ()
		{
		
		}

		internal NadeEventArgs (EquipmentElement type)
		{
			this.NadeType = type;
		}
	}

	public class FireEventArgs : NadeEventArgs
	{
		public FireEventArgs () : base(EquipmentElement.Incendiary)
		{
			
		}
	}
	public class SmokeEventArgs : NadeEventArgs
	{
		public SmokeEventArgs () : base(EquipmentElement.Smoke)
		{
			
		}
	}
	public class DecoyEventArgs : NadeEventArgs
	{
		public DecoyEventArgs () : base(EquipmentElement.Decoy)
		{
			
		}
	}
	public class FlashEventArgs : NadeEventArgs
	{
		public Player[] FlashedPlayers { get; internal set; }

		public FlashEventArgs () : base(EquipmentElement.Flash)
		{

		}
	}
	public class GrenadeEventArgs : NadeEventArgs
	{
		public GrenadeEventArgs () : base(EquipmentElement.HE)
		{
			
		}
	}

	public class BombEventArgs : EventArgs
	{
		public Player Player { get; set; }

		public char Site { get; set; }
	}

	public class BombDefuseEventArgs : EventArgs
	{
		public Player Player { get; set; }

		public bool HasKit { get; set; }
	}

	public class PlayerHurtEventArgs : EventArgs
	{
		/// <summary>
		/// The hurt player
		/// </summary>
		public Player Player { get; set; }

		/// <summary>
		/// The attacking player
		/// </summary>
		public Player Attacker { get; set; }

		/// <summary>
		/// Remaining health points of the player
		/// </summary>
		public int Health { get; set; }

		/// <summary>
		/// Remaining armor points of the player
		/// </summary>
		public int Armor { get; set; }

		/// <summary>
		/// The Weapon used to attack. 
		/// Note: This might be not the same as the raw event
		/// we replace "hpk2000" with "usp-s" if the attacker
		/// is currently holding it - this value is originally
		/// networked "wrong". By using this property you always
		/// get the "right" weapon
		/// </summary>
		/// <value>The weapon.</value>
		public Equipment Weapon { get; set; }

		/// <summary>
		/// The original "weapon"-value from the event. 
		/// Might be wrong for USP, CZ and M4A1-S
		/// </summary>
		/// <value>The weapon string.</value>
		public string WeaponString { get; set; }

		/// <summary>
		/// The damage done to the players health
		/// </summary>
		public int HealthDamage { get; set; }

		/// <summary>
		/// The damage done to the players armor
		/// </summary>
		public int ArmorDamage { get; set; }

		/// <summary>
		/// Where the Player was hit. 
		/// </summary>
		/// <value>The hitgroup.</value>
		public Hitgroup Hitgroup { get; set; }
	}

	public class PlayerBindEventArgs : EventArgs
	{
		public Player Player {get; set; }
	}

	public class PlayerDisconnectEventArgs : EventArgs
	{
		public Player Player {get; set; }
	}

	/// <summary>
	/// Occurs when the server use the "say" command
	/// I don't know the purpose of IsChat and IsChatAll because they are everytime false
	/// </summary>
	public class SayTextEventArgs : EventArgs
	{
		/// <summary>
		/// Should be everytime 0 as it's a message from the server
		/// </summary>
		public int EntityIndex { get; set; }

		/// <summary>
		/// Message sent by the server
		/// </summary>
		public string Text { get; set; }

		/// <summary>
		/// Everytime false as the message is public
		/// </summary>
		public bool IsChat { get; set; }

		/// <summary>
		/// Everytime false as the message is public
		/// </summary>
		public bool IsChatAll { get; set; }
	}

	/// <summary>
	/// Occurs when a player use the say command
	/// Not sure about IsChat and IsChatAll, GOTV doesn't record chat team so this 2 bool are every time true
	/// </summary>
	public class SayText2EventArgs : EventArgs
	{
		/// <summary>
 		/// The player who sent the message
 		/// </summary>
		public Player Sender { get; set; }

		/// <summary>
		/// The message sent
		/// </summary>
		public string Text { get; set; }

		/// <summary>
		/// Not sure about it, maybe it's to indicate say_team or say
		/// </summary>
		public bool IsChat { get; set; }

		/// <summary>
		/// true if the message is for all players ?
		/// </summary>
		public bool IsChatAll { get; set; }
	}

	/// <summary>
	/// Occurs when the server display a player rank
	/// It occurs only with Valve demos, at the end of a Matchmaking.
	/// So for a 5v5 match there will be 10 events trigerred
	/// </summary>
	public class RankUpdateEventArgs : EventArgs
	{
		/// <summary>
		/// Player's SteamID64
		/// </summary>
		public long SteamId { get; set; }

		/// <summary>
		/// Player's rank at the beginning of the match
		/// </summary>
		public int RankOld { get; set; }

		/// <summary>
		/// Player's rank the end of the match
		/// </summary>
		public int RankNew { get; set; }

		/// <summary>
		/// Number of win that the player have
		/// </summary>
		public int WinCount { get; set; }

		/// <summary>
		/// Number of rank the player win / lost between the beggining and the end of the match
		/// </summary>
		public float RankChange { get; set; }
	}

	public class Equipment
	{
		internal int EntityID { get; set; }

		public EquipmentElement Weapon { get; set; }
		public EquipmentClass Class {
			get
			{
				return (EquipmentClass)(((int)Weapon / 100) + 1);
			}
		}

		public string OriginalString { get; set; }

		public string SkinID { get; set; }

		public int AmmoInMagazine { get; set; }

		internal int AmmoType { get; set; }

		public Player Owner { get; set; }

		public int ReserveAmmo {
			get {
				return (Owner != null && AmmoType != -1) ? Owner.AmmoLeft [AmmoType] : -1;
			}
		}

		internal Equipment ()
		{
			this.Weapon = EquipmentElement.Unknown;
		}

		internal Equipment (string originalString)
		{
			OriginalString = originalString;

			this.Weapon = MapEquipment (originalString);

		}

		internal Equipment (string originalString, string skin)
		{
			OriginalString = originalString;

			this.Weapon = MapEquipment (originalString);

			SkinID = skin;
		}

		const string WEAPON_PREFIX = "weapon_";

		public static EquipmentElement MapEquipment(string OriginalString)
		{
			EquipmentElement weapon = EquipmentElement.Unknown;

			OriginalString = OriginalString.StartsWith(WEAPON_PREFIX)
				? OriginalString.Substring(WEAPON_PREFIX.Length)
				: OriginalString;

			if (OriginalString.Contains ("knife") || OriginalString == "bayonet") {
				weapon = EquipmentElement.Knife;
			}

			if (weapon == EquipmentElement.Unknown) {
				switch (OriginalString) {
				case "ak47":
					weapon = EquipmentElement.AK47;
					break;
				case "aug":
					weapon = EquipmentElement.AUG;
					break;
				case "awp":
					weapon = EquipmentElement.AWP;
					break;
				case "bizon":
					weapon = EquipmentElement.Bizon;
					break;
				case "c4":
					weapon = EquipmentElement.Bomb;
					break;
				case "deagle":
					weapon = EquipmentElement.Deagle;
					break;
				case "decoy":
				case "decoygrenade":
					weapon = EquipmentElement.Decoy;
					break;
				case "elite":
					weapon = EquipmentElement.DualBarettas;
					break;
				case "famas":
					weapon = EquipmentElement.Famas;
					break;
				case "fiveseven":
					weapon = EquipmentElement.FiveSeven;
					break;
				case "flashbang":
					weapon = EquipmentElement.Flash;
					break;
				case "g3sg1":
					weapon = EquipmentElement.G3SG1;
					break;
				case "galil":
				case "galilar":
					weapon = EquipmentElement.Gallil;
					break;
				case "glock":
					weapon = EquipmentElement.Glock;
					break;
				case "hegrenade":
					weapon = EquipmentElement.HE;
					break;
				case "hkp2000":
					weapon = EquipmentElement.P2000;
					break;
				case "incgrenade":
				case "incendiarygrenade":
					weapon = EquipmentElement.Incendiary;
					break;
				case "m249":
					weapon = EquipmentElement.M249;
					break;
				case "m4a1":
					weapon = EquipmentElement.M4A4;
					break;
				case "mac10":
					weapon = EquipmentElement.Mac10;
					break;
				case "mag7":
					weapon = EquipmentElement.Swag7;
					break;
				case "molotov":
				case "molotovgrenade":
				case "molotov_projectile":
					weapon = EquipmentElement.Molotov;
					break;
				case "mp7":
					weapon = EquipmentElement.MP7;
					break;
				case "mp9":
					weapon = EquipmentElement.MP9;
					break;
				case "negev":
					weapon = EquipmentElement.Negev;
					break;
				case "nova":
					weapon = EquipmentElement.Nova;
					break;
				case "p250":
					weapon = EquipmentElement.P250;
					break;
				case "p90":
					weapon = EquipmentElement.P90;
					break;
				case "sawedoff":
					weapon = EquipmentElement.SawedOff;
					break;
				case "scar20":
					weapon = EquipmentElement.Scar20;
					break;
				case "sg556":
					weapon = EquipmentElement.SG556;
					break;
				case "smokegrenade":
					weapon = EquipmentElement.Smoke;
					break;
				case "ssg08":
					weapon = EquipmentElement.Scout;
					break;
				case "taser":
					weapon = EquipmentElement.Zeus;
					break;
				case "tec9":
					weapon = EquipmentElement.Tec9;
					break;
				case "ump45":
					weapon = EquipmentElement.UMP;
					break;
				case "xm1014":
					weapon = EquipmentElement.XM1014;
					break;
				case "m4a1_silencer":
				case "m4a1_silencer_off":
					weapon = EquipmentElement.M4A1;
					break;
				case "cz75a":
					weapon = EquipmentElement.CZ;
					break;
				case "usp":
				case "usp_silencer":
				case "usp_silencer_off":
					weapon = EquipmentElement.USP;
					break;
				case "world":
					weapon = EquipmentElement.World;
					break;
				case "inferno":
					weapon = EquipmentElement.Incendiary;
					break;
				case "revolver":
					weapon = EquipmentElement.Revolver;
					break;
				case "scar17"://These crash the game when given via give weapon_[mp5navy|...], and cannot be purchased ingame.
				case "sg550"://yet the server-classes are networked, so I need to resolve them. 
				case "mp5navy": 
				case "p228":
				case "scout":
				case "sg552":
				case "tmp":
					weapon = EquipmentElement.Unknown;
					break;
				default:
					Trace.WriteLine("Unknown weapon. " + OriginalString, "Equipment.MapEquipment()");
					break;
				}
			}

			return weapon;
		}
	}

	public enum EquipmentElement
	{
		Unknown = 0,

		//Pistoles
		P2000 = 1,
		Glock = 2,
		P250 = 3,
		Deagle = 4,
		FiveSeven = 5,
		DualBarettas = 6,
		Tec9 = 7,
		CZ = 8,
		USP = 9,
		Revolver = 10,

		//SMGs
		MP7 = 101,
		MP9 = 102,
		Bizon = 103,
		Mac10 = 104,
		UMP = 105,
		P90 = 106,

		//Heavy
		SawedOff = 201,
		Nova = 202,
		Swag7 = 203,
		XM1014 = 204,
		M249 = 205,
		Negev = 206,

		//Rifle
		Gallil = 301,
		Famas = 302,
		AK47 = 303,
		M4A4 = 304,
		M4A1 = 305,
		Scout = 306,
		SG556 = 307,
		AUG = 308,
		AWP = 309,
		Scar20 = 310,
		G3SG1 = 311,

		//Equipment
		Zeus = 401,
		Kevlar = 402,
		Helmet = 403,
		Bomb = 404,
		Knife = 405,
		DefuseKit = 406,
		World = 407,

		//Grenades
		Decoy = 501,
		Molotov = 502,
		Incendiary = 503,
		Flash = 504,
		Smoke = 505,
		HE = 506
	}

	public enum EquipmentClass
	{
		Unknown = 0,
		Pistol = 1,
		SMG = 2,
		Heavy = 3,
		Rifle = 4,
		Equipment = 5,
		Grenade = 6,

	}
}

