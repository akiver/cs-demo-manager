using DemoInfo.DP;
using DemoInfo.DT;
using DemoInfo.Messages;
using DemoInfo.ST;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Diagnostics;
using System.Text;
using System.Threading;

namespace DemoInfo
{
	#if DEBUG
	#warning The DemoParser is very slow when compiled in Debug-Mode, since we use it as that: We perform many integrity checks during runtime. 
	#warning Build this in Relase-Mode for more performance if you're not working the internals of the parser. (If you are, create a pull request when you're done!)
	#endif
	#if SAVE_PROP_VALUES
	#warning You're compiling in the SavePropValues-Mode. This is a mode intended for Debugging and nothing else. It's cool to take a (entity-)dump here to find out how things work, but don't use this in production
	#endif
	public class DemoParser : IDisposable
	{
		const int MAX_EDICT_BITS = 11;
		internal const int INDEX_MASK = ( ( 1 << MAX_EDICT_BITS ) - 1 );
		internal const int MAX_ENTITIES = ( ( 1 << MAX_EDICT_BITS ) );
		const int MAXPLAYERS = 64;
		const int MAXWEAPONS = 64;


		#region Events
		/// <summary>
		/// Raised once when the Header of the demo is parsed
		/// </summary>
		public event EventHandler<HeaderParsedEventArgs> HeaderParsed;

		/// <summary>
		/// Occurs when the match started, so when the "begin_new_match"-GameEvent is dropped. 
		/// This usually right before the freezetime of the 1st round. Be careful, since the players
		/// usually still have warmup-money when this drops.
		/// </summary>
		public event EventHandler<MatchStartedEventArgs> MatchStarted;

		/// <summary>
		/// Occurs when the first round of a new match start "round_announce_match_start"
		/// </summary>
		public event EventHandler<RoundAnnounceMatchStartedEventArgs> RoundAnnounceMatchStarted;

		/// <summary>
		/// Occurs when round starts, on the round_start event of the demo. Usually the players haven't spawned yet, but have recieved the money for the next round. 
		/// </summary>
		public event EventHandler<RoundStartedEventArgs> RoundStart;

		/// <summary>
		/// Occurs when round ends
		/// </summary>
		public event EventHandler<RoundEndedEventArgs> RoundEnd;

		/// <summary>
		/// Occurs at the end of the match, when the scoreboard is shown
		/// </summary>
		public event EventHandler<WinPanelMatchEventArgs> WinPanelMatch;

		/// <summary>
		/// Occurs when it's the last round of a match
		/// </summary>
		public event EventHandler<RoundFinalEventArgs> RoundFinal;

		/// <summary>
		/// Occurs at the half of a side
		/// </summary>
		public event EventHandler<LastRoundHalfEventArgs> LastRoundHalf;

		/// <summary>
		/// Occurs when round really ended
		/// </summary>
		public event EventHandler<RoundOfficiallyEndedEventArgs> RoundOfficiallyEnd;

		/// <summary>
		/// Occurs on round end with the MVP
		/// </summary>
		public event EventHandler<RoundMVPEventArgs> RoundMVP;

		/// <summary>
		/// Occurs when a player take control of a bot
		/// </summary>
		public event EventHandler<BotTakeOverEventArgs> BotTakeOver;

		/// <summary>
		/// Occurs when freezetime ended. Raised on "round_freeze_end" 
		/// </summary>
		public event EventHandler<FreezetimeEndedEventArgs> FreezetimeEnded;

		/// <summary>
		/// Occurs on the end of every tick, after the gameevents were processed and the packet-entities updated
		/// </summary>
		public event EventHandler<TickDoneEventArgs> TickDone;

		/// <summary>
		/// This is raised when a player is killed. Not that the killer might be dead by the time is raised (e.g. nade-kills),
		/// also note that the killed player is still alive when this is killed
		/// </summary>
		public event EventHandler<PlayerKilledEventArgs> PlayerKilled;

		/// <summary>
		/// Occurs when a player select a team
		/// </summary>
		public event EventHandler<PlayerTeamEventArgs> PlayerTeam;

		/// <summary>
		/// Occurs when a weapon is fired.
		/// </summary>
		public event EventHandler<WeaponFiredEventArgs> WeaponFired;

		/// <summary>
		/// Occurs when smoke nade started.
		/// </summary>
		public event EventHandler<SmokeEventArgs> SmokeNadeStarted;

		/// <summary>
		/// Occurs when smoke nade ended. 
		/// Hint: When a round ends, this is *not* caĺled. 
		/// Make sure to clear nades yourself at the end of rounds
		/// </summary>
		public event EventHandler<SmokeEventArgs> SmokeNadeEnded;

		/// <summary>
		/// Occurs when decoy nade started.
		/// </summary>
		public event EventHandler<DecoyEventArgs> DecoyNadeStarted;

		/// <summary>
		/// Occurs when decoy nade ended. 
		/// Hint: When a round ends, this is *not* caĺled. 
		/// Make sure to clear nades yourself at the end of rounds
		/// </summary>
		public event EventHandler<DecoyEventArgs> DecoyNadeEnded;

		/// <summary>
		/// Occurs when a fire nade (incendiary / molotov) started. 
		/// This currently *doesn't* contain who it threw since this is for some weird reason not networked
		/// </summary>
		public event EventHandler<FireEventArgs> FireNadeStarted;

		/// <summary>
		/// Occurs when fire nade ended.
		/// Hint: When a round ends, this is *not* caĺled. 
		/// Make sure to clear nades yourself at the end of rounds
		/// </summary>
		public event EventHandler<FireEventArgs> FireNadeEnded;

