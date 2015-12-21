using System;
using CSGO_Demos_Manager.Models.Events;
using GalaSoft.MvvmLight;
using Newtonsoft.Json;
using System.Collections.ObjectModel;
using System.Collections.Specialized;
using System.Linq;
using CSGO_Demos_Manager.Properties;
using DemoInfo;

namespace CSGO_Demos_Manager.Models
{
	public enum RoundType
	{
		ECO = 0,
		SEMI_ECO = 1,
		NORMAL = 2,
		FORCE_BUY = 3,
		PISTOL_ROUND = 4
	}

	public class Round : ObservableObject
	{
		#region Properties

		/// <summary>
		/// Round's number
		/// </summary>
		private int _number = 1;

		/// <summary>
		/// Round's start tick
		/// </summary>
		private int _tick;

		/// <summary>
		/// Number of the seconds from the start of the match the round started
		/// </summary>
		private float _timeStartSeconds;

		/// <summary>
		/// Number of the seconds from the start of the match the round ended
		/// </summary>
		private float _timeEndSeconds;

		/// <summary>
		/// Why the round ended
		/// </summary>
		private RoundEndReason _endReason;

		/// <summary>
		/// Equipement value of the team 2
		/// </summary>
		private int _equipementValueTeam2;

		/// <summary>
		/// Equipement value of the team 1
		/// </summary>
		private int _equipementValueTeam1;

		/// <summary>
		/// Start money of the team 1
		/// </summary>
		private int _startMoneyTeam1;

		/// <summary>
		/// Start money of the team 2
		/// </summary>
		private int _startMoneyTeam2;

		/// <summary>
		/// Round's side winner
		/// </summary>
		private Team _winnerSide;

		/// <summary>
		/// Refers to the side currently on eco / semi-eco or force buy
		/// </summary>
		private Team _sideTrouble;

		/// <summary>
		/// Refers to the team currently on eco / semi-eco or force buy
		/// </summary>
		private string _teamTroubleName;

		/// <summary>
		/// Round's team winner
		/// </summary>
		private string _winnerName;

		/// <summary>
		/// Number of 1K during the round
		/// </summary>
		private int _onekillCount;

		/// <summary>
		/// Number of 2K during the round
		/// </summary>
		private int _twokillCount;

		/// <summary>
		/// Number of 3K during the round
		/// </summary>
		private int _threekillCount;

		/// <summary>
		/// Number of 4K during the round
		/// </summary>
		private int _fourkillCount;

		/// <summary>
		/// Number of 5K during the round
		/// </summary>
		private int _fivekillCount;

		/// <summary>
		/// Number of flashbang thrown during the round
		/// </summary>
		private int _flashbangThrownCount;

		/// <summary>
		/// Number of smoke thrown during the round
		/// </summary>
		private int _smokeThrownCount;

		/// <summary>
		/// Number of HE thrown during the round
		/// </summary>
		private int _heGrenadeThrownCount;

		/// <summary>
		/// Number of decoy thrown during the round
		/// </summary>
		private int _decoyThrownCount;

		/// <summary>
		/// Number of molotov thrown during the round
		/// </summary>
		private int _molotovThrownCount;

		/// <summary>
		/// Number of incendiary thrown during the round
		/// </summary>
		private int _incendiaryThrownCount;

		private ObservableCollection<KillEvent> _kills = new ObservableCollection<KillEvent>();

		private ObservableCollection<FlashbangExplodedEvent> _flashbangsExploded = new ObservableCollection<FlashbangExplodedEvent>();

		private ObservableCollection<ExplosiveNadeExplodedEvent> _explosiveGrenadesExploded = new ObservableCollection<ExplosiveNadeExplodedEvent>();

		private ObservableCollection<SmokeNadeStartedEvent> _smokeNadeStarted = new ObservableCollection<SmokeNadeStartedEvent>();

		private ObservableCollection<MolotovFireEndedEvent> _molotovsThrown = new ObservableCollection<MolotovFireEndedEvent>();

		/// <summary>
		/// Infos on bomb planted during the round
		/// </summary>
		private BombPlantedEvent _bombPlanted;

		/// <summary>
		/// Infos on bomb defused during the round
		/// </summary>
		private BombDefusedEvent _bombDefused;

		/// <summary>
		/// Infos on bomb exploded during the round
		/// </summary>
		private BombExplodedEvent _bombExploded;

		/// <summary>
		/// Infos on the round's open kill
		/// </summary>
		private OpenKillEvent _openKillEvent;

