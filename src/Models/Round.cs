using CSGO_Demos_Manager.Models.Events;
using GalaSoft.MvvmLight;
using Newtonsoft.Json;
using System.Collections.ObjectModel;
using DemoInfo;

namespace CSGO_Demos_Manager.Models
{
	public class Round : ObservableObject
	{
		#region Properties

		private int _number = 1;

		private int _tick;

		private int _bombPlantCount;

		private int _bombDefusedCount;

		private int _bombExplodedCount;

		private int _equipementValueTeam2;

		private int _equipementValueTeam1;

		private int _startMoneyTeam1;

		private int _startMoneyTeam2;

		private int _killsCount;

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

		private OpenKillEvent _openKillEvent;

		private EntryKillEvent _entryKillEvent;

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
		public int KillsCount
		{
			get { return _kills.Count; }
			set { Set(() => KillsCount, ref _killsCount, value); }
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

		[JsonProperty("bomb_planted_count")]
		public int BombPlantedCount
		{
			get { return _bombPlantCount; }
			set { Set(() => BombPlantedCount, ref _bombPlantCount, value); }
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

		#endregion

		public override bool Equals(object obj)
		{
			var item = obj as Round;

			return item != null && Number.Equals(item.Number);
		}

		public override int GetHashCode()
		{
			return base.GetHashCode();
		}
	}
}