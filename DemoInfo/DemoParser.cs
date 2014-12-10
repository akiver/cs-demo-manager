using DemoInfo.DP;
using DemoInfo.DT;
using DemoInfo.Messages;
using DemoInfo.ST;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Diagnostics;

namespace DemoInfo
{
	public class DemoParser
	{
		#region Events

		/// <summary>
		/// Called once when the Header of the demo is parsed
		/// </summary>
		public event EventHandler<HeaderParsedEventArgs> HeaderParsed;

		public event EventHandler<MatchStartedEventArgs> MatchStarted;

		public event EventHandler<RoundStartedEventArgs> RoundStart;

		public event EventHandler<TickDoneEventArgs> TickDone;

		public event EventHandler<PlayerKilledEventArgs> PlayerKilled;

		public event EventHandler<WeaponFiredEventArgs> WeaponFired;

		public event EventHandler<SmokeEventArgs> SmokeNadeStarted;
		public event EventHandler<SmokeEventArgs> SmokeNadeEnded;

		public event EventHandler<DecoyEventArgs> DecoyNadeStarted;
		public event EventHandler<DecoyEventArgs> DecoyNadeEnded;

		public event EventHandler<FireEventArgs> FireNadeStarted;
		public event EventHandler<FireEventArgs> FireNadeEnded;

		public event EventHandler<FlashEventArgs> FlashNadeExploded;
		public event EventHandler<GrenadeEventArgs> ExplosiveNadeExploded;

		public event EventHandler<NadeEventArgs> NadeReachedTarget;

		public event EventHandler<BombEventArgs> BombBeginPlant;
		public event EventHandler<BombEventArgs> BombAbortPlant;
		public event EventHandler<BombEventArgs> BombPlanted;
		public event EventHandler<BombEventArgs> BombDefused;
		public event EventHandler<BombEventArgs> BombExploded;
		public event EventHandler<BombDefuseEventArgs> BombBeginDefuse;
		public event EventHandler<BombDefuseEventArgs> BombAbortDefuse;

		#endregion

		#region Information

		public string Map {
			get { return Header.MapName; }
		}

		#endregion

		BinaryReader reader;

		public DemoHeader Header { get; private set; }

		internal DataTableParser DataTables = new DataTableParser();
		StringTableParser StringTables = new StringTableParser();

		internal Dictionary<ServerClass, EquipmentElement> equipmentMapping = new Dictionary<ServerClass, EquipmentElement>();

		public Dictionary<int, Player> Players = new Dictionary<int, Player>();

		internal Dictionary<int, Entity> entities = new Dictionary<int, Entity>();

		public List<PlayerInfo> RawPlayers = new List<PlayerInfo>();

		public List<CSVCMsg_CreateStringTable> stringTables = new List<CSVCMsg_CreateStringTable>();

		/// <summary>
		/// Gets or sets a value indicating whether this <see cref="DemoInfo.DemoParser"/> will attribute weapons to the players.
		/// Default: false
		/// Note: Enableing this might decrease performance in the current implementation. Will be removed once the code is optimized. 
		/// </summary>
		/// <value><c>true</c> to attribute weapons; otherwise, <c>false</c>.</value>
		public bool ShallAttributeWeapons { get; set; }

		Entity ctTeamEntity, tTeamEntity;

		internal int bombSiteAEntityIndex = -1;
		internal int bombSiteBEntityIndex = -1;

		public int CTScore {
			get {
				return (int)ctTeamEntity.Properties.GetValueOrDefault("m_scoreTotal", 0);
			}
		}

		public int TScore {
			get {
				return (int)tTeamEntity.Properties.GetValueOrDefault("m_scoreTotal", 0);
			}
		}

		#region Context for GameEventHandler

		internal Dictionary<int, CSVCMsg_GameEventList.descriptor_t> GEH_Descriptors = null;
		internal List<Player> GEH_BlindPlayers = new List<Player>();

		#endregion

		internal Dictionary<int, byte[]> instanceBaseline = new Dictionary<int, byte[]>();

		public float TickRate {
			get { return this.Header.PlaybackFrames / this.Header.PlaybackTime; }
		}

		public float TickTime {
			get { return this.Header.PlaybackTime / this.Header.PlaybackFrames; }
		}