		/// <summary>
		/// Infos on the round's entry kill
		/// </summary>
		private EntryKillEvent _entryKillEvent;

		/// <summary>
		/// Infos on players damages made during the round
		/// </summary>
		private ObservableCollection<PlayerHurtedEvent> _playerHurted = new ObservableCollection<PlayerHurtedEvent>();

		#endregion

		#region Accessors

		[JsonProperty("number")]
		public int Number
		{
			get { return _number; }
			set { Set(() => Number, ref _number, value); }
		}

		[JsonProperty("tick")]
		public int Tick
		{
			get { return _tick; }
			set { Set(() => Tick, ref _tick, value); }
		}

		[JsonProperty("start_seconds")]
		public float StartTimeSeconds
		{
			get { return _timeStartSeconds; }
			set { Set(() => StartTimeSeconds, ref _timeStartSeconds, value); }
		}

		[JsonProperty("end_seconds")]
		public float EndTimeSeconds
		{
			get { return _timeEndSeconds; }
			set { Set(() => EndTimeSeconds, ref _timeEndSeconds, value); }
		}

		[JsonProperty("end_reason")]
		public RoundEndReason EndReason
		{
			get { return _endReason; }
			set { Set(() => EndReason, ref _endReason, value); }
		}

		[JsonProperty("kills", IsReference = false)]
		public ObservableCollection<KillEvent> Kills
		{
			get { return _kills; }
			set { Set(() => Kills, ref _kills, value); }
		}

		[JsonProperty("winner_side")]
		public Team WinnerSide
		{
			get { return _winnerSide; }
			set
			{
				Set(() => WinnerSide, ref _winnerSide, value);
				RaisePropertyChanged(() => WinnerSideAsString);
			}
		}

		[JsonProperty("winner_name")]
		public string WinnerName
		{
			get { return _winnerName; }
			set { Set(() => WinnerName, ref _winnerName, value); }
		}

		[JsonProperty("5k_count")]
		public int FiveKillCount
		{
			get { return _fivekillCount; }
			set { Set(() => FiveKillCount, ref _fivekillCount, value); }
		}

		[JsonProperty("4k_count")]
		public int FourKillCount
		{
			get { return _fourkillCount; }
			set { Set(() => FourKillCount, ref _fourkillCount, value); }
		}

		[JsonProperty("3k_count")]
		public int ThreeKillCount
		{
			get { return _threekillCount; }
			set { Set(() => ThreeKillCount, ref _threekillCount, value); }
		}

		[JsonProperty("2k_count")]
		public int TwoKillCount
		{
			get { return _twokillCount; }
			set { Set(() => TwoKillCount, ref _twokillCount, value); }
		}

		[JsonProperty("1k_count")]
		public int OneKillCount
		{
			get { return _onekillCount; }
			set { Set(() => OneKillCount, ref _onekillCount, value); }
		}

		[JsonProperty("bomb_planted_count")]
		public int BombPlantedCount => BombPlanted != null ? 1 : 0;

		[JsonProperty("equipement_value_team2")]
		public int EquipementValueTeam2
		{
			get { return _equipementValueTeam2; }
			set { Set(() => EquipementValueTeam2, ref _equipementValueTeam2, value); }
		}

		[JsonProperty("equipement_value_team1")]
		public int EquipementValueTeam1
		{
			get { return _equipementValueTeam1; }
			set { Set(() => EquipementValueTeam1, ref _equipementValueTeam1, value); }
		}

		[JsonProperty("start_money_team2")]
		public int StartMoneyTeam2
		{
			get { return _startMoneyTeam2; }
			set { Set(() => StartMoneyTeam2, ref _startMoneyTeam2, value); }
		}

		[JsonProperty("start_money_team1")]
		public int StartMoneyTeam1
		{
			get { return _startMoneyTeam1; }
			set { Set(() => StartMoneyTeam1, ref _startMoneyTeam1, value); }
		}

		[JsonProperty("bomb_defused_count")]
		public int BombDefusedCount => BombDefused != null ? 1 : 0;

		[JsonProperty("bomb_exploded_count")]
		public int BombExplodedCount => BombExploded != null ? 1 : 0;

		[JsonProperty("open_kill")]
		public OpenKillEvent OpenKillEvent
		{
			get { return _openKillEvent; }
			set { Set(() => OpenKillEvent, ref _openKillEvent, value); }
		}

		[JsonProperty("entry_kill")]
		public EntryKillEvent EntryKillEvent
		{
			get { return _entryKillEvent; }
			set { Set(() => EntryKillEvent, ref _entryKillEvent, value); }
		}

