using CSGO_Demos_Manager.Models.Events;
using GalaSoft.MvvmLight;
using GalaSoft.MvvmLight.Threading;
using Newtonsoft.Json;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;

namespace CSGO_Demos_Manager.Models
{
	public class Demo : ObservableObject
	{
		#region Properties

		/// <summary>
		/// Unique demo's ID
		/// </summary>
		private string _id;
		
		/// <summary>
		/// Name of the demo's file
		/// </summary>
		private string _name = "";

		/// <summary>
		/// Demo's source (MM, ESEA, FaceIt)
		/// </summary>
		private Source.Source _source;

		/// <summary>
		/// Used for Json
		/// </summary>
		private string _sourceName;

		/// <summary>
		/// Client's name
		/// </summary>
		private string _clientName = "";

		/// <summary>
		/// Hostname
		/// </summary>
		private string _hostname = "";

		/// <summary>
		/// Type (POV or GOTV)
		/// </summary>
		private string _type = "GOTV";

		/// <summary>
		/// Demo's tickrate (16 usually)
		/// </summary>
		private float _tickrate;

		/// <summary>
		/// Server's tickrate (64 or 128 usually)
		/// </summary>
		private float _serverTickrate;

		/// <summary>
		/// Demo's map name
		/// </summary>
		private string _mapName;

		/// <summary>
		/// Path on Windows
		/// </summary>
		private string _path;

		/// <summary>
		/// Total kills during the match
		/// </summary>
		private int _totalKillCount;

		/// <summary>
		/// Team 1 score
		/// </summary>
		private int _scoreTeam1;

		/// <summary>
		/// Team 2 Score
		/// </summary>
		private int _scoreTeam2;

		/// <summary>
		/// First half team 1 score
		/// </summary>
		private int _scoreFirstHalfTeam1;

		/// <summary>
		/// First half team 2 score
		/// </summary>
		private int _scoreFirstHalfTeam2;

		/// <summary>
		/// Second half team 1 score
		/// </summary>
		private int _scoreSecondHalfTeam1;

		/// <summary>
		/// Second half team 2 score
		/// </summary>
		private int _scoreSecondHalfTeam2;

		/// <summary>
		/// Number of 1K during the match
		/// </summary>
		private int _onekillCount;

		/// <summary>
		/// Number of 2K during the match
		/// </summary>
		private int _twokillCount;

		/// <summary>
		/// Number of 3K during the match
		/// </summary>
		private int _threekillCount;

		/// <summary>
		/// Number of 4K during the match
		/// </summary>
		private int _fourkillCount;

		/// <summary>
		/// Number of 5K during the match
		/// </summary>
		private int _fivekillCount;

		/// <summary>
		/// Number of bomb defused during the match
		/// </summary>
		private int _bombDefusedCount;

		/// <summary>
		/// Number of bomb exploded during the match
		/// </summary>
		private int _bombExplodedCount;

		/// <summary>
		/// Number of bomb planted during the match
		/// </summary>
		private int _bombPlantedCount;

		/// <summary>
		/// Clan tag name 1st team
		/// </summary>
		private string _clanTagNameTeam1 = "Team 1";

		/// <summary>
		/// Clan tag name 2nd team
		/// </summary>
		private string _clanTagNameTeam2 = "Team 2";

		/// <summary>
		/// User's comment
		/// </summary>
		private string _comment = "";

		/// <summary>
		/// User's custom status (none, to watch, watched)
		/// </summary>
		private string _status = "None";

		/// <summary>
		/// List of rounds during the match
		/// </summary>
		private ObservableCollection<Round> _rounds = new ObservableCollection<Round>();

		/// <summary>
		/// List of players who played during the match
		/// </summary>
		private ObservableCollection<PlayerExtended> _players = new ObservableCollection<PlayerExtended>();