		[Obsolete("This was a typo. Please use the CurrentTick-Property (2 \"r\"s instead of 3) from now on. This will be removed soon.")]
		public int CurrrentTick { 
			get {
				return CurrentTick;
			}
		}

		public int CurrentTick { get; private set; }

		public float CurrentTime { get { return CurrentTick * TickTime; } }


		public DemoParser(Stream input)
		{
			reader = new BinaryReader(input);
		}

		public void ParseDemo(bool fullParse)
		{
			ParseHeader();

			if (HeaderParsed != null)
				HeaderParsed(this, new HeaderParsedEventArgs(Header));

			if (fullParse) {
				while (ParseNextTick()) {
				}
			}
		}

		public bool ParseNextTick()
		{
			bool b = ParseTick();

			if (this.ctTeamEntity == null) {
				this.ctTeamEntity = entities.Values.SingleOrDefault(
					a => a.ServerClass.DTName == "DT_CSTeam" &&
					(string)a.Properties["m_szTeamname"] == "CT"
				);
			}
			if (this.tTeamEntity == null) {
				this.tTeamEntity = entities.Values.SingleOrDefault(a => 
					a.ServerClass.DTName == "DT_CSTeam" &&
				(string)a.Properties["m_szTeamname"] == "TERRORIST"
				);
			}
			
			for (int i = 0; i < RawPlayers.Count; i++) {
				var rawPlayer = RawPlayers[i];

				int id = rawPlayer.UserID;
				if (!entities.ContainsKey(i + 1))
					continue;

				Entity entity = entities[i + 1];

				if (entity.Properties.ContainsKey("cslocaldata.m_vecOrigin")) {
					if (!Players.ContainsKey(id))
						Players[id] = new Player();

					Player p = Players[id];
					p.EntityID = entity.ID;
					p.Entity = entity;

					p.EntityID = entity.ID;
					p.Position = (Vector)entity.Properties["cslocaldata.m_vecOrigin"];
					p.Position.Z = (float)entity.Properties.GetValueOrDefault("cslocaldata.m_vecOrigin[2]", 0);


					if ((int)entity.Properties["m_iTeamNum"] == (int)ctTeamEntity.Properties["m_iTeamNum"])
						p.Team = Team.CounterTerrorist;
					else if ((int)entity.Properties["m_iTeamNum"] == (int)tTeamEntity.Properties["m_iTeamNum"])
						p.Team = Team.Terrorist;
					else
						p.Team = Team.Spectate;

					if (p.Team != Team.Spectate) {
						p.HP = (int)entity.Properties.GetValueOrDefault("m_iHealth", -1);
						p.Armor = (int)entity.Properties.GetValueOrDefault("m_ArmorValue", -1);
						p.HasDefuseKit = ((int)entity.Properties.GetValueOrDefault("m_bHasDefuser", 0)) == 1;
						p.HasHelmet = ((int)entity.Properties.GetValueOrDefault("m_bHasHelmet", 0)) == 1;
					} else {
						p.HP = -1;
						p.Armor = -1;
					}

					p.Name = rawPlayer.Name;
					p.SteamID = rawPlayer.XUID;

					p.Velocity.X = (float)entity.Properties.GetValueOrDefault<string, object>("localdata.m_vecVelocity[0]", 0f);
					p.Velocity.Y = (float)entity.Properties.GetValueOrDefault<string, object>("localdata.m_vecVelocity[1]", 0f);
					p.Velocity.Z = (float)entity.Properties.GetValueOrDefault<string, object>("localdata.m_vecVelocity[2]", 0f);

					p.Money = (int)entity.Properties.GetValueOrDefault<string, object>("m_iAccount", 0);

					p.ViewDirectionX = (float)entity.Properties.GetValueOrDefault("m_angEyeAngles[1]", 0);

					p.ViewDirectionY = (float)entity.Properties.GetValueOrDefault("m_angEyeAngles[0]", 0);

					if (p.IsAlive) {
						p.LastAlivePosition = p.Position;
					}
				}

			}

			if(ShallAttributeWeapons)
				AttributeWeapons();

			if (b) {
				if (TickDone != null)
					TickDone(this, new TickDoneEventArgs());
			}

			return b;
		}

