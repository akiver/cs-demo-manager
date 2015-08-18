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
	public class Round : ObservableObject
	{
		#region Properties

		private int _number = 1;

		private int _tick;

		private int _equipementValueTeam2;

		private int _equipementValueTeam1;

		private int _startMoneyTeam1;

		private int _startMoneyTeam2;

		private string _winnerClanName = "Team 1";

		private Team _winner;

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

		private ObservableCollection<KillEvent> _kills = new ObservableCollection<KillEvent>();

		private ObservableCollection<FlashbangExplodedEvent> _flashbangsExploded = new ObservableCollection<FlashbangExplodedEvent>();

		private ObservableCollection<ExplosiveNadeExplodedEvent> _explosiveGrenadesExploded = new ObservableCollection<ExplosiveNadeExplodedEvent>();

		private ObservableCollection<SmokeNadeStartedEvent> _smokeNadeStarted = new ObservableCollection<SmokeNadeStartedEvent>();

		private ObservableCollection<MolotovFireEndedEvent> _molotovsThrowed = new ObservableCollection<MolotovFireEndedEvent>();

		/// <summary>
		/// Infos on bomb planted during the round
		/// </summary>
		private ObservableCollection<BombPlantedEvent> _bombPlanted = new ObservableCollection<BombPlantedEvent>();

		/// <summary>
		/// Infos on bomb defused during the round
		/// </summary>
		private ObservableCollection<BombDefusedEvent> _bombDefused = new ObservableCollection<BombDefusedEvent>();

		/// <summary>
		/// Infos on bomb exploded during the round
		/// </summary>
		private ObservableCollection<BombExplodedEvent> _bombExploded = new ObservableCollection<BombExplodedEvent>();

		private OpenKillEvent _openKillEvent;

		private EntryKillEvent _entryKillEvent;

		/// <summary>
		/// Infos on players damages made during the round
		/// </summary>
		private ObservableCollection<PlayerHurtedEvent> _playerHurted = new ObservableCollection<PlayerHurtedEvent>();

		#endregion

		#region Accessors

		[JsonProperty("kills")]
		public ObservableCollection<KillEvent> Kills
		{
			get { return _kills; }
			set { Set(() => Kills, ref _kills, value); }
		}

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
		public ObservableCollection<MolotovFireEndedEvent> MolotovsThrowed
		{
			get { return _molotovsThrowed; }
			set { Set(() => MolotovsThrowed, ref _molotovsThrowed, value); }
		}

		[JsonProperty("winner_clan_name")]
		public string WinnerClanName
		{
			get { return _winnerClanName; }
			set { Set(() => WinnerClanName, ref _winnerClanName, value); }
		}

		[JsonProperty("winner_team")]
		public Team Winner
		{
			get { return _winner; }
			set
			{
				Set(() => Winner, ref _winner, value);
				RaisePropertyChanged("WinnerAsString");
			}
		}

		[JsonProperty("winner_as_string")]
		public string WinnerAsString => _winner == Team.CounterTerrorist ? "CT" : "T";

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

		[JsonProperty("total_kill_count")]
		public int KillsCount => Kills.Count;

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

		[JsonProperty("bomb_planted_count")]
		public int BombPlantedCount => BombPlanted.Count;

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
		public int BombDefusedCount => BombDefused.Count;

		[JsonProperty("bomb_exploded_count")]
		public int BombExplodedCount => BombExploded.Count;

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

		[JsonProperty("bomb_planted")]
		public ObservableCollection<BombPlantedEvent> BombPlanted
		{
			get { return _bombPlanted; }
			set { Set(() => BombPlanted, ref _bombPlanted, value); }
		}

		[JsonProperty("bomb_defused")]
		public ObservableCollection<BombDefusedEvent> BombDefused
		{
			get { return _bombDefused; }
			set { Set(() => BombDefused, ref _bombDefused, value); }
		}

		[JsonProperty("bomb_exploded")]
		public ObservableCollection<BombExplodedEvent> BombExploded
		{
			get { return _bombExploded; }
			set { Set(() => BombExploded, ref _bombExploded, value); }
		}

		/// <summary>
		/// List of all hits happened during the round
		/// </summary>
		[JsonProperty("players_hurted")]
		public ObservableCollection<PlayerHurtedEvent> PlayersHurted
		{
			get { return _playerHurted; }
			set { Set(() => PlayersHurted, ref _playerHurted, value); }
		}

		/// <summary>
		/// Total health damage during the round
		/// </summary>
		[JsonIgnore]
		public int TotalDamageHealthCount => PlayersHurted.Where(playerHurtedEvent => playerHurtedEvent.Attacker != null)
			.Sum(playerHurtedEvent => playerHurtedEvent.HealthDamage);

		/// <summary>
		/// Total armor damage during the round
		/// </summary>
		[JsonIgnore]
		public int TotalDamageArmorCount => PlayersHurted.Where(playerHurtedEvent => playerHurtedEvent.Attacker != null)
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

		#endregion

		#region User data accessors

		[JsonIgnore]
		public int TotalKillUserCount
		{
			get { return Kills.Count(k => k.Killer.SteamId == Settings.Default.SteamID); }
		}

		[JsonIgnore]
		public int OneKillUserCount
		{
			get
			{
				int killUserCount = Kills.Count(k => k.Killer.SteamId == Settings.Default.SteamID);
				if (killUserCount == 1) return 1;
				return 0;
			}
		}

		[JsonIgnore]
		public int TwoKillUserCount
		{
			get
			{
				int killUserCount = Kills.Count(k => k.Killer.SteamId == Settings.Default.SteamID);
				if (killUserCount == 2) return 1;
				return 0;
			}
		}

		[JsonIgnore]
		public int ThreeKillUserCount
		{
			get
			{
				int killUserCount = Kills.Count(k => k.Killer.SteamId == Settings.Default.SteamID);
				if (killUserCount == 2) return 1;
				return 0;
			}
		}

		[JsonIgnore]
		public int FourKillUserCount
		{
			get
			{
				int killUserCount = Kills.Count(k => k.Killer.SteamId == Settings.Default.SteamID);
				if (killUserCount == 4) return 1;
				return 0;
			}
		}

		[JsonIgnore]
		public int FiveKillUserCount
		{
			get
			{
				int killUserCount = Kills.Count(k => k.Killer.SteamId == Settings.Default.SteamID);
				if (killUserCount == 5) return 1;
				return 0;
			}
		}

		[JsonIgnore]
		public int BombExplodedUserCount
		{
			get { return BombExploded.Count(b => b.Player.SteamId == Settings.Default.SteamID); }
		}

		[JsonIgnore]
		public int BombPlantedUserCount
		{
			get { return BombPlanted.Count(b => b.Player.SteamId == Settings.Default.SteamID); }
		}

		[JsonIgnore]
		public int BombDefusedUserCount
		{
			get { return BombDefused.Count(b => b.Player.SteamId == Settings.Default.SteamID); }
		}

		/// <summary>
		/// Damage (health + armor) made by the user during the round
		/// </summary>
		[JsonIgnore]
		public int TotalDamageUserCount => PlayersHurted.Where(playerHurtedEvent => playerHurtedEvent.Attacker != null && playerHurtedEvent.Attacker.SteamId == Settings.Default.SteamID)
			.Sum(playerHurtedEvent => playerHurtedEvent.ArmorDamage + playerHurtedEvent.HealthDamage);

		/// <summary>
		/// Damage health made by the user during the round
		/// </summary>
		[JsonIgnore]
		public int TotalDamageHealthUserCount => PlayersHurted.Where(playerHurtedEvent => playerHurtedEvent.Attacker != null && playerHurtedEvent.Attacker.SteamId == Settings.Default.SteamID)
			.Sum(playerHurtedEvent => playerHurtedEvent.HealthDamage);

		/// <summary>
		/// Damage armor made by the user during the round
		/// </summary>
		[JsonIgnore]
		public int TotalDamageArmorUserCount => PlayersHurted.Where(playerHurtedEvent => playerHurtedEvent.Attacker != null && playerHurtedEvent.Attacker.SteamId == Settings.Default.SteamID)
			.Sum(playerHurtedEvent => playerHurtedEvent.ArmorDamage);

		#endregion

		public Round()
		{
			Kills.CollectionChanged += OnKillsCollectionChanged;
			BombPlanted.CollectionChanged += OnBombPlantedCollectionChanged;
			BombDefused.CollectionChanged += OnBombDefusedCollectionChanged;
			BombExploded.CollectionChanged += OnBombExplodedCollectionChanged;
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
			RaisePropertyChanged("KillsCount");
			RaisePropertyChanged("TotalKillUserCount");
			RaisePropertyChanged("OneKillUserCount");
			RaisePropertyChanged("TwoKillUserCount");
			RaisePropertyChanged("ThreeKillUserCount");
			RaisePropertyChanged("FourKillUserCount");
			RaisePropertyChanged("FiveKillUserCount");
		}

		private void OnBombPlantedCollectionChanged(object sender, NotifyCollectionChangedEventArgs e)
		{
			RaisePropertyChanged("BombPlantedCount");
			RaisePropertyChanged("BombPlantedUserCount");
		}

		private void OnBombDefusedCollectionChanged(object sender, NotifyCollectionChangedEventArgs e)
		{
			RaisePropertyChanged("BombDefusedCount");
			RaisePropertyChanged("BombDefusedUserCount");
		}

		private void OnBombExplodedCollectionChanged(object sender, NotifyCollectionChangedEventArgs e)
		{
			RaisePropertyChanged("BombExplodedCount");
			RaisePropertyChanged("BombExplodedUserCount");
		}

		private void OnPlayersHurtedCollectionChanged(object sender, NotifyCollectionChangedEventArgs e)
		{
			if (Settings.Default.ShowOnlyUserStats)
			{
				RaisePropertyChanged("TotalDamageUserCount");
				RaisePropertyChanged("TotalDamageHealthUserCount");
				RaisePropertyChanged("TotalDamageArmorUserCount");
			}
			else
			{
				RaisePropertyChanged("TotalDamageHealthCount");
				RaisePropertyChanged("TotalDamageArmorCount");
				RaisePropertyChanged("AverageDamageByPlayerCount");
			}
		}

		#endregion
	}
}