		/// <summary>
		/// Occurs when flash nade exploded.
		/// </summary>
		public event EventHandler<FlashEventArgs> FlashNadeExploded;

		/// <summary>
		/// Occurs when explosive nade exploded.
		/// </summary>
		public event EventHandler<GrenadeEventArgs> ExplosiveNadeExploded;

		/// <summary>
		/// Occurs when any nade reached it's target.
		/// </summary>
		public event EventHandler<NadeEventArgs> NadeReachedTarget;

		/// <summary>
		/// Occurs when bomb is being planted.
		/// </summary>
		public event EventHandler<BombEventArgs> BombBeginPlant;

		/// <summary>
		/// Occurs when the plant is aborted
		/// </summary>
		public event EventHandler<BombEventArgs> BombAbortPlant;

		/// <summary>
		/// Occurs when the bomb has been planted.
		/// </summary>
		public event EventHandler<BombEventArgs> BombPlanted;

		/// <summary>
		/// Occurs when the bomb has been defused.
		/// </summary>
		public event EventHandler<BombEventArgs> BombDefused;

		/// <summary>
		/// Occurs when bomb has exploded.
		/// </summary>
		public event EventHandler<BombEventArgs> BombExploded;

		/// <summary>
		/// Occurs when someone begins to defuse the bomb.
		/// </summary>
		public event EventHandler<BombDefuseEventArgs> BombBeginDefuse;

		/// <summary>
		/// Occurs when someone aborts to defuse the bomb.
		/// </summary>
		public event EventHandler<BombDefuseEventArgs> BombAbortDefuse;

		/// <summary>
		/// Occurs when an player is attacked by another player.
		/// Hint: Only occurs in GOTV-demos. 
		/// </summary>
		public event EventHandler<PlayerHurtEventArgs> PlayerHurt;


		/// <summary>
		/// Occurs when the player object is first updated to reference all the necessary information
		/// Hint: Event will be raised when any player with a SteamID connects, not just PlayingParticipants
		/// </summary>
		public event EventHandler<PlayerBindEventArgs> PlayerBind;

		/// <summary>
		/// Occurs when a player disconnects from the server. 
		/// </summary>
		public event EventHandler<PlayerDisconnectEventArgs> PlayerDisconnect;

		/// <summary>
		/// Occurs when the server uses the "say" command
		/// </summary>
		public event EventHandler<SayTextEventArgs> SayText;

		/// <summary>
		/// Occurs when a player uses the "say" command
		/// </summary>
		public event EventHandler<SayText2EventArgs> SayText2;

		/// <summary>
		/// Occurs when the server display a player rank
		/// </summary>
		public event EventHandler<RankUpdateEventArgs> RankUpdate;
		#endregion

		/// <summary>
		/// The mapname of the Demo. Only avaible after the header is parsed. 
		/// Is a string like "de_dust2".
		/// </summary>
		/// <value>The map.</value>
		public string Map {
			get { return Header.MapName; }
		}

		/// <summary>
		/// The header of the demo, containing some useful information. 
		/// </summary>
		/// <value>The header.</value>
		public DemoHeader Header { get; private set; }

		/// <summary>
		/// Gets the participants of this game
		/// </summary>
		/// <value>The participants.</value>
		public IEnumerable<Player> Participants {
			get { 
				return Players.Values;
			}
		}

		/// <summary>
		/// Gets all the participants of this game, that aren't spectating.
		/// </summary>
		/// <value>The playing participants.</value>
		public IEnumerable<Player> PlayingParticipants {
			get { 
				return Players.Values.Where(a => a.Team != Team.Spectate);
			}
		}

		/// <summary>
		/// The stream of the demo - all the information go here
		/// </summary>
		private readonly IBitStream BitStream;



		/// <summary>
		/// A parser for DataTables. This contains the ServerClasses and DataTables. 
		/// </summary>
		internal DataTableParser SendTableParser = new DataTableParser();

		/// <summary>
		/// A parser for DEM_STRINGTABLES-Packets
		/// </summary>
		StringTableParser StringTables = new StringTableParser();

		/// <summary>
		/// This maps an ServerClass to an Equipment. 
		/// Note that this is wrong for the CZ,M4A1 and USP-S, there is an additional fix for those
		/// </summary>
		internal Dictionary<ServerClass, EquipmentElement> equipmentMapping = new Dictionary<ServerClass, EquipmentElement>();

		internal Dictionary<int, Player> Players = new Dictionary<int, Player>();

		/// <summary>
		/// Containing info about players, accessible by the entity-id
		/// </summary>
		internal Player[] PlayerInformations = new Player[MAXPLAYERS];

		/// <summary>
		/// Contains information about the players, accessible by the userid. 
		/// </summary>
		internal PlayerInfo[] RawPlayers = new PlayerInfo[MAXPLAYERS];

		/// <summary>
		/// All entities currently alive in the demo. 
		/// </summary>
		internal Entity[] Entities = new Entity[MAX_ENTITIES]; //Max 2048 entities. 

		/// <summary>
		/// The modelprecache. With this we can tell which model an entity has.
		/// Useful for finding out whetere a weapon is a P250 or a CZ
		/// </summary>
		internal List<string> modelprecache = new List<string> ();

		/// <summary>
		/// The string tables sent by the server. 
		/// </summary>
		internal List<CreateStringTable> stringTables = new List<CreateStringTable>();