		private void ParseHeader()
		{
			var header = DemoHeader.ParseFrom(reader);

			if (header.Filestamp != "HL2DEMO")
				throw new Exception("Invalid File-Type - expecting HL2DEMO");

			if (header.Protocol != 4)
				throw new Exception("Invalid Demo-Protocol");

			Header = header;
		}

		private bool ParseTick()
		{
			DemoCommand command = (DemoCommand)reader.ReadByte();

			reader.ReadInt32(); // tick number
			reader.ReadByte(); // player slot

			this.CurrentTick++; // = TickNum;

			switch (command) {
			case DemoCommand.Synctick:
				break;
			case DemoCommand.Stop:
				return false;
			case DemoCommand.ConsoleCommand:
				using (var volvo = reader.ReadVolvoPacket())
					;
				break;
			case DemoCommand.DataTables:
				using (var volvo = reader.ReadVolvoPacket())
					DataTables.ParsePacket(volvo);

				for(int i = 0; i < DataTables.ServerClasses.Count; i++)
				{
					var sc = DataTables.ServerClasses[i];
					if (sc.DTName.StartsWith("DT_Weapon")) {
						var s = sc.DTName.Substring(9).ToLower();
						equipmentMapping.Add(sc, Equipment.MapEquipment(s));
					} else if (sc.DTName == "DT_Flashbang") {
						equipmentMapping.Add(sc, EquipmentElement.Flash);
					} else if (sc.DTName == "DT_SmokeGrenade") {
						equipmentMapping.Add(sc, EquipmentElement.Smoke);
					} else if (sc.DTName == "DT_HEGrenade") {
						equipmentMapping.Add(sc, EquipmentElement.HE);
					} else if (sc.DTName == "DT_DecoyGrenade") {
						equipmentMapping.Add(sc, EquipmentElement.Decoy);
					} else if (sc.DTName == "DT_IncendiaryGrenade") {
						equipmentMapping.Add(sc, EquipmentElement.Incendiary);
					} else if (sc.DTName == "DT_MolotovGrenade") {
						equipmentMapping.Add(sc, EquipmentElement.Molotov);
					}
				}

				break;
			case DemoCommand.StringTables:
				using (var volvo = reader.ReadVolvoPacket())
					StringTables.ParsePacket(volvo, this);
				break;
			case DemoCommand.UserCommand:
				reader.ReadInt32();
				using (var volvo = reader.ReadVolvoPacket())
					;
				break;
			case DemoCommand.Signon:
			case DemoCommand.Packet:
				ParseDemoPacket();
				break;
			default:
				throw new Exception("Can't handle Demo-Command " + command);
			}

			return true;
		}

		private void ParseDemoPacket()
		{
			CommandInfo.Parse(reader);
			reader.ReadInt32(); // SeqNrIn
			reader.ReadInt32(); // SeqNrOut

			using (var volvo = reader.ReadVolvoPacket())
				DemoPacketParser.ParsePacket(volvo, this);
		}

		const int MAX_EDICT_BITS = 11;
		internal const int INDEX_MASK = ( ( 1 << MAX_EDICT_BITS ) - 1 );
		private void AttributeWeapons()
		{
			foreach (var player in Players.Values) {

				if (player.Team == Team.Spectate)
					continue;

				string weaponPrefix = "m_hMyWeapons.";

				if(!player.Entity.Properties.ContainsKey("m_hMyWeapons.000"))
					weaponPrefix = "bcc_nonlocaldata.m_hMyWeapons.";

				for (int i = 0; i < 64; i++) {

					int index = (int)player.Entity.Properties[weaponPrefix + i.ToString().PadLeft(3, '0')] & INDEX_MASK;

					if (index != INDEX_MASK) {
						var entity = (Entity)entities[index];

						if (!player.rawWeapons.ContainsKey(index)) {
							Equipment e = new Equipment();
							e.Weapon = equipmentMapping[entity.ServerClass];

							if(e.Weapon == EquipmentElement.Unknown)
								throw new Exception("This weapon is unknown: " + entity.ServerClass.DTName);

							player.rawWeapons.Add(index, e);
						}

						player.rawWeapons[index].lastUpdate = CurrentTick;
					}
				}

				player.ActiveWeaponID = (int)player.Entity.Properties["m_hActiveWeapon"] & INDEX_MASK;

				IEnumerable<int> deletedWeapons = player.rawWeapons
					.Where(a => a.Value.lastUpdate != CurrentTick)
					.Select(a => a.Key)
					.ToList();

				foreach (var weapon in deletedWeapons)
					player.rawWeapons.Remove(weapon);
			}
		}

