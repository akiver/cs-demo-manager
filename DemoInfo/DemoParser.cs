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
		#endregion

		#region Information
		public string Map
		{
			get { return Header.MapName; }
		}

		#endregion

		BinaryReader reader;
		public DemoHeader Header { get; private set; }

		internal DataTableParser DataTables = new DataTableParser();
		StringTableParser StringTables = new StringTableParser();

		public Dictionary<int, Player> Players = new Dictionary<int, Player>();

		internal Dictionary<int, Entity> entities = new Dictionary<int, Entity>();

		public List<PlayerInfo> RawPlayers = new List<PlayerInfo>();

		public List<CSVCMsg_CreateStringTable> stringTables = new List<CSVCMsg_CreateStringTable>();

		Entity ctTeamEntity, tTeamEntity;

		#region Context for GameEventHandler
		internal Dictionary<int, CSVCMsg_GameEventList.descriptor_t> GEH_Descriptors = null;
		internal List<Player> GEH_BlindPlayers = new List<Player>();
		#endregion

		internal Dictionary<int, byte[]> instanceBaseline = new Dictionary<int, byte[]>();

		public float TickRate
		{
			get { return this.Header.PlaybackFrames / this.Header.PlaybackTime; }
		}

		public float TickTime
		{
			get { return this.Header.PlaybackTime / this.Header.PlaybackFrames; }
		}

		public int CurrrentTick { get; private set; }
		public float CurrentTime { get  { return CurrrentTick * TickTime; } }


		public DemoParser(Stream input)
		{
			reader = new BinaryReader(input);
		}

		public void ParseDemo(bool fullParse)
		{
			ParseHeader();

			if (HeaderParsed != null)
				HeaderParsed(this, new HeaderParsedEventArgs(Header));

			if (fullParse)
			{
				while (ParseNextTick())
				{
				}
			}

		}

		List<string> types = new List<string>();

		public bool ParseNextTick()
		{
			bool b = ParseTick();

			foreach (var type in entities.Values.Where(a => !types.Contains(a.ServerClass.Name)))
			{
				types.Add(type.ServerClass.Name);

				//Console.WriteLine ("##" + type.ServerClass.Name);
			}

			if (this.ctTeamEntity == null) {
				this.ctTeamEntity = entities.Values.ToList().SingleOrDefault(
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
			
			for (int i = 0; i < RawPlayers.Count; i++)
			{
				var rawPlayer = RawPlayers[i];

				int id = rawPlayer.UserID;
				if (!entities.ContainsKey(i + 1))
					continue;

				Entity entity = entities[i + 1];

				if (entity.Properties.ContainsKey("m_vecOrigin"))
				{
					if (!Players.ContainsKey(id))
						Players[id] = new Player();

					Player p = Players[id];
					p.EntityID = entity.ID;
					p.Entity = entity;

					p.EntityID = entity.ID;
					p.Position = (Vector)entity.Properties["m_vecOrigin"];


					if ((int)entity.Properties["m_iTeamNum"] == (int)ctTeamEntity.Properties["m_iTeamNum"])
						p.Team = Team.CounterTerrorist;
					else if ((int)entity.Properties["m_iTeamNum"] == (int)tTeamEntity.Properties["m_iTeamNum"])
						p.Team = Team.Terrorist;
					else
						p.Team = Team.Spectate;

					if (p.Team != Team.Spectate && entity.Properties.ContainsKey("m_iHealth"))
						p.HP = (int)entity.Properties["m_iHealth"];
					else
						p.HP = -1;


					p.Name = rawPlayer.Name;
					p.SteamID = rawPlayer.XUID;

					p.Velocity = new Vector();
					p.Velocity.X = (float)entity.Properties.GetValueOrDefault<string, object>("m_vecVelocity[0]", 0f);
					p.Velocity.Y = (float)entity.Properties.GetValueOrDefault<string, object>("m_vecVelocity[1]", 0f);
					p.Velocity.Z = (float)entity.Properties.GetValueOrDefault<string, object>("m_vecVelocity[2]", 0f);

					p.Money = (int)entity.Properties.GetValueOrDefault<string, object>("m_iAccount", 0);

					if (entity.Properties.ContainsKey("m_angEyeAngles[1]"))
						p.ViewDirectionX = (float)entity.Properties["m_angEyeAngles[1]"];

					if (entity.Properties.ContainsKey("m_angEyeAngles[0]"))
						p.ViewDirectionY = (float)entity.Properties["m_angEyeAngles[0]"];


					if (p.IsAlive)
					{
						p.LastAlivePosition = p.Position;
					}
				}

			}

			//AttributeWeapons();

			if (b)
			{
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

			int TickNum = reader.ReadInt32();
			reader.ReadByte(); // player slot

			this.CurrrentTick++; // = TickNum;

			switch (command)
			{
				case DemoCommand.Synctick:
					break;
				case DemoCommand.Stop:
					return false;
				case DemoCommand.ConsoleCommand:
					using (var volvo = reader.ReadVolvoPacket()) ;
					break;
				case DemoCommand.DataTables:
					using (var volvo = reader.ReadVolvoPacket())
						DataTables.ParsePacket(volvo);
					break;
				case DemoCommand.StringTables:
					using (var volvo = reader.ReadVolvoPacket())
						StringTables.ParsePacket(volvo, this);
					break;
				case DemoCommand.UserCommand:
					reader.ReadInt32();
					using (var volvo = reader.ReadVolvoPacket()) ;
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
		
		private void AttributeWeapons()
		{
			foreach (var weapon in entities.Values.Where(a => a.ServerClass.Name == "CKnife"))
			{
				int weaponID = (int)weapon.Properties["m_hOwner"];

				var players = Players.Values
					.Select(a => a.Entity)
					.Where(a => a.Properties.ContainsKey("m_hViewModel")).ToList();

				var p = players[3];

				var ent = players
					.FirstOrDefault(a => (int)((object[])a.Properties["m_hViewModel"])[1] == weaponID);

				if(ent != null)
					Trace.WriteLine("ent is null and we somehow didn't expect this? srsly dude, this message...", "DemoParser.AttributeWeapons()");
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
		#endregion
	}
}