		/// <summary>
		/// An map entity <-> weapon. Used to remember whether a weapon is a p250, 
		/// how much ammonition it has, etc. 
		/// </summary>
		Equipment[] weapons = new Equipment[MAX_ENTITIES];

		/// <summary>
		/// The indicies of the bombsites - useful to find out
		/// where the bomb is planted
		/// </summary>
		internal int bombsiteAIndex = -1, bombsiteBIndex = -1;
		internal Vector bombsiteACenter, bombsiteBCenter;

		/// <summary>
		/// The ID of the CT-Team
		/// </summary>
		internal int ctID = -1;
		/// <summary>
		/// The ID of the terrorist team
		/// </summary>
		internal int tID = -1;

		/// <summary>
		/// The Rounds the Counter-Terrorists have won at this point.
		/// </summary>
		/// <value>The CT score.</value>
		public int CTScore  {
			get;
			private set;
		}

		/// <summary>
		/// The Rounds the Terrorists have won at this point.
		/// </summary>
		/// <value>The T score.</value>
		public int TScore  {
			get;
			private set;
		}

		/// <summary>
		/// The clan name of the Counter-Terrorists
		/// </summary>
		/// <value>The name of the CT clan.</value>
		public string CTClanName {
			get;
			private set;
		}

		/// <summary>
		/// The clan name of the Terrorists
		/// </summary>
		/// <value>The name of the T clan.</value>
		public string TClanName {
			get;
			private set;
		}

		/// <summary>
		/// The flag of the Counter-Terrorists
		/// </summary>
		/// <value>The flag of the CT clan.</value>
		public string CTFlag
		{
			get;
			private set;
		}

		/// <summary>
		/// The flag of the Terrorists
		/// </summary>
		/// <value>The flag of the T clan.</value>
		public string TFlag
		{
			get;
			private set;
		}

		/// <summary>
		/// And GameEvent is just sent with ID |--> Value, but we need Name |--> Value. 
		/// Luckily these contain a map ID |--> Name.
		/// </summary>
		internal Dictionary<int, GameEventList.Descriptor> GEH_Descriptors = null;

		/// <summary>
		/// The blind players, so we can tell who was flashed by a flashbang. 
		/// </summary>
		internal List<Player> GEH_BlindPlayers = new List<Player>();

		// These could be Dictionary<int, RecordedPropertyUpdate[]>, but I was too lazy to
		// define that class. Also: It doesn't matter anyways, we always have to cast.


		/// <summary>
		/// The preprocessed baselines, useful to create entities fast
		/// </summary>
		internal Dictionary<int, object[]> PreprocessedBaselines = new Dictionary<int, object[]>();

		/// <summary>
		/// The instance baselines. 
		/// When a new edict is created one would need to send all the information twice. 
		/// Since this is (was) expensive, valve sends an instancebaseline, which contains defaults
		/// for all the properties. 
		/// </summary>
		internal Dictionary<int, byte[]> instanceBaseline = new Dictionary<int, byte[]>();

		/// <summary>
		/// The tickrate *of the demo* (16 for normal GOTV-demos)
		/// </summary>
		/// <value>The tick rate.</value>
		public float TickRate {
			get { return this.Header.PlaybackFrames / this.Header.PlaybackTime; }
		}

		/// <summary>
		/// How long a tick of the demo is in s^-1
		/// </summary>
		/// <value>The tick time.</value>
		public float TickTime {
			get { return this.Header.PlaybackTime / this.Header.PlaybackFrames; }
		}

		/// <summary>
		/// Gets the parsing progess. 0 = beginning, ~1 = finished (it can actually be > 1, so be careful!)
		/// </summary>
		/// <value>The parsing progess.</value>
		public float ParsingProgess {
			get { return (CurrentTick / (float)Header.PlaybackFrames); }
		}

		/// <summary>
		/// The current tick the parser has seen. So if it's a 16-tick demo, 
		/// it will have 16 after one second. 
		/// </summary>
		/// <value>The current tick.</value>
		public int CurrentTick { get; private set; }

		/// <summary>
		/// The current ingame-tick as reported by the demo-file. 
		/// </summary>
		/// <value>The current tick.</value>
		public int IngameTick { get; internal set; }

		/// <summary>
		/// How far we've advanced in the demo in seconds. 
		/// </summary>
		/// <value>The current time.</value>
		public float CurrentTime { get { return CurrentTick * TickTime; } }

		/// <summary>
		/// This contains additional informations about each player, such as Kills, Deaths, etc. 
		/// This is networked seperately from the player, so we need to cache it somewhere else.
		/// </summary>
		private AdditionalPlayerInformation[] additionalInformations = new AdditionalPlayerInformation[MAXPLAYERS];

		/// <summary>
		/// Initializes a new DemoParser. Right point if you want to start analyzing demos. 
		/// Hint: ParseHeader() is propably what you want to look into next. 
		/// </summary>
		/// <param name="input">An input-stream.</param>
		public DemoParser(Stream input)
		{
			BitStream = BitStreamUtil.Create(input);

			for (int i = 0; i < MAXPLAYERS; i++) {
				additionalInformations [i] = new AdditionalPlayerInformation ();
			}
		}



		/// <summary>
		/// Parses the header (first few hundret bytes) of the demo. 
		/// </summary>
		public void ParseHeader()
		{
			var header = DemoHeader.ParseFrom(BitStream);

			if (header.Filestamp != "HL2DEMO")
				throw new InvalidDataException("Invalid File-Type - expecting HL2DEMO");

			if (header.Protocol != 4)
				throw new InvalidDataException("Invalid Demo-Protocol");

			Header = header;


			if (HeaderParsed != null)
				HeaderParsed(this, new HeaderParsedEventArgs(Header));
		}