		#region EventCaller

		internal void RaiseMatchStarted()
		{
			if (MatchStarted != null)
				MatchStarted(this, new MatchStartedEventArgs());
		}

		public void RaiseRoundStart()
		{
			if (RoundStart != null)
				RoundStart(this, new RoundStartedEventArgs());

		}

		internal void RaisePlayerKilled(PlayerKilledEventArgs kill)
		{
			if (PlayerKilled != null)
				PlayerKilled(this, kill);
		}

		internal void RaiseWeaponFired(WeaponFiredEventArgs fire)
		{
			if (WeaponFired != null)
				WeaponFired(this, fire);
		}


		internal void RaiseSmokeStart(SmokeEventArgs args)
		{
			if (SmokeNadeStarted != null)
				SmokeNadeStarted(this, args);

			if (NadeReachedTarget != null)
				NadeReachedTarget(this, args);
		}

		internal void RaiseSmokeEnd(SmokeEventArgs args)
		{
			if (SmokeNadeEnded != null)
				SmokeNadeEnded(this, args);

			if (NadeReachedTarget != null)
				NadeReachedTarget(this, args);
		}

		internal void RaiseDecoyStart(DecoyEventArgs args)
		{
			if (DecoyNadeStarted != null)
				DecoyNadeStarted(this, args);

			if (NadeReachedTarget != null)
				NadeReachedTarget(this, args);
		}

		internal void RaiseDecoyEnd(DecoyEventArgs args)
		{
			if (DecoyNadeEnded != null)
				DecoyNadeEnded(this, args);

			if (NadeReachedTarget != null)
				NadeReachedTarget(this, args);
		}

		internal void RaiseFireStart(FireEventArgs args)
		{
			if (FireNadeStarted != null)
				FireNadeStarted(this, args);

			if (NadeReachedTarget != null)
				NadeReachedTarget(this, args);
		}

		internal void RaiseFireEnd(FireEventArgs args)
		{
			if (FireNadeEnded != null)
				FireNadeEnded(this, args);

			if (NadeReachedTarget != null)
				NadeReachedTarget(this, args);
		}

		internal void RaiseFlashExploded(FlashEventArgs args)
		{
			if (FlashNadeExploded != null)
				FlashNadeExploded(this, args);

			if (NadeReachedTarget != null)
				NadeReachedTarget(this, args);
		}

		internal void RaiseGrenadeExploded(GrenadeEventArgs args)
		{
			if (ExplosiveNadeExploded != null)
				ExplosiveNadeExploded(this, args);

			if (NadeReachedTarget != null)
				NadeReachedTarget(this, args);
		}

		internal void RaiseBombBeginPlant(BombEventArgs args)
		{
			if (BombBeginPlant != null)
				BombBeginPlant(this, args);
		}

		internal void RaiseBombAbortPlant(BombEventArgs args)
		{
			if (BombAbortPlant != null)
				BombAbortPlant(this, args);
		}

		internal void RaiseBombPlanted(BombEventArgs args)
		{
			if (BombPlanted != null)
				BombPlanted(this, args);
		}

		internal void RaiseBombDefused(BombEventArgs args)
		{
			if (BombDefused != null)
				BombDefused(this, args);
		}

		internal void RaiseBombExploded(BombEventArgs args)
		{
			if (BombExploded != null)
				BombExploded(this, args);
		}

		internal void RaiseBombBeginDefuse(BombDefuseEventArgs args)
		{
			if (BombBeginDefuse != null)
				BombBeginDefuse(this, args);
		}

		internal void RaiseBombAbortDefuse(BombDefuseEventArgs args)
		{
			if (BombAbortDefuse != null)
				BombAbortDefuse(this, args);
		}

		#endregion
	}
}