		/// <summary>
		/// Infos on bomb planted during the match
		/// </summary>
		private ObservableCollection<BombPlantedEvent> _bombPlanted = new ObservableCollection<BombPlantedEvent>();

		/// <summary>
		/// Infos on bomb defused during the match
		/// </summary>
		private ObservableCollection<BombDefusedEvent> _bombDefused = new ObservableCollection<BombDefusedEvent>();

		/// <summary>
		/// All kills during the match
		/// </summary>
		private ObservableCollection<KillEvent> _kills = new ObservableCollection<KillEvent>();

		/// <summary>
		/// 
		/// </summary>
		private ObservableCollection<Overtime> _overtimes = new ObservableCollection<Overtime>();

		/// <summary>
		/// Contains information about all shoots occured during the match (Heatmap data)
		/// </summary>
		private readonly List<WeaponFire> _weaponFired = new List<WeaponFire>();

		private ObservableCollection<PlayerExtended> _playersTeam1 = new ObservableCollection<PlayerExtended>();

		private ObservableCollection<PlayerExtended> _playersTeam2 = new ObservableCollection<PlayerExtended>();

		private PlayerExtended _mostHeadshotPlayer;

		private PlayerExtended _mostBombPlantedPlayer;

		private PlayerExtended _mostEntryKillPlayer;

		private Weapon _mostKillingWeapon;

		private ObservableCollection<TeamExtended> _teams = new ObservableCollection<TeamExtended>();

		#endregion

		#region Accessors

		[JsonProperty("id")]
		public string Id
		{
			get { return _id; }
			set { Set(() => Id, ref _id, value); }
		}

		[JsonProperty("name")]
		public string Name
		{
			get { return _name; }
			set { Set(() => Name, ref _name, value); }
		}

		[JsonIgnore]
		public Source.Source Source
		{
			get { return _source; }
			set
			{
				Set(() => Source, ref _source, value);
				SourceName = value.Name;
			}
		}

		[JsonProperty("source")]
		public string SourceName
		{
			get { return _sourceName;}
			set { Set(() => SourceName, ref _sourceName, value); }
		}
		[JsonProperty("comment")]
		public string Comment
		{
			get { return _comment; }
			set { Set(() => Comment, ref _comment, value); }
		}

		[JsonProperty("status")]
		public string Status
		{
			get { return _status; }
			set { Set(() => Status, ref _status, value); }
		}

		[JsonProperty("client_name")]
		public string ClientName
		{
			get { return _clientName; }
			set { Set(() => ClientName, ref _clientName, value); }
		}

		[JsonProperty("hostname")]
		public string Hostname
		{
			get { return _hostname; }
			set { Set(() => Hostname, ref _hostname, value); }
		}

		[JsonProperty("type")]
		public string Type
		{
			get { return _type; }
			set { Set(() => Type, ref _type, value); }
		}

		[JsonProperty("tickrate")]
		public float Tickrate
		{
			get { return _tickrate; }
			set { Set(() => Tickrate, ref _tickrate, value); }
		}

		[JsonProperty("server_tickrate")]
		public float ServerTickrate
		{
			get { return _serverTickrate; }
			set { Set(() => ServerTickrate, ref _serverTickrate, value); }
		}

		[JsonProperty("map_name")]
		public string MapName
		{
			get { return _mapName; }
			set { Set(() => MapName, ref _mapName, value); }
		}

		[JsonProperty("path")]
		public string Path
		{
			get { return _path; }
			set { Set(() => Path, ref _path, value); }
		}

		[JsonProperty("score_team_1")]
		public int ScoreTeam1
		{
			get { return _scoreTeam1; }
			set { Set(() => ScoreTeam1, ref _scoreTeam1, value); }
		}

		[JsonProperty("score_team_2")]
		public int ScoreTeam2
		{
			get { return _scoreTeam2; }
			set { Set(() => ScoreTeam2, ref _scoreTeam2, value); }
		}