		/// <summary>
		/// Parses this file until the end of the demo is reached. 
		/// Useful if you have subscribed to events
		/// </summary>
		public void ParseToEnd()
		{
			ParseToEnd(CancellationToken.None);
		}

		/// <summary>
		/// Same as ParseToEnd() but accepts a CancellationToken to be able to cancel parsing
		/// </summary>
		/// <param name="token"></param>
		public void ParseToEnd(CancellationToken token)
		{
			while (ParseNextTick())
			{
				if (token.IsCancellationRequested) return;
			}
		}

		/// <summary>
		/// Parses the next tick of the demo.
		/// </summary>
		/// <returns><c>true</c>, if this wasn't the last tick, <c>false</c> otherwise.</returns>
		public bool ParseNextTick()
		{
			if (Header == null)
				throw new InvalidOperationException ("You need to call ParseHeader first before you call ParseToEnd or ParseNextTick!");

			bool b = ParseTick();
			
			for (int i = 0; i < RawPlayers.Length; i++) {
				if (RawPlayers[i] == null)
					continue;

				var rawPlayer = RawPlayers[i];

				int id = rawPlayer.UserID;

				if (PlayerInformations[i] != null) { //There is an good entity for this
					bool newplayer = false;
					if (!Players.ContainsKey(id)){
						Players[id] = PlayerInformations[i];
						newplayer = true;
					}

					Player p = Players[id];
					p.Name = rawPlayer.Name;
					p.SteamID = rawPlayer.XUID;

					p.AdditionaInformations = additionalInformations [p.EntityID];

					if (p.IsAlive) {
						p.LastAlivePosition = p.Position.Copy();
					}

					if (newplayer && p.SteamID != 0){
						PlayerBindEventArgs bind = new PlayerBindEventArgs();
						bind.Player = p;
						RaisePlayerBind(bind);
					}
				}
			}

			if (b) {
				if (TickDone != null)
					TickDone(this, new TickDoneEventArgs());
			}

			return b;
		}

