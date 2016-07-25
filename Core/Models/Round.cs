using System;
using GalaSoft.MvvmLight;
using Newtonsoft.Json;
using System.Collections.ObjectModel;
using System.Collections.Specialized;
using System.Linq;
using Core.Models.Events;
using DemoInfo;

namespace Core.Models
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
		private DemoInfo.Team _winnerSide;

		/// <summary>
		/// Refers to the side currently on eco / semi-eco or force buy
		/// </summary>
		private DemoInfo.Team _sideTrouble;

		/// <summary>
		/// Round's type (pistol round, eco...)
		/// </summary>
		private RoundType _type;

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
		/// Total kill count during the round
		/// </summary>
		private int _killCount;

		/// <summary>
		/// Total jump kill during the round
		/// </summary>
		private int _jumpKillCount;

		/// <summary>
		/// Total crouch kill during the round
		/// </summary>
		private int _crouchKillCount;

		/// <summary>
		/// Total trade kill during the round
		/// </summary>
		private int _tradeKillCount;

		/// <summary>
		/// Total smoke thrown during the round
		/// </summary>
		private int _smokeThrownCount;

		/// <summary>
		/// Total flashbang thrown during the round
		/// </summary>
		private int _flashbangThrownCount;

		/// <summary>
		/// Total decoy thrown during the round
		/// </summary>
		private int _decoyThrownCount;

		/// <summary>
		/// Total molotov thrown during the round
		/// </summary>
		private int _molotovThrownCount;

		/// <summary>
		/// Total incendiary thrown during the round
		/// </summary>
		private int _incendiaryThrownCount;

		/// <summary>
		/// Total HE Grenade thrown during the round
		/// </summary>
		private int _heThrownCount;

		/// <summary>
		/// Total health damage done during the round
		/// </summary>
		private int _damageHealthCount;

		/// <summary>
		/// Total armor damage done during the round
		/// </summary>
		private int _damageArmorCount;

		/// <summary>
		/// Average health damage per player done during the round
		/// </summary>
		private double _averageHealthDamagePerPlayer;

		/// <summary>
		/// Total bomb defused
		/// </summary>
		private int _bombDefusedCount;

		/// <summary>
		/// Total bomb planted
		/// </summary>
		private int _bombPlantedCount;

		/// <summary>
		/// Total bomb exploded
		/// </summary>
		private int _bombExplodedCount;

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
		/// Infos on the round's entry kill (first kill as T)
		/// </summary>
		private EntryKillEvent _entryKillEvent;

		/// <summary>
		/// Infos on the round's entry hold (first kill as CT)
		/// </summary>
		private EntryHoldKillEvent _entryHoldKillEvent;

		/// <summary>
		/// Kills done during the round
		/// </summary>
		private ObservableCollection<KillEvent> _kills;

		/// <summary>
		/// Infos about flashbangs exploded events
		/// </summary>
		private ObservableCollection<FlashbangExplodedEvent> _flashbangsExploded;

		/// <summary>
		/// Infos about HE Grenades that exploded during the round
		/// </summary>
		private ObservableCollection<ExplosiveNadeExplodedEvent> _explosiveGrenadesExploded;

		/// <summary>
		/// Infos about smokes poped during the round
		/// </summary>
		private ObservableCollection<SmokeNadeStartedEvent> _smokeStarted;

		/// <summary>
		/// Infos on players damages made during the round
		/// </summary>
		private ObservableCollection<PlayerHurtedEvent> _playerHurted;

		/// <summary>
		/// Infos about shoots done during the round
		/// </summary>
		private ObservableCollection<WeaponFireEvent> _weaponFired;

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

		[JsonIgnore]
		public RoundEndReason EndReason
		{
			get { return _endReason; }
			set
			{
				Set(() => EndReason, ref _endReason, value);
				RaisePropertyChanged(() => EndReasonAsString);
			}
		}

		[JsonProperty("kills", IsReference = false)]
		public ObservableCollection<KillEvent> Kills
		{
			get { return _kills; }
			set { Set(() => Kills, ref _kills, value); }
		}

		[JsonProperty("winner_side")]
		public DemoInfo.Team WinnerSide
		{
			get { return _winnerSide; }
			set { Set(() => WinnerSide, ref _winnerSide, value); }
		}

		[JsonProperty("winner_name")]
		public string WinnerName
		{
			get { return _winnerName; }
			set { Set(() => WinnerName, ref _winnerName, value); }
		}

		[JsonProperty("kill_count")]
		public int KillCount
		{
			get { return _killCount; }
			set { Set(() => KillCount, ref _killCount, value); }
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

		[JsonProperty("jump_kill_count")]
		public int JumpKillCount
		{
			get { return _jumpKillCount; }
			set { Set(() => JumpKillCount, ref _jumpKillCount, value); }
		}

		[JsonProperty("crouch_kill_count")]
		public int CrouchKillCount
		{
			get { return _crouchKillCount; }
			set { Set(() => CrouchKillCount, ref _crouchKillCount, value); }
		}

		[JsonProperty("trade_kill_count")]
		public int TradeKillCount
		{
			get { return _tradeKillCount; }
			set { Set(() => TradeKillCount, ref _tradeKillCount, value); }
		}

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

		[JsonProperty("entry_kill")]
		public EntryKillEvent EntryKillEvent
		{
			get { return _entryKillEvent; }
			set { Set(() => EntryKillEvent, ref _entryKillEvent, value); }
		}

		[JsonProperty("entry_hold_kill")]
		public EntryHoldKillEvent EntryHoldKillEvent
		{
			get { return _entryHoldKillEvent; }
			set { Set(() => EntryHoldKillEvent, ref _entryHoldKillEvent, value); }
		}

		[JsonProperty("bomb_planted", IsReference = false)]
		public BombPlantedEvent BombPlanted
		{
			get { return _bombPlanted; }
			set
			{
				Set(() => BombPlanted, ref _bombPlanted, value);
				BombPlantedCount++;
			}
		}

		[JsonProperty("bomb_defused", IsReference = false)]
		public BombDefusedEvent BombDefused
		{
			get { return _bombDefused; }
			set
			{
				Set(() => BombDefused, ref _bombDefused, value);
				BombDefusedCount++;
			}
		}

		[JsonProperty("bomb_exploded", IsReference = false)]
		public BombExplodedEvent BombExploded
		{
			get { return _bombExploded; }
			set
			{
				Set(() => BombExploded, ref _bombExploded, value);
				BombExplodedCount++;
			}
		}

		[JsonProperty("type")]
		public RoundType Type
		{
			get { return _type; }
			set
			{
				Set(() => Type, ref _type, value);
				RaisePropertyChanged(() => RoundTypeAsString);
			}
		}

		[JsonProperty("team_trouble_name")]
		public string TeamTroubleName
		{
			get { return _teamTroubleName; }
			set { Set(() => TeamTroubleName, ref _teamTroubleName, value); }
		}

		[JsonIgnore]
		public DemoInfo.Team SideTrouble
		{
			get { return _sideTrouble; }
			set
			{
				Set(() => SideTrouble, ref _sideTrouble, value);
				RaisePropertyChanged(() => SideTroubleAsString);
			}
		}

		[JsonProperty("flashbang_thrown_count")]
		public int FlashbangThrownCount
		{
			get { return _flashbangThrownCount; }
			set { Set(() => FlashbangThrownCount, ref _flashbangThrownCount, value); }
		}

		[JsonProperty("smoke_thrown_count")]
		public int SmokeThrownCount
		{
			get { return _smokeThrownCount; }
			set { Set(() => SmokeThrownCount, ref _smokeThrownCount, value); }
		}

		[JsonProperty("he_thrown_count")]
		public int HeGrenadeThrownCount
		{
			get { return _heThrownCount; }
			set { Set(() => HeGrenadeThrownCount, ref _heThrownCount, value); }
		}

		[JsonProperty("decoy_thrown_count")]
		public int DecoyThrownCount
		{
			get { return _decoyThrownCount; }
			set { Set(() => DecoyThrownCount, ref _decoyThrownCount, value); }
		}

		[JsonProperty("molotov_thrown_count")]
		public int MolotovThrownCount
		{
			get { return _molotovThrownCount; }
			set { Set(() => MolotovThrownCount, ref _molotovThrownCount, value); }
		}

		[JsonProperty("incendiary_thrown_count")]
		public int IncendiaryThrownCount
		{
			get { return _incendiaryThrownCount; }
			set { Set(() => IncendiaryThrownCount, ref _incendiaryThrownCount, value); }
		}

		[JsonProperty("end_reason")]
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
					case RoundEndReason.TargetSaved:
						return "Time over";
					default:
						return "Unknown";
				}
			}
		}

		[JsonProperty("players_hurted", IsReference = false)]
		public ObservableCollection<PlayerHurtedEvent> PlayersHurted
		{
			get { return _playerHurted; }
			set { Set(() => PlayersHurted, ref _playerHurted, value); }
		}

		[JsonProperty("weapon_fired", IsReference = false)]
		public ObservableCollection<WeaponFireEvent> WeaponFired
		{
			get { return _weaponFired; }
			set { Set(() => WeaponFired, ref _weaponFired, value); }
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

		[JsonProperty("type_as_string")]
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

		[JsonProperty("side_trouble")]
		public string SideTroubleAsString
		{
			get
			{
				switch (SideTrouble)
				{
					case DemoInfo.Team.CounterTerrorist:
						return "CT";
					case DemoInfo.Team.Terrorist:
						return "T";
					default:
						return string.Empty;
				}
			}
		}

		[JsonProperty("damage_health_count")]
		public int DamageHealthCount
		{
			get { return _damageHealthCount; }
			set { Set(() => DamageHealthCount, ref _damageHealthCount, value); }
		}

		[JsonProperty("damage_armor_count")]
		public int DamageArmorCount
		{
			get { return _damageArmorCount; }
			set { Set(() => DamageArmorCount, ref _damageArmorCount, value); }
		}

		[JsonProperty("average_health_damage_per_player")]
		public double AverageHealthDamagePerPlayer
		{
			get { return _averageHealthDamagePerPlayer; }
			set { Set(() => AverageHealthDamagePerPlayer, ref _averageHealthDamagePerPlayer, value); }
		}

		[JsonProperty("flashbangs_exploded")]
		public ObservableCollection<FlashbangExplodedEvent> FlashbangsExploded
		{
			get { return _flashbangsExploded; }
			set { Set(() => FlashbangsExploded, ref _flashbangsExploded, value); }
		}

		[JsonProperty("smokes_started")]
		public ObservableCollection<SmokeNadeStartedEvent> SmokeStarted
		{
			get { return _smokeStarted; }
			set { Set(() => SmokeStarted, ref _smokeStarted, value); }
		}

		[JsonProperty("he_exploded")]
		public ObservableCollection<ExplosiveNadeExplodedEvent> ExplosiveGrenadesExploded
		{
			get { return _explosiveGrenadesExploded; }
			set { Set(() => ExplosiveGrenadesExploded, ref _explosiveGrenadesExploded, value); }
		}

		#endregion

		public Round()
		{
			PlayersHurted = new ObservableCollection<PlayerHurtedEvent>();
			WeaponFired = new ObservableCollection<WeaponFireEvent>();
			ExplosiveGrenadesExploded = new ObservableCollection<ExplosiveNadeExplodedEvent>();
			SmokeStarted = new ObservableCollection<SmokeNadeStartedEvent>();
			FlashbangsExploded = new ObservableCollection<FlashbangExplodedEvent>();
			Kills = new ObservableCollection<KillEvent>();

			Kills.CollectionChanged += OnKillsCollectionChanged;
			PlayersHurted.CollectionChanged += OnPlayersHurtedCollectionChanged;
			WeaponFired.CollectionChanged += OnWeaponFiredCollectionChanged;
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
			KillCount = Kills.Count;
			JumpKillCount = Kills.Count(killEvent => killEvent.KillerVelocityZ > 0);
			CrouchKillCount = Kills.Count(killEvent => killEvent.IsKillerCrouching);
			TradeKillCount = Kills.Count(k => k.IsTradeKill);
			
			var kills = Kills.Where(k => k.KillerSide != k.KilledSide && k.KillerSteamId != 0)
				.GroupBy(k => k.KillerSteamId)
				.Select(group => new
				{
					SteamId = group.Key,
					KillCount = group.Count()
				}).ToList();
			OneKillCount = kills.Count(k => k.KillCount == 1);
			TwoKillCount = kills.Count(k => k.KillCount == 2);
			ThreeKillCount = kills.Count(k => k.KillCount == 3);
			FourKillCount = kills.Count(k => k.KillCount == 4);
			FiveKillCount = kills.Count(k => k.KillCount == 5);
		}

		private void OnPlayersHurtedCollectionChanged(object sender, NotifyCollectionChangedEventArgs e)
		{
			DamageHealthCount = PlayersHurted.Where(playerHurtedEvent => playerHurtedEvent.AttackerSteamId != 0)
				.Sum(playerHurtedEvent => playerHurtedEvent.HealthDamage);
			DamageArmorCount = PlayersHurted.Where(playerHurtedEvent => playerHurtedEvent.AttackerSteamId != 0)
				.Sum(playerHurtedEvent => playerHurtedEvent.ArmorDamage);
			AverageHealthDamagePerPlayer = GetAverageHealthDamagePerPlayer();
		}

		private void OnWeaponFiredCollectionChanged(object sender, NotifyCollectionChangedEventArgs e)
		{
			IncendiaryThrownCount = WeaponFired.Count(w => w.Weapon.Element == EquipmentElement.Incendiary);
			MolotovThrownCount = WeaponFired.Count(w => w.Weapon.Element == EquipmentElement.Molotov);
			DecoyThrownCount = WeaponFired.Count(w => w.Weapon.Element == EquipmentElement.Decoy);
			HeGrenadeThrownCount = WeaponFired.Count(w => w.Weapon.Element == EquipmentElement.HE);
			SmokeThrownCount = WeaponFired.Count(w => w.Weapon.Element == EquipmentElement.Smoke);
			FlashbangThrownCount = WeaponFired.Count(w => w.Weapon.Element == EquipmentElement.Flash);
		}

		#endregion

		private double GetAverageHealthDamagePerPlayer()
		{
			double total = PlayersHurted.Aggregate<PlayerHurtedEvent, double>(0, (current, playerHurtedEvent) =>
					current + playerHurtedEvent.HealthDamage);
			if (Math.Abs(total) < 0.1) return total;
			return Math.Round(total / 10, 1);
		}
	}
}