		[JsonProperty("bomb_planted", IsReference = false)]
		public BombPlantedEvent BombPlanted
		{
			get { return _bombPlanted; }
			set { Set(() => BombPlanted, ref _bombPlanted, value); }
		}

		[JsonProperty("bomb_defused", IsReference = false)]
		public BombDefusedEvent BombDefused
		{
			get { return _bombDefused; }
			set { Set(() => BombDefused, ref _bombDefused, value); }
		}

		[JsonProperty("bomb_exploded", IsReference = false)]
		public BombExplodedEvent BombExploded
		{
			get { return _bombExploded; }
			set { Set(() => BombExploded, ref _bombExploded, value); }
		}

		[JsonProperty("type")]
		public RoundType Type { get; set; }

		/// <summary>
		/// When a round isn't a full buy for both team, one of the team is on eco, semi eco or force buy.
		/// This property return the TeamExtended concerned by this status.
		/// </summary>
		[JsonProperty("team_trouble_name")]
		public string TeamTroubleName
		{
			get { return _teamTroubleName; }
			set { Set(() => TeamTroubleName, ref _teamTroubleName, value); }
		}

		[JsonProperty("side_trouble")]
		public Team SideTrouble
		{
			get { return _sideTrouble; }
			set { Set(() => SideTrouble, ref _sideTrouble, value); }
		}

		public int FlashbangThrownCount
		{
			get { return _flashbangThrownCount; }
			set { Set(() => FlashbangThrownCount, ref _flashbangThrownCount, value); }
		}

		[JsonProperty("round_smoke_count")]
		public int SmokeThrownCount
		{
			get { return _smokeThrownCount; }
			set { Set(() => SmokeThrownCount, ref _smokeThrownCount, value); }
		}

		[JsonProperty("round_he_count")]
		public int HeGrenadeThrownCount
		{
			get { return _heGrenadeThrownCount; }
			set { Set(() => HeGrenadeThrownCount, ref _heGrenadeThrownCount, value); }
		}

		[JsonProperty("round_decoy_count")]
		public int DecoyThrownCount
		{
			get { return _decoyThrownCount; }
			set { Set(() => DecoyThrownCount, ref _decoyThrownCount, value); }
		}

		[JsonProperty("round_molotov_count")]
		public int MolotovThrownCount
		{
			get { return _molotovThrownCount; }
			set { Set(() => MolotovThrownCount, ref _molotovThrownCount, value); }
		}

		[JsonProperty("round_incendiary_count")]
		public int IncendiaryThrownCount
		{
			get { return _incendiaryThrownCount; }
			set { Set(() => IncendiaryThrownCount, ref _incendiaryThrownCount, value); }
		}

		[JsonIgnore]
		public string EndReasonAsString
		{
			get
			{
				switch (EndReason)
				{
					case RoundEndReason.CTWin:
						return "Counter-Terrorists win";
					case RoundEndReason.TerroristWin:
						return "Terrorists win";
					case RoundEndReason.TargetBombed:
						return "Bomb exploded";
					case RoundEndReason.BombDefused:
						return "Bomb defused";
					case RoundEndReason.CTSurrender:
						return "CT surrender";
					case RoundEndReason.TerroristsSurrender:
						return "T surrender";
					default:
						return "Unknown";
				}
			}
		}

		/// <summary>
		/// List of all hits happened during the round
		/// </summary>
		[JsonProperty("players_hurted", IsReference = false)]
		public ObservableCollection<PlayerHurtedEvent> PlayersHurted
		{
			get { return _playerHurted; }
			set { Set(() => PlayersHurted, ref _playerHurted, value); }
		}

		/// <summary>
		/// Round duration (seconds)
		/// </summary>
		[JsonIgnore]
		public float Duration => EndTimeSeconds - StartTimeSeconds;

		[JsonIgnore]
		public DateTime StartTickTime => DateTime.Today;

		[JsonIgnore]
		public DateTime EndTickTime => DateTime.Today.AddSeconds(Duration);

		[JsonIgnore]
		public string WinnerSideAsString => _winnerSide == Team.CounterTerrorist ? "CT" : "T";

		[JsonIgnore]
		public int KillsCount => Kills.Count;

		[JsonIgnore]
		public string RoundTypeAsString
		{
			get
			{
				switch (Type)
				{
					case RoundType.ECO:
						return "Eco";
					case RoundType.FORCE_BUY:
						return "Force buy";
					case RoundType.SEMI_ECO:
						return "Semi-Eco";
					case RoundType.PISTOL_ROUND:
						return "Pistol round";
					default:
						return "Normal";
				}
			}
		}