		/// <summary>
		/// Parses the tick internally
		/// </summary>
		/// <returns><c>true</c>, if tick was parsed, <c>false</c> otherwise.</returns>
		private bool ParseTick()
		{
			DemoCommand command = (DemoCommand)BitStream.ReadByte();

			IngameTick = (int)BitStream.ReadInt(32); // tick number
			BitStream.ReadByte(); // player slot

			this.CurrentTick++; // = TickNum;

			switch (command) {
			case DemoCommand.Synctick:
				break;
			case DemoCommand.Stop:
				return false;
			case DemoCommand.ConsoleCommand:
				BitStream.BeginChunk(BitStream.ReadSignedInt(32) * 8);
				BitStream.EndChunk();
				break;
			case DemoCommand.DataTables:
				BitStream.BeginChunk (BitStream.ReadSignedInt (32) * 8);
				SendTableParser.ParsePacket (BitStream);
				BitStream.EndChunk ();

				//Map the weapons in the equipmentMapping-Dictionary.
				MapEquipment ();

				//And now we have the entities, we can bind events on them. 
				BindEntites();

				break;
			case DemoCommand.StringTables:
				BitStream.BeginChunk(BitStream.ReadSignedInt(32) * 8);
				StringTables.ParsePacket(BitStream, this);
				BitStream.EndChunk();
				break;
			case DemoCommand.UserCommand:
				BitStream.ReadInt(32);
				BitStream.BeginChunk(BitStream.ReadSignedInt(32) * 8);
				BitStream.EndChunk();
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

		/// <summary>
		/// Parses a DEM_Packet. 
		/// </summary>
		private void ParseDemoPacket()
		{
			//Read a command-info. Contains no really useful information afaik. 
			CommandInfo.Parse(BitStream);
			BitStream.ReadInt(32); // SeqNrIn
			BitStream.ReadInt(32); // SeqNrOut

			BitStream.BeginChunk(BitStream.ReadSignedInt(32) * 8);
			DemoPacketParser.ParsePacket(BitStream, this);
			BitStream.EndChunk();
		}

		/// <summary>
		/// Binds the events for entities. And Entity has many properties. 
		/// You can subscribe to when an entity of a specific class is created, 
		/// and then you can subscribe to updates of properties of this entity. 
		/// This is a bit complex, but very fast. 
		/// </summary>
		private void BindEntites()
		{
			//Okay, first the team-stuff. 
			HandleTeamScores();

			HandleBombSites();

			HandlePlayers();

			HandleWeapons ();
		}

		private void HandleTeamScores()
		{
			SendTableParser.FindByName("CCSTeam")
				.OnNewEntity += (object sender, EntityCreatedEventArgs e) => {

				string team = null;
				string teamName = null;
				string teamFlag = null;
				int teamID = -1;
				int score = 0;

				e.Entity.FindProperty("m_scoreTotal").IntRecived += (xx, update) => { 
					score = update.Value;
				};

				e.Entity.FindProperty("m_iTeamNum").IntRecived += (xx, update) => { 
					teamID = update.Value;

					if(team == "CT")
					{
						this.ctID = teamID;
						CTScore = score;
						foreach(var p in PlayerInformations.Where(a => a != null && a.TeamID == teamID))
							p.Team = Team.CounterTerrorist;
					}

					if(team == "TERRORIST")
					{
						this.tID = teamID;
						TScore = score;
						foreach(var p in PlayerInformations.Where(a => a != null && a.TeamID == teamID))
							p.Team = Team.Terrorist;
					}
				};

				e.Entity.FindProperty("m_szTeamname").StringRecived += (sender_, recivedTeamName) => { 
					team = recivedTeamName.Value;

					//We got the name. Lets bind the updates accordingly!
					if(recivedTeamName.Value == "CT")
					{
						CTScore = score;
						CTClanName = teamName;
						e.Entity.FindProperty("m_scoreTotal").IntRecived += (xx, update) => { 
							CTScore = update.Value;
						};

						if(teamID != -1)
						{
							this.ctID = teamID;
							foreach(var p in PlayerInformations.Where(a => a != null && a.TeamID == teamID))
								p.Team = Team.CounterTerrorist;
						}

					}
					else if(recivedTeamName.Value == "TERRORIST")
					{
						TScore = score;
						TClanName = teamName;
						e.Entity.FindProperty("m_scoreTotal").IntRecived += (xx, update) => { 
							TScore = update.Value;
						};

						if(teamID != -1)
						{
							this.tID = teamID;
							foreach(var p in PlayerInformations.Where(a => a != null && a.TeamID == teamID))
								p.Team = Team.Terrorist;
						}
					}
				};

				e.Entity.FindProperty("m_szTeamFlagImage").StringRecived += (sender_, recivedTeamFlag) => {
					teamFlag = recivedTeamFlag.Value;

					if (team == "CT")
					{
						CTFlag = teamFlag;
                    }
					else if (team == "TERRORIST")
					{
						TFlag = teamFlag;
					}
				};

				e.Entity.FindProperty("m_szClanTeamname").StringRecived += (sender_, recivedClanName) => {
					teamName = recivedClanName.Value;
					if(team == "CT")
					{
						CTClanName = recivedClanName.Value;
					}
					else if(team == "TERRORIST")
					{
						TClanName = recivedClanName.Value;
					}
				};
			};
		}

		private void HandlePlayers()
		{
			SendTableParser.FindByName("CCSPlayer").OnNewEntity += (object sender, EntityCreatedEventArgs e) => HandleNewPlayer (e.Entity);

			SendTableParser.FindByName("CCSPlayerResource").OnNewEntity += (blahblah, playerResources) => {
				for(int i = 0; i < 64; i++)
				{
					//Since this is passed as reference to the delegates
					int iForTheMethod = i;
					string iString = i.ToString().PadLeft(3, '0');

					playerResources.Entity.FindProperty("m_szClan."+iString).StringRecived += (sender, e) => {
						additionalInformations[iForTheMethod].Clantag = e.Value;
					};

					playerResources.Entity.FindProperty("m_iPing."+iString).IntRecived += (sender, e) => {
						additionalInformations[iForTheMethod].Ping = e.Value;
					};

					playerResources.Entity.FindProperty("m_iScore."+iString).IntRecived += (sender, e) => {
						additionalInformations[iForTheMethod].Score = e.Value;
					};

					playerResources.Entity.FindProperty("m_iKills."+iString).IntRecived += (sender, e) => {
						additionalInformations[iForTheMethod].Kills = e.Value;
					};

					playerResources.Entity.FindProperty("m_iDeaths."+iString).IntRecived += (sender, e) => {
						additionalInformations[iForTheMethod].Deaths = e.Value;
					};


					playerResources.Entity.FindProperty("m_iAssists."+iString).IntRecived += (sender, e) => {
						additionalInformations[iForTheMethod].Assists = e.Value;
					};

					playerResources.Entity.FindProperty("m_iMVPs."+iString).IntRecived += (sender, e) => {
						additionalInformations[iForTheMethod].MVPs = e.Value;
					};

					playerResources.Entity.FindProperty("m_iTotalCashSpent."+iString).IntRecived += (sender, e) => {
						additionalInformations[iForTheMethod].TotalCashSpent = e.Value;
					};

					#if DEBUG
					playerResources.Entity.FindProperty("m_iArmor."+iString).IntRecived += (sender, e) => {
						additionalInformations[iForTheMethod].ScoreboardArmor = e.Value;
					};

					playerResources.Entity.FindProperty("m_iHealth."+iString).IntRecived += (sender, e) => {
						additionalInformations[iForTheMethod].ScoreboardHP = e.Value;
					};

					#endif
				}
			};
		}

		private void HandleNewPlayer(Entity playerEntity)
		{
			Player p = null;
			if (this.PlayerInformations [playerEntity.ID - 1] != null) {
				p = this.PlayerInformations [playerEntity.ID - 1];
			} else {
				p = new Player ();
				this.PlayerInformations [playerEntity.ID - 1] = p;
				p.SteamID = -1;
				p.Name = "unconnected";
			}

			p.EntityID = playerEntity.ID;
			p.Entity = playerEntity;
			p.Position = new Vector();
			p.Velocity = new Vector();

			//position update
			playerEntity.FindProperty("cslocaldata.m_vecOrigin").VectorRecived += (sender, e) => {
				p.Position.X = e.Value.X; 
				p.Position.Y = e.Value.Y;
			};

			playerEntity.FindProperty("cslocaldata.m_vecOrigin[2]").FloatRecived += (sender, e) => {
				p.Position.Z = e.Value; 
			};

			//team update
			//problem: Teams are networked after the players... How do we solve that?
			playerEntity.FindProperty("m_iTeamNum").IntRecived += (sender, e) => { 

				p.TeamID = e.Value;

				if (e.Value == ctID)
					p.Team = Team.CounterTerrorist;
				else if (e.Value == tID)
					p.Team = Team.Terrorist;
				else
					p.Team = Team.Spectate;
			};

			//update some stats
			playerEntity.FindProperty("m_iHealth").IntRecived += (sender, e) => p.HP = e.Value;
			playerEntity.FindProperty("m_ArmorValue").IntRecived += (sender, e) => p.Armor = e.Value;
			playerEntity.FindProperty("m_bHasDefuser").IntRecived += (sender, e) => p.HasDefuseKit = e.Value == 1;
			playerEntity.FindProperty("m_bHasHelmet").IntRecived += (sender, e) => p.HasHelmet = e.Value == 1;
			playerEntity.FindProperty("localdata.m_Local.m_bDucking").IntRecived += (sender, e) =>  p.IsDucking = e.Value == 1;
			playerEntity.FindProperty("m_iAccount").IntRecived += (sender, e) => p.Money = e.Value;
			playerEntity.FindProperty("m_angEyeAngles[1]").FloatRecived += (sender, e) => p.ViewDirectionX = e.Value;
			playerEntity.FindProperty("m_angEyeAngles[0]").FloatRecived += (sender, e) => p.ViewDirectionY = e.Value;
			playerEntity.FindProperty("m_flFlashDuration").FloatRecived += (sender, e) => p.FlashDuration = e.Value;


			playerEntity.FindProperty("localdata.m_vecVelocity[0]").FloatRecived += (sender, e) => p.Velocity.X = e.Value;
			playerEntity.FindProperty("localdata.m_vecVelocity[1]").FloatRecived += (sender, e) => p.Velocity.Y = e.Value;
			playerEntity.FindProperty("localdata.m_vecVelocity[2]").FloatRecived += (sender, e) => p.Velocity.Z = e.Value;



			playerEntity.FindProperty("m_unCurrentEquipmentValue").IntRecived += (sender, e) => p.CurrentEquipmentValue = e.Value;
			playerEntity.FindProperty("m_unRoundStartEquipmentValue").IntRecived += (sender, e) => p.RoundStartEquipmentValue = e.Value;
			playerEntity.FindProperty("m_unFreezetimeEndEquipmentValue").IntRecived += (sender, e) => p.FreezetimeEndEquipmentValue = e.Value;

			//Weapon attribution
			string weaponPrefix = "m_hMyWeapons.";

			if (playerEntity.Props.All (a => a.Entry.PropertyName != "m_hMyWeapons.000"))
				weaponPrefix = "bcc_nonlocaldata.m_hMyWeapons.";


			int[] cache = new int[MAXWEAPONS];

			for(int i = 0; i < MAXWEAPONS; i++)
			{
				int iForTheMethod = i; //Because else i is passed as reference to the delegate. 

				playerEntity.FindProperty(weaponPrefix + i.ToString().PadLeft(3, '0')).IntRecived += (sender, e) => {

					int index = e.Value & INDEX_MASK;

					if (index != INDEX_MASK) {
						if(cache[iForTheMethod] != 0) //Player already has a weapon in this slot. 
						{
							p.rawWeapons.Remove(cache[iForTheMethod]);
							cache[iForTheMethod] = 0;
						}
						cache[iForTheMethod] = index;

						AttributeWeapon(index, p);
					} else {
						if (cache[iForTheMethod] != 0 && p.rawWeapons.ContainsKey(cache[iForTheMethod]))
						{
							p.rawWeapons[cache[iForTheMethod]].Owner = null;
						}
						p.rawWeapons.Remove(cache[iForTheMethod]);

						cache[iForTheMethod] = 0;
					}
				};
			}

			playerEntity.FindProperty("m_hActiveWeapon").IntRecived += (sender, e) => p.ActiveWeaponID = e.Value & INDEX_MASK;

			for (int i = 0; i < 32; i++) {
				int iForTheMethod = i;

				playerEntity.FindProperty ("m_iAmmo." + i.ToString ().PadLeft (3, '0')).IntRecived += (sender, e) => {
					p.AmmoLeft [iForTheMethod] = e.Value;
				};
			}


		}

		private void MapEquipment()
		{				
			for (int i = 0; i < SendTableParser.ServerClasses.Count; i++) {
				var sc = SendTableParser.ServerClasses[i];

				if (sc.BaseClasses.Count > 6 && sc.BaseClasses [6].Name == "CWeaponCSBase") { 
					//It is a "weapon" (Gun, C4, ... (...is the cz still a "weapon" after the nerf? (fml, it was buffed again)))
					if (sc.BaseClasses.Count > 7) {
						if (sc.BaseClasses [7].Name == "CWeaponCSBaseGun") {
							//it is a ratatatata-weapon.
							var s = sc.DTName.Substring (9).ToLower ();
							equipmentMapping.Add (sc, Equipment.MapEquipment (s));
						} else if (sc.BaseClasses [7].Name == "CBaseCSGrenade") {
							//"boom"-weapon. 
							equipmentMapping.Add (sc, Equipment.MapEquipment (sc.DTName.Substring (3).ToLower ()));
						} 
					} else if (sc.Name == "CC4") {
						//Bomb is neither "ratatata" nor "boom", its "booooooom".
						equipmentMapping.Add (sc, EquipmentElement.Bomb);
					} else if (sc.Name == "CKnife" || (sc.BaseClasses.Count > 6 && sc.BaseClasses [6].Name == "CKnife")) {
						//tsching weapon
						equipmentMapping.Add (sc, EquipmentElement.Knife);
					} else if (sc.Name == "CWeaponNOVA" || sc.Name == "CWeaponSawedoff" || sc.Name == "CWeaponXM1014") {
						equipmentMapping.Add (sc, Equipment.MapEquipment (sc.Name.Substring (7).ToLower()));
					}
				}
			}

		}

		private bool AttributeWeapon(int weaponEntityIndex, Player p)
		{
			var weapon = weapons[weaponEntityIndex];
			weapon.Owner = p;
			p.rawWeapons [weaponEntityIndex] = weapon;

			return true;
		}

		void HandleWeapons ()
		{
			for (int i = 0; i < MAX_ENTITIES; i++) {
				weapons [i] = new Equipment ();
			}

			foreach (var s in SendTableParser.ServerClasses.Where(a => a.BaseClasses.Any(c => c.Name == "CWeaponCSBase"))) {
				s.OnNewEntity += HandleWeapon;
			}
		}

		void HandleWeapon (object sender, EntityCreatedEventArgs e)
		{
			var equipment = weapons [e.Entity.ID];
			equipment.EntityID = e.Entity.ID;
			equipment.Weapon = equipmentMapping [e.Class];
			equipment.AmmoInMagazine = -1;

			e.Entity.FindProperty("m_iClip1").IntRecived += (asdasd, ammoUpdate) => {
				equipment.AmmoInMagazine = ammoUpdate.Value - 1; //wtf volvo y -1?
			};

			e.Entity.FindProperty("LocalWeaponData.m_iPrimaryAmmoType").IntRecived += (asdasd, typeUpdate) => {
				equipment.AmmoType = typeUpdate.Value;
			};

			if (equipment.Weapon == EquipmentElement.P2000) {
				e.Entity.FindProperty("m_nModelIndex").IntRecived += (sender2, e2) => {
					equipment.OriginalString = modelprecache[e2.Value];
					if (modelprecache[e2.Value].Contains("_pist_223"))
						equipment.Weapon = EquipmentElement.USP; //BAM
					else if(modelprecache[e2.Value].Contains("_pist_hkp2000"))
						equipment.Weapon = EquipmentElement.P2000;
					else 
						throw new InvalidDataException("Unknown weapon model");
				};
			}

			if (equipment.Weapon == EquipmentElement.M4A4) {
				e.Entity.FindProperty("m_nModelIndex").IntRecived += (sender2, e2) => {
					equipment.OriginalString = modelprecache[e2.Value];
					if (modelprecache[e2.Value].Contains("_rif_m4a1_s"))
						equipment.Weapon = EquipmentElement.M4A1;  //BAM
						// if it's not an M4A1-S, check if it's an M4A4
					else if(modelprecache[e2.Value].Contains("_rif_m4a1"))
						equipment.Weapon = EquipmentElement.M4A4;
					else 
						throw new InvalidDataException("Unknown weapon model");
				};
			}

			if (equipment.Weapon == EquipmentElement.P250) {
				e.Entity.FindProperty("m_nModelIndex").IntRecived += (sender2, e2) => {
					equipment.OriginalString = modelprecache[e2.Value];
					if (modelprecache[e2.Value].Contains("_pist_cz_75"))
						equipment.Weapon = EquipmentElement.CZ;  //BAM
					else if(modelprecache[e2.Value].Contains("_pist_p250"))
						equipment.Weapon = EquipmentElement.P250;
					else 
						throw new InvalidDataException("Unknown weapon model");
				};
			}
		}

		internal List<BoundingBoxInformation> triggers = new List<BoundingBoxInformation>();
		private void HandleBombSites()
		{
			SendTableParser.FindByName("CCSPlayerResource").OnNewEntity += (s1, newResource) => {
				newResource.Entity.FindProperty("m_bombsiteCenterA").VectorRecived += (s2, center) => {
					bombsiteACenter = center.Value;
				};
				newResource.Entity.FindProperty("m_bombsiteCenterB").VectorRecived += (s3, center) => {
					bombsiteBCenter = center.Value;
				};
			};

			SendTableParser.FindByName("CBaseTrigger").OnNewEntity += (s1, newResource) => {

				BoundingBoxInformation trigger = new BoundingBoxInformation(newResource.Entity.ID);
				triggers.Add(trigger);

				newResource.Entity.FindProperty("m_Collision.m_vecMins").VectorRecived += (s2, vector) => {
					trigger.Min = vector.Value;
				};

				newResource.Entity.FindProperty("m_Collision.m_vecMaxs").VectorRecived += (s3, vector) => {
					trigger.Max = vector.Value;
				};
			};

		}
		#if SAVE_PROP_VALUES
		[Obsolete("This method is only for debugging-purposes and shuld never be used in production, so you need to live with this warning.")]
		public string DumpAllEntities()
		{
			StringBuilder res = new StringBuilder ();
			for (int i = 0; i < MAX_ENTITIES; i++) {
				Entity entity = Entities [i];

				if (entity == null)
					continue;

				res.Append("Entity " + i + ": " + entity.ServerClass.Name + " (inherits: ");

				//The class with the lowest order is the first
				//But we obv. want the highest order first :D
				foreach(var c in entity.ServerClass.BaseClasses.Reverse<ServerClass>())
				{
					res.Append (c.Name + "; ");
				}
				res.AppendLine (")");

				foreach (var prop in entity.Props) {
					res.Append(prop.Entry.PropertyName.PadLeft(50));
					res.Append(" = ");
					res.Append(prop.Value);
					res.AppendLine ();
				}
			}

			return res.ToString();
		}

		[Obsolete("This method is only for debugging-purposes and shuld never be used in production, so you need to live with this warning.")]
		public void DumpAllEntities(string fileName)
		{
			StreamWriter writer = new StreamWriter(fileName);
			writer.WriteLine(DumpAllEntities());
			writer.Flush();
			writer.Close();
		}
		#endif 

		#region EventCaller

		internal void RaiseMatchStarted()
		{
			if (MatchStarted != null)
				MatchStarted(this, new MatchStartedEventArgs());
		}

		internal void RaiseRoundAnnounceMatchStarted()
		{
			if (RoundAnnounceMatchStarted != null)
				RoundAnnounceMatchStarted(this, new RoundAnnounceMatchStartedEventArgs());
		}

		internal void RaiseWinPanelMatch()
		{
			if (WinPanelMatch != null)
				WinPanelMatch(this, new WinPanelMatchEventArgs());
		}

		internal void RaiseRoundStart(RoundStartedEventArgs rs)
		{
			if (RoundStart != null)
				RoundStart(this, rs);
		}

		internal void RaiseRoundFinal()
		{
			if (RoundFinal != null)
				RoundFinal(this, new RoundFinalEventArgs());
		}

		internal void RaiseLastRoundHalf()
		{
			if (LastRoundHalf != null)
				LastRoundHalf(this, new LastRoundHalfEventArgs());
		}

		internal void RaiseRoundEnd(RoundEndedEventArgs re)
		{
			if (RoundEnd != null)
				RoundEnd(this, re);

		}

		internal void RaiseRoundOfficiallyEnd()
		{
			if (RoundOfficiallyEnd != null)
				RoundOfficiallyEnd(this, new RoundOfficiallyEndedEventArgs());

		}

		internal void RaiseRoundMVP(RoundMVPEventArgs re)
		{
			if (RoundMVP != null)
				RoundMVP(this, re);

		}

		internal void RaiseFreezetimeEnded ()
		{
			if (FreezetimeEnded != null)
				FreezetimeEnded(this, new FreezetimeEndedEventArgs());
		}

		internal void RaisePlayerKilled(PlayerKilledEventArgs kill)
		{
			if (PlayerKilled != null)
				PlayerKilled(this, kill);
		}

		internal void RaisePlayerHurt(PlayerHurtEventArgs hurt)
		{
			if (PlayerHurt != null)
				PlayerHurt(this, hurt);
		}

		internal void RaisePlayerBind(PlayerBindEventArgs bind)
		{
			if (PlayerBind != null)
				PlayerBind(this, bind);
		}

		internal void RaisePlayerDisconnect(PlayerDisconnectEventArgs bind)
		{
			if (PlayerDisconnect != null)
				PlayerDisconnect(this, bind);
		}

		internal void RaisePlayerTeam(PlayerTeamEventArgs args)
		{
			if (PlayerTeam != null)
				PlayerTeam(this, args);
		}

		internal void RaiseBotTakeOver(BotTakeOverEventArgs take)
		{
			if (BotTakeOver != null)
				BotTakeOver(this, take);
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

		internal void RaiseSayText(SayTextEventArgs args)
		{
			if (SayText != null)
				SayText(this, args);
		}

		internal void RaiseSayText2(SayText2EventArgs args)
		{
			if (SayText2 != null)
				SayText2(this, args);
		}

		internal void RaiseRankUpdate(RankUpdateEventArgs args)
		{
			if (RankUpdate != null)
				RankUpdate(this, args);
		}

		#endregion

		/// <summary>
		/// Releases all resource used by the <see cref="DemoInfo.DemoParser"/> object. This must be called or evil things (memory leaks) happen. 
		/// Sorry for that - I've debugged and I don't know why this is, but I can't fix it somehow. 
		/// This is bad, I know. 
		/// </summary>
		/// <remarks>Call <see cref="Dispose"/> when you are finished using the <see cref="DemoInfo.DemoParser"/>. The
		/// <see cref="Dispose"/> method leaves the <see cref="DemoInfo.DemoParser"/> in an unusable state. After calling
		/// <see cref="Dispose"/>, you must release all references to the <see cref="DemoInfo.DemoParser"/> so the garbage
		/// collector can reclaim the memory that the <see cref="DemoInfo.DemoParser"/> was occupying.</remarks>
		public void Dispose ()
		{
			BitStream.Dispose();

			foreach (var entity in Entities) {
				if(entity != null)
					entity.Leave ();
			}

			foreach (var serverClass in this.SendTableParser.ServerClasses)
			{
				serverClass.Dispose ();
			}

			this.TickDone = null;
			this.BombAbortDefuse = null;
			this.BombAbortPlant = null;
			this.BombBeginDefuse = null;
			this.BombBeginPlant = null;
			this.BombDefused = null;
			this.BombExploded = null;
			this.BombPlanted = null;
			this.DecoyNadeEnded = null;
			this.DecoyNadeStarted = null;
			this.ExplosiveNadeExploded = null;
			this.FireNadeEnded = null;
			this.FireNadeStarted = null;
			this.FlashNadeExploded = null;
			this.HeaderParsed = null;
			this.MatchStarted = null;
			this.NadeReachedTarget = null;
			this.PlayerKilled = null;
			this.RoundStart = null;
			this.SmokeNadeEnded = null;
			this.SmokeNadeStarted = null;
			this.WeaponFired = null;

			Players.Clear ();
		}

	}
}