		[JsonProperty("score_first_half_team_1")]
		public int ScoreFirstHalfTeam1
		{
			get { return _scoreFirstHalfTeam1; }
			set { Set(() => ScoreFirstHalfTeam1, ref _scoreFirstHalfTeam1, value); }
		}

		[JsonProperty("score_first_half_team_2")]
		public int ScoreFirstHalfTeam2
		{
			get { return _scoreFirstHalfTeam2; }
			set { Set(() => ScoreFirstHalfTeam2, ref _scoreFirstHalfTeam2, value); }
		}

		[JsonProperty("score_second_half_team_1")]
		public int ScoreSecondHalfTeam1
		{
			get { return _scoreSecondHalfTeam1; }
			set { Set(() => ScoreSecondHalfTeam1, ref _scoreSecondHalfTeam1, value); }
		}

		[JsonProperty("score_second_half_team_2")]
		public int ScoreSecondHalfTeam2
		{
			get { return _scoreSecondHalfTeam2; }
			set { Set(() => ScoreSecondHalfTeam2, ref _scoreSecondHalfTeam2, value); }
		}

		[JsonProperty("total_kill_count")]
		public int TotalKillCount
		{
			get { return _kills.Count; }
			set { Set(() => TotalKillCount, ref _totalKillCount, value); }
		}

		[JsonProperty("five_kill_count")]
		public int FiveKillCount
		{
			get { return _fivekillCount; }
			set { Set(() => FiveKillCount, ref _fivekillCount, value); }
		}

		[JsonProperty("four_kill_count")]
		public int FourKillCount
		{
			get { return _fourkillCount; }
			set { Set(() => FourKillCount, ref _fourkillCount, value); }
		}

		[JsonProperty("three_kill_count")]
		public int ThreeKillCount
		{
			get { return _threekillCount; }
			set { Set(() => ThreeKillCount, ref _threekillCount, value); }
		}

		[JsonProperty("two_kill_count")]
		public int TwoKillCount
		{
			get { return _twokillCount; }
			set { Set(() => TwoKillCount, ref _twokillCount, value); }
		}

		[JsonProperty("one_kill_count")]
		public int OneKillCount
		{
			get { return _onekillCount; }
			set { Set(() => OneKillCount, ref _onekillCount, value); }
		}

		[JsonProperty("bomb_defused_count")]
		public int BombDefusedCount
		{
			get { return _bombDefusedCount; }
			set { Set(() => BombDefusedCount, ref _bombDefusedCount, value); }
		}

		[JsonProperty("bomb_exploded_count")]
		public int BombExplodedCount
		{
			get { return _bombExplodedCount; }
			set { Set(() => BombExplodedCount, ref _bombExplodedCount, value); }
		}

		[JsonProperty("bomb_planted_count")]
		public int BombPlantedCount
		{
			get { return _bombPlantedCount; }
			set { Set(() => BombPlantedCount, ref _bombPlantedCount, value); }
		}

		[JsonProperty("most_killing_weapon")]
		public Weapon MostKillingWeapon
		{
			get { return _mostKillingWeapon; }
			set { Set(() => MostKillingWeapon, ref _mostKillingWeapon, value); }
		}

		[JsonProperty("clan_tag_name_team1")]
		public string ClanTagNameTeam1
		{
			get { return _clanTagNameTeam1; }
			set { Set(() => ClanTagNameTeam1, ref _clanTagNameTeam1, value); }
		}

		[JsonProperty("clan_tag_name_team2")]
		public string ClanTagNameTeam2
		{
			get { return _clanTagNameTeam2; }
			set { Set(() => ClanTagNameTeam2, ref _clanTagNameTeam2, value); }
		}

		[JsonProperty("rounds")]
		public ObservableCollection<Round> Rounds
		{
			get { return _rounds; }
			set { Set(() => Rounds, ref _rounds, value); }
		}