		[JsonIgnore]
		public string SideTroubleAsString
		{
			get
			{
				switch (SideTrouble)
				{
					case Team.CounterTerrorist:
						return "CT";
					case Team.Terrorist:
						return "T";
					default:
						return string.Empty;
				}
			}
		}

		/// <summary>
		/// Total health damage during the round
		/// </summary>
		[JsonIgnore]
		public int TotalDamageHealthCount => PlayersHurted.Where(playerHurtedEvent => playerHurtedEvent.AttackerSteamId != 0)
			.Sum(playerHurtedEvent => playerHurtedEvent.HealthDamage);

		/// <summary>
		/// Total armor damage during the round
		/// </summary>
		[JsonIgnore]
		public int TotalDamageArmorCount => PlayersHurted.Where(playerHurtedEvent => playerHurtedEvent.AttackerSteamId != 0)
			.Sum(playerHurtedEvent => playerHurtedEvent.ArmorDamage);

		/// <summary>
		/// Average damage made by players during the round
		/// </summary>
		[JsonIgnore]
		public double AverageDamageByPlayerCount
		{
			get
			{
				double total = PlayersHurted.Aggregate<PlayerHurtedEvent, double>(0, (current, playerHurtedEvent) =>
				current + (playerHurtedEvent.ArmorDamage + playerHurtedEvent.HealthDamage));
				if (Math.Abs(total) < 0.1) return total;
				return Math.Round(total / 10, 1);
			}
		}

		[JsonIgnore]
		public int JumpKillCount => Kills.Count(killEvent => killEvent.KillerVelocityZ > 0);

		[JsonIgnore]
		public int CrouchKillCount => Kills.Count(killEvent => killEvent.IsKillerCrouching);

		/// <summary>
		/// Used for overview
		/// </summary>
		[JsonIgnore]
		public ObservableCollection<FlashbangExplodedEvent> FlashbangsExploded
		{
			get { return _flashbangsExploded; }
			set { Set(() => FlashbangsExploded, ref _flashbangsExploded, value); }
		}

		[JsonIgnore]
		public ObservableCollection<SmokeNadeStartedEvent> SmokesStarted
		{
			get { return _smokeNadeStarted; }
			set { Set(() => SmokesStarted, ref _smokeNadeStarted, value); }
		}

		[JsonIgnore]
		public ObservableCollection<ExplosiveNadeExplodedEvent> ExplosiveGrenadesExploded
		{
			get { return _explosiveGrenadesExploded; }
			set { Set(() => ExplosiveGrenadesExploded, ref _explosiveGrenadesExploded, value); }
		}

		[JsonIgnore]
		public ObservableCollection<MolotovFireEndedEvent> MolotovsThrown
		{
			get { return _molotovsThrown; }
			set { Set(() => MolotovsThrown, ref _molotovsThrown, value); }
		}
		// End overview properties

		#endregion

		#region Selected player data accessors

		[JsonIgnore]
		public int TotalKillSelectedPlayerCount
		{
			get { return Kills.Count(k => k.KillerSteamId == Settings.Default.SelectedPlayerSteamId); }
		}

		[JsonIgnore]
		public int JumpKillSelectedPlayerCount => Kills.Count(killEvent => killEvent.KillerSteamId == Settings.Default.SelectedPlayerSteamId && killEvent.KillerVelocityZ > 0);

		[JsonIgnore]
		public int OneKillSelectedPlayerCount
		{
			get
			{
				int killUserCount = Kills.Count(k => k.KillerSteamId == Settings.Default.SelectedPlayerSteamId);
				if (killUserCount == 1) return 1;
				return 0;
			}
		}

		[JsonIgnore]
		public int TwoKillSelectedPlayerCount
		{
			get
			{
				int killUserCount = Kills.Count(k => k.KillerSteamId == Settings.Default.SelectedPlayerSteamId);
				if (killUserCount == 2) return 1;
				return 0;
			}
		}

		[JsonIgnore]
		public int ThreeKillSelectedPlayerCount
		{
			get
			{
				int killUserCount = Kills.Count(k => k.KillerSteamId == Settings.Default.SelectedPlayerSteamId);
				if (killUserCount == 3) return 1;
				return 0;
			}
		}

		[JsonIgnore]
		public int FourKillSelectedPlayerCount
		{
			get
			{
				int killUserCount = Kills.Count(k => k.KillerSteamId == Settings.Default.SelectedPlayerSteamId);
				if (killUserCount == 4) return 1;
				return 0;
			}
		}

		[JsonIgnore]
		public int FiveKillSelectedPlayerCount
		{
			get
			{
				int killUserCount = Kills.Count(k => k.KillerSteamId == Settings.Default.SelectedPlayerSteamId);
				if (killUserCount == 5) return 1;
				return 0;
			}
		}

		[JsonIgnore]
		public int BombExplodedSelectedPlayerCount => BombExploded != null && BombExploded.PlanterSteamId == Settings.Default.SelectedPlayerSteamId ? 1 : 0;

		[JsonIgnore]
		public int BombPlantedSelectedPlayerCount => BombPlanted != null && BombPlanted.PlanterSteamId == Settings.Default.SelectedPlayerSteamId ? 1 : 0;

		[JsonIgnore]
		public int BombDefusedSelectedPlayerCount => BombDefused != null && BombDefused.DefuserSteamId == Settings.Default.SelectedPlayerSteamId ? 1 : 0;

		/// <summary>
		/// Damage (health + armor) made by the user during the round
		/// </summary>
		[JsonIgnore]
		public int TotalDamageSelectedPlayerCount => PlayersHurted.Where(playerHurtedEvent => playerHurtedEvent.AttackerSteamId != 0
		&& playerHurtedEvent.AttackerSteamId == Settings.Default.SelectedPlayerSteamId)
			.Sum(playerHurtedEvent => playerHurtedEvent.ArmorDamage + playerHurtedEvent.HealthDamage);

		/// <summary>
		/// Damage health made by the user during the round
		/// </summary>
		[JsonIgnore]
		public int TotalDamageHealthSelectedPlayerCount => PlayersHurted.Where(playerHurtedEvent => playerHurtedEvent.AttackerSteamId != 0 
		&& playerHurtedEvent.AttackerSteamId == Settings.Default.SelectedPlayerSteamId)
			.Sum(playerHurtedEvent => playerHurtedEvent.HealthDamage);

		/// <summary>
		/// Damage armor made by the user during the round
		/// </summary>
		[JsonIgnore]
		public int TotalDamageArmorSelectedPlayerCount => PlayersHurted.Where(playerHurtedEvent => playerHurtedEvent.AttackerSteamId != 0
		&& playerHurtedEvent.AttackerSteamId == Settings.Default.SelectedPlayerSteamId)
			.Sum(playerHurtedEvent => playerHurtedEvent.ArmorDamage);

		[JsonIgnore]
		public int CrouchKillSelectedPlayerCount => Kills.Count(e => e.KillerSteamId == Settings.Default.SelectedPlayerSteamId && e.IsKillerCrouching);

		#endregion

		public Round()
		{
			Kills.CollectionChanged += OnKillsCollectionChanged;
			PlayersHurted.CollectionChanged += OnPlayersHurtedCollectionChanged;
		}

		public override bool Equals(object obj)
		{
			var item = obj as Round;

			return item != null && Number.Equals(item.Number);
		}

		public override int GetHashCode()
		{
			return base.GetHashCode();
		}

		#region Handler collections changed

		private void OnKillsCollectionChanged(object sender, NotifyCollectionChangedEventArgs e)
		{
			RaisePropertyChanged(() => KillsCount);
			RaisePropertyChanged(() => TotalKillSelectedPlayerCount);
			RaisePropertyChanged(() => OneKillSelectedPlayerCount);
			RaisePropertyChanged(() => TwoKillSelectedPlayerCount);
			RaisePropertyChanged(() => ThreeKillSelectedPlayerCount);
			RaisePropertyChanged(() => FourKillSelectedPlayerCount);
			RaisePropertyChanged(() => FiveKillSelectedPlayerCount);
		}

		private void OnPlayersHurtedCollectionChanged(object sender, NotifyCollectionChangedEventArgs e)
		{
			if (Settings.Default.SelectedStatsAccountSteamID != 0)
			{
				RaisePropertyChanged(() => TotalDamageSelectedPlayerCount);
				RaisePropertyChanged(() => TotalDamageHealthSelectedPlayerCount);
				RaisePropertyChanged(() => TotalDamageArmorSelectedPlayerCount);
			}
			else
			{
				RaisePropertyChanged(() => TotalDamageHealthCount);
				RaisePropertyChanged(() => TotalDamageArmorCount);
				RaisePropertyChanged(() => AverageDamageByPlayerCount);
			}
		}

		#endregion
	}
}