		[JsonProperty("players")]
		public ObservableCollection<PlayerExtended> Players
		{
			get { return _players; }
			set { Set(() => Players, ref _players, value); }
		}

		[JsonProperty("teams")]
		public ObservableCollection<TeamExtended> Teams
		{
			get { return _teams; }
			set { Set(() => Teams, ref _teams, value); }
		}

		[JsonProperty("overtimes")]
		public ObservableCollection<Overtime> Overtimes
		{
			get { return _overtimes; }
			set { Set(() => Overtimes, ref _overtimes, value); }
		}

		[JsonProperty("most_headshot_player")]
		public PlayerExtended MostHeadshotPlayer
		{
			get { return _mostHeadshotPlayer; }
			set { Set(() => MostHeadshotPlayer, ref _mostHeadshotPlayer, value); }
		}

		[JsonProperty("most_bomb_planted_player")]
		public PlayerExtended MostBombPlantedPlayer
		{
			get { return _mostBombPlantedPlayer; }
			set { Set(() => MostBombPlantedPlayer, ref _mostBombPlantedPlayer, value); }
		}

		[JsonProperty("most_entry_kill_player")]
		public PlayerExtended MostEntryKillPlayer
		{
			get { return _mostEntryKillPlayer; }
			set { Set(() => MostEntryKillPlayer, ref _mostEntryKillPlayer, value); }
		}

		public ObservableCollection<PlayerExtended> PlayersTeam1
		{
			get { return _playersTeam1; }
			set { Set(() => PlayersTeam1, ref _playersTeam1, value); }
		}

		public ObservableCollection<PlayerExtended> PlayersTeam2
		{
			get { return _playersTeam2; }
			set { Set(() => PlayersTeam2, ref _playersTeam2, value); }
		}

		public ObservableCollection<BombPlantedEvent> BombPlanted
		{
			get { return _bombPlanted; }
			set { Set(() => BombPlanted, ref _bombPlanted, value); }
		}

		public ObservableCollection<BombDefusedEvent> BombDefused
		{
			get { return _bombDefused; }
			set { Set(() => BombDefused, ref _bombDefused, value); }
		}

		public ObservableCollection<KillEvent> Kills
		{
			get { return _kills; }
			set
			{
				RaisePropertyChanged("TotalKillCount");
				Set(() => Kills, ref _kills, value);
			}
		}

		[JsonProperty("shoots")]
		public List<WeaponFire> WeaponFired => _weaponFired;

		[JsonIgnore]
		public List<HeatmapPoint> HeatmapPoints
		{
			get
			{
				return _weaponFired.Select(fire => new HeatmapPoint
				{
					X = fire.X,
					Y = fire.Y
				}).ToList();
			}
		}

		#endregion

		public override bool Equals(object obj)
		{
			var item = obj as Demo;

			return item != null && Id.Equals(item.Id);
		}

		public override int GetHashCode()
		{
			return base.GetHashCode();
		}

		public void ResetStats()
		{
			DispatcherHelper.CheckBeginInvokeOnUI(
				() =>
				{
					_onekillCount = 0;
					_twokillCount = 0;
					_threekillCount = 0;
					_fourkillCount = 0;
					_fivekillCount = 0;
					_bombDefusedCount = 0;
					_bombExplodedCount = 0;
					_bombPlantedCount = 0;
					_totalKillCount = 0;
					_scoreTeam1 = 0;
					_scoreTeam2 = 0;
					_scoreFirstHalfTeam1 = 0;
					_scoreFirstHalfTeam2 = 0;
					_scoreSecondHalfTeam1 = 0;
					_scoreSecondHalfTeam2 = 0;
					_bombPlanted.Clear();
					_players.Clear();
					_playersTeam1.Clear();
					_playersTeam2.Clear();
					_rounds.Clear();
					_weaponFired.Clear();
					_kills.Clear();
					_teams.Clear();
					_overtimes.Clear();
				});
		}
	}
}
