using DemoInfo;
using GalaSoft.MvvmLight;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Collections.Specialized;
using System.Linq;
using CSGO_Demos_Manager.Models.Events;

namespace CSGO_Demos_Manager.Models
{
	/// <summary>
	/// Represent a player
	/// </summary>
	public class PlayerExtended : ObservableObject
	{
		#region Properties

		/// <summary>
		/// Number of 1 Kill that the player made during the match
		/// </summary>
		private int _onekillCount;

		/// <summary>
		/// Number of 2 kills that the player made during the match
		/// </summary>
		private int _twokillCount;

		/// <summary>
		/// Number of 3 kills that the player made during the match
		/// </summary>
		private int _threekillCount;

		/// <summary>
		/// Number of 4 kills that the player made during the match
		/// </summary>
		private int _fourKillCount;

		/// <summary>
		/// Number of 5 kills that the player made during the match
		/// </summary>
		private int _fiveKillCount;

		/// <summary>
		/// Number of heashots that the player made during the match
		/// </summary>
		private int _headshotCount;

		/// <summary>
		/// Number of assists that the player made during the match
		/// </summary>
		private int _assistCount;

		/// <summary>
		/// Number of deaths that the player had during the match
		/// </summary>
		private int _deathCount;

		/// <summary>
		/// Total number of kills that the player made during the match
		/// </summary>
		private int _killCount;

		/// <summary>
		/// Number of kills that the player made while crouching
		/// </summary>
		private int _crouchKillCount;

		/// <summary>
		/// Number of kills that the player made when is wasn't on the floor
		/// </summary>
		private int _jumpKillCount;

		/// <summary>
		/// Number of teamkill that the player made during the match
		/// </summary>
		private int _teamKillCount;

		/// <summary>
		/// Number MVP that the player had during the match
		/// </summary>
		private int _roundMvpCount;

		/// <summary>
		/// Number of bomb which the player had planted during the match
		/// </summary>
		private int _bombPlantedCount;

		/// <summary>
		/// Number of bomb which the player had defused during the match
		/// </summary>
		private int _bombDefusedCount;

		/// <summary>
		/// Number of bomb exploded which was planted by the player
		/// </summary>
		private int _bombExplodedCount;

		/// <summary>
		/// Score of the player (calculated by the game)
		/// </summary>
		private int _score;

		/// <summary>
		/// Indicate if the player is controlling a BOT
		/// </summary>
		private bool _isControllingBot;

		/// <summary>
		/// Indicate if the player is alive
		/// </summary>
		private bool _isAlive = true;

		private bool _isConnected = true;

		/// <summary>
		/// Player kills / Deaths ratio
		/// </summary>
		private decimal _killsDeathsRatio;

		/// <summary>
		/// Player's current team side (change when half side is over)
		/// </summary>
		private Team _side;

		private string _teamName;

		/// <summary>
		/// Player's SteamID 64
		/// </summary>
		private long _steamId;

		/// <summary>
		/// Player's nickname used when he was playing
		/// </summary>
		private string _name = "";

		/// <summary>
		/// Flag to know if the player had an entry kill during a round
		/// </summary>
		private bool _hasEntryKill;

		/// <summary>
		/// Flag to know if the player had an entry hold kill during a round
		/// </summary>
		private bool _hasEntryHoldKill;

		/// <summary>
		/// Rating based on hltv.org formula that the player made during the match
		/// </summary>
		private float _ratingHltv;

		private decimal _eseaRwsPointCount = 0;

		private decimal _eseaRws;

		/// <summary>
		/// Indicates if the player has the bomb, used for the overview animation
		/// </summary>
		private bool _hasBomb = false;

		/// <summary>
		/// Indicates if the player has been VAC banned
		/// </summary>
		private bool _isVacBanned;

		/// <summary>
		/// Indicates if the player has been overwatch banned
		/// </summary>
		private bool _isOverwatchBanned;

		private int _rankNumberOld = 0;

		private int _rankNumberNew = 0;

		private int _winCount = 0;

		private int _tradeKillCount;

		private int _tradeDeathCount;

		/// <summary>
		/// Number of flashbang thrown by the player
		/// </summary>
		private int _flashbangThrownCount;

		/// <summary>
		/// Number of smoke thrown by the player
		/// </summary>
		private int _smokeThrownCount;

		/// <summary>
		/// Number of HE Grenade thrown by the player
		/// </summary>
		private int _heGrenadeThrowCount;

		/// <summary>
		/// Number of molotov thrown by the player
		/// </summary>
		private int _molotovThrownCount;

		/// <summary>
		/// Number of incendiary thrown by the player
		/// </summary>
		private int _incendiaryThrowCount;

		/// <summary>
		/// Number of decoy thrown by the player
		/// </summary>
		private int _decoyThrownCount;

		/// <summary>
		/// Number of round that the player played
		/// </summary>
		private int _roundPlayedCount = 0;

		/// <summary>
		/// Avatar URL of the player (get from Steam API)
		/// </summary>
		private string _avatarUrl = "../resources/images/avatar.jpg";

		/// <summary>
		/// Temp variable to calculate flash duration
		/// </summary>
		private float _flashDurationTemp = 0;

		/// <summary>
		/// Start money the player had at each rounds
		/// </summary>
		private Dictionary<int, int> _startMoneyRounds = new Dictionary<int, int>();

		/// <summary>
		/// Equipement value the player at each round
		/// </summary>
		private Dictionary<int, int> _equipementValueRounds = new Dictionary<int, int>();

		/// <summary>
		/// Money earned at each round
		/// </summary>
		private Dictionary<int, int> _roundsMoneyEarned = new Dictionary<int, int>();

		#endregion

		#region Accessors

		[JsonProperty("steamid")]
		public long SteamId
		{
			get { return _steamId; }
			set { Set(() => SteamId, ref _steamId, value); }
		}

		[JsonProperty("name")]
		public string Name
		{
			get { return _name; }
			set { Set(() => Name, ref _name, value); }
		}

		[JsonProperty("kill_count")]
		public int KillsCount
		{
			get { return _killCount; }
			set
			{
				RaisePropertyChanged(() => KillDeathRatio);
				Set(() => KillsCount, ref _killCount, value);
			}
		}

		[JsonProperty("crouch_kill_count")]
		public int CrouchKillCount
		{
			get { return _crouchKillCount; }
			set { Set(() => CrouchKillCount, ref _crouchKillCount, value); }
		}

		[JsonProperty("jump_kill_count")]
		public int JumpKillCount
		{
			get { return _jumpKillCount; }
			set { Set(() => JumpKillCount, ref _jumpKillCount, value); }
		}

		[JsonProperty("score")]
		public int Score
		{
			get { return _score; }
			set { Set(() => Score, ref _score, value); }
		}

		[JsonProperty("tk_count")]
		public int TeamKillCount
		{
			get { return _teamKillCount; }
			set { Set(() => TeamKillCount, ref _teamKillCount, value); }
		}

		[JsonProperty("assist_count")]
		public int AssistCount
		{
			get { return _assistCount; }
			set { Set(() => AssistCount, ref _assistCount, value); }
		}

		[JsonProperty("trade_kill_count")]
		public int TradeKillCount
		{
			get { return _tradeKillCount; }
			set { Set(() => TradeKillCount, ref _tradeKillCount, value); }
		}

		[JsonProperty("trade_death_count")]
		public int TradeDeathCount
		{
			get { return _tradeDeathCount; }
			set { Set(() => TradeDeathCount, ref _tradeDeathCount, value); }
		}

		[JsonProperty("bomb_planted_count")]
		public int BombPlantedCount
		{
			get { return _bombPlantedCount; }
			set { Set(() => BombPlantedCount, ref _bombPlantedCount, value); }
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

		[JsonProperty("death_count")]
		public int DeathCount
		{
			get { return _deathCount; }
			set
			{
				RaisePropertyChanged(() => KillDeathRatio);
				Set(() => DeathCount, ref _deathCount, value);
			}
		}

		[JsonProperty("5k_count")]
		public int FiveKillCount
		{
			get { return _fiveKillCount; }
			set { Set(() => FiveKillCount, ref _fiveKillCount, value); }
		}

		[JsonProperty("4k_count")]
		public int FourKillCount
		{
			get { return _fourKillCount; }
			set { Set(() => FourKillCount, ref _fourKillCount, value); }
		}

		[JsonProperty("3k_count")]
		public int ThreekillCount
		{
			get { return _threekillCount; }
			set { Set(() => ThreekillCount, ref _threekillCount, value); }
		}

		[JsonProperty("2k_count")]
		public int TwokillCount
		{
			get { return _twokillCount; }
			set { Set(() => TwokillCount, ref _twokillCount, value); }
		}

		[JsonProperty("1k_count")]
		public int OnekillCount
		{
			get { return _onekillCount; }
			set { Set(() => OnekillCount, ref _onekillCount, value); }
		}

		[JsonProperty("hs_count")]
		public int HeadshotCount
		{
			get { return _headshotCount; }
			set { Set(() => HeadshotCount, ref _headshotCount, value); }
		}

		[JsonProperty("kd")]
		public decimal KillDeathRatio
		{
			get
			{
				if (_killCount != 0 && _deathCount != 0) return Math.Round(_killCount / (decimal)_deathCount, 2);
				return 0;
			}
			set { Set(() => KillDeathRatio, ref _killsDeathsRatio, value); }
		}

		[JsonProperty("mvp_count")]
		public int RoundMvpCount
		{
			get { return _roundMvpCount; }
			set { Set(() => RoundMvpCount, ref _roundMvpCount, value); }
		}

		[JsonProperty("rating")]
		public float RatingHltv
		{
			get { return _ratingHltv; }
			set { Set(() => RatingHltv, ref _ratingHltv, value); }
		}

		[JsonIgnore]
		public decimal EseaRwsPointCount
		{
			get { return _eseaRwsPointCount; }
			set { Set(() => EseaRwsPointCount, ref _eseaRwsPointCount, value); }
		}

		[JsonProperty("esea_rws")]
		public decimal EseaRws
		{
			get { return _eseaRws; }
			set { Set(() => EseaRws, ref _eseaRws, value); }
		}

		[JsonProperty("is_vac_banned")]
		public bool IsVacBanned
		{
			get { return _isVacBanned; }
			set { Set(() => IsVacBanned, ref _isVacBanned, value); }
		}

		[JsonProperty("is_ow_banned")]
		public bool IsOverwatchBanned
		{
			get { return _isOverwatchBanned; }
			set { Set(() => IsOverwatchBanned, ref _isOverwatchBanned, value); }
		}

		[JsonProperty("flashbang_count")]
		public int FlashbangThrownCount
		{
			get { return _flashbangThrownCount; }
			set { Set(() => FlashbangThrownCount, ref _flashbangThrownCount, value); }
		}

		[JsonProperty("smoke_count")]
		public int SmokeThrownCount
		{
			get { return _smokeThrownCount; }
			set { Set(() => SmokeThrownCount, ref _smokeThrownCount, value); }
		}

		[JsonProperty("he_count")]
		public int HeGrenadeThrownCount
		{
			get { return _heGrenadeThrowCount; }
			set { Set(() => HeGrenadeThrownCount, ref _heGrenadeThrowCount, value); }
		}

		[JsonProperty("molotov_count")]
		public int MolotovThrownCount
		{
			get { return _molotovThrownCount; }
			set { Set(() => MolotovThrownCount, ref _molotovThrownCount, value); }
		}

		[JsonProperty("incendiary_count")]
		public int IncendiaryThrownCount
		{
			get { return _incendiaryThrowCount; }
			set { Set(() => IncendiaryThrownCount, ref _incendiaryThrowCount, value); }
		}

		[JsonProperty("decoy_count")]
		public int DecoyThrownCount
		{
			get { return _decoyThrownCount; }
			set { Set(() => DecoyThrownCount, ref _decoyThrownCount, value); }
		}

		[JsonProperty("round_count")]
		public int RoundPlayedCount
		{
			get { return _roundPlayedCount; }
			set { Set(() => RoundPlayedCount, ref _roundPlayedCount, value); }
		}

		[JsonProperty("team_name")]
		public string TeamName
		{
			get { return _teamName; }
			set { Set(() => TeamName, ref _teamName, value); }
		}

		[JsonProperty("start_money_rounds")]
		public Dictionary<int, int> StartMoneyRounds
		{
			get { return _startMoneyRounds; }
			set { Set(() => StartMoneyRounds, ref _startMoneyRounds, value); }
		}

		[JsonProperty("equipement_value_rounds")]
		public Dictionary<int, int> EquipementValueRounds
		{
			get { return _equipementValueRounds; }
			set { Set(() => EquipementValueRounds, ref _equipementValueRounds, value); }
		}

		[JsonProperty("rounds_money_earned")]
		public Dictionary<int, int> RoundsMoneyEarned
		{
			get { return _roundsMoneyEarned; }
			set { Set(() => RoundsMoneyEarned, ref _roundsMoneyEarned, value); }
		}

		[JsonProperty("entry_kills")]
		public ObservableCollection<EntryKillEvent> EntryKills { get; set; }

		[JsonProperty("entry_hold_kills")]
		public ObservableCollection<EntryHoldKillEvent> EntryHoldKills { get; set; }

		/// <summary>
		/// List of PlayerHurtedEvent in which the player is involved
		/// </summary>
		[JsonProperty("players_hurted")]
		public ObservableCollection<PlayerHurtedEvent> PlayersHurted { get; set; }

		[JsonProperty("clutches")]
		public ObservableCollection<ClutchEvent> Clutches { get; set; }

		[JsonProperty("rank_old")]
		public int RankNumberOld
		{
			get { return _rankNumberOld; }
			set { Set(() => RankNumberOld, ref _rankNumberOld, value); }
		}

		[JsonProperty("rank_new")]
		public int RankNumberNew
		{
			get { return _rankNumberNew; }
			set { Set(() => RankNumberNew, ref _rankNumberNew, value); }
		}

		[JsonProperty("win_count")]
		public int WinCount
		{
			get { return _winCount; }
			set { Set(() => WinCount, ref _winCount, value); }
		}

		[JsonIgnore]
		public int EntryKillWonCount
		{
			get { return EntryKills.Count(e => e.HasWon); }
		}

		[JsonIgnore]
		public int EntryKillLossCount
		{
			get { return EntryKills.Count(e => e.HasWon == false); }
		}

		[JsonIgnore]
		public int EntryHoldKillWonCount
		{
			get { return EntryHoldKills.Count(e => e.HasWon); }
		}

		[JsonIgnore]
		public int EntryHoldKillLossCount
		{
			get { return EntryHoldKills.Count(e => e.HasWon == false); }
		}

		[JsonIgnore]
		public string AvatarUrl
		{
			get { return _avatarUrl; }
			set { Set(() => AvatarUrl, ref _avatarUrl, value); }
		}

		[JsonIgnore]
		public bool HasEntryKill
		{
			get { return _hasEntryKill; }
			set { Set(() => HasEntryKill, ref _hasEntryKill, value); }
		}

		[JsonIgnore]
		public bool HasEntryHoldKill
		{
			get { return _hasEntryHoldKill; }
			set { Set(() => HasEntryHoldKill, ref _hasEntryHoldKill, value); }
		}

		[JsonIgnore]
		public int ClutchCount => Clutches.Count;

		[JsonIgnore]
		public int ClutchLostCount => Clutches.Count(c => !c.HasWon);

		[JsonIgnore]
		public int ClutchWonCount => Clutches.Count(c => c.HasWon);

		[JsonIgnore]
		public int Clutch1V1WonCount => Clutches.Count(c => c.OpponentCount == 1 && c.HasWon);

		[JsonIgnore]
		public int Clutch1V2WonCount => Clutches.Count(c => c.OpponentCount == 2 && c.HasWon);

		[JsonIgnore]
		public int Clutch1V3WonCount => Clutches.Count(c => c.OpponentCount == 3 && c.HasWon);

		[JsonIgnore]
		public int Clutch1V4WonCount => Clutches.Count(c => c.OpponentCount == 4 && c.HasWon);

		[JsonIgnore]
		public int Clutch1V5WonCount => Clutches.Count(c => c.OpponentCount == 5 && c.HasWon);

		[JsonIgnore]
		public int Clutch1V1LossCount => Clutches.Count(c => c.OpponentCount == 1 && !c.HasWon);

		[JsonIgnore]
		public int Clutch1V2LossCount => Clutches.Count(c => c.OpponentCount == 2 && !c.HasWon);

		[JsonIgnore]
		public int Clutch1V3LossCount => Clutches.Count(c => c.OpponentCount == 3 && !c.HasWon);

		[JsonIgnore]
		public int Clutch1V4LossCount => Clutches.Count(c => c.OpponentCount == 4 && !c.HasWon);

		[JsonIgnore]
		public int Clutch1V5LossCount => Clutches.Count(c => c.OpponentCount == 5 && !c.HasWon);

		[JsonIgnore]
		public int Clutch1V1Count => Clutches.Count(c => c.OpponentCount == 1);

		[JsonIgnore]
		public int Clutch1V2Count => Clutches.Count(c => c.OpponentCount == 2);

		[JsonIgnore]
		public int Clutch1V3Count => Clutches.Count(c => c.OpponentCount == 3);

		[JsonIgnore]
		public int Clutch1V4Count => Clutches.Count(c => c.OpponentCount == 4);

		[JsonIgnore]
		public int Clutch1V5Count => Clutches.Count(c => c.OpponentCount == 5);

		[JsonIgnore]
		public decimal ClutchWonPercent => ClutchCount == 0 ? 0 : Math.Round((decimal)(ClutchWonCount * 100) / ClutchCount, 2);

		[JsonIgnore]
		public decimal Clutch1V1WonPercent => Clutch1V1Count == 0 ? 0 : Math.Round((decimal)(Clutch1V1WonCount * 100) / Clutch1V1Count, 2);

		[JsonIgnore]
		public decimal Clutch1V2WonPercent => Clutch1V2Count == 0 ? 0 : Math.Round((decimal)(Clutch1V2WonCount * 100) / Clutch1V2Count, 2);

		[JsonIgnore]
		public decimal Clutch1V3WonPercent => Clutch1V3Count == 0 ? 0 : Math.Round((decimal)(Clutch1V3WonCount * 100) / Clutch1V3Count, 2);

		[JsonIgnore]
		public decimal Clutch1V4WonPercent => Clutch1V1Count == 0 ? 0 : Math.Round((decimal)(Clutch1V4WonCount * 100) / Clutch1V4Count, 2);

		[JsonIgnore]
		public decimal Clutch1V5WonPercent => Clutch1V5Count == 0 ? 0 : Math.Round((decimal)(Clutch1V5WonCount * 100) / Clutch1V5Count, 2);

		[JsonIgnore]
		public bool IsControllingBot
		{
			get { return _isControllingBot; }
			set { Set(() => IsControllingBot, ref _isControllingBot, value); }
		}

		[JsonIgnore]
		public Team Side
		{
			get { return _side; }
			set { Set(() => Side, ref _side, value); }
		}

		[JsonIgnore]
		public bool IsAlive
		{
			get { return _isAlive; }
			set { Set(() => IsAlive, ref _isAlive, value); }
		}

		[JsonIgnore]
		public bool IsConnected
		{
			get { return _isConnected; }
			set { Set(() => IsConnected, ref _isConnected, value); }
		}

		[JsonIgnore]
		public float FlashDurationTemp
		{
			get { return _flashDurationTemp; }
			set { Set(() => FlashDurationTemp, ref _flashDurationTemp, value); }
		}

		/// <summary>
		/// Total health damage made by the player
		/// </summary>
		[JsonIgnore]
		public int TotalDamageHealthCount => PlayersHurted.ToList()
			.Where(playerHurtedEvent => playerHurtedEvent != null && playerHurtedEvent.AttackerSteamId == SteamId)
			.Sum(playerHurtedEvent => playerHurtedEvent.HealthDamage);

		/// <summary>
		/// Total armor damage made by the player
		/// </summary>
		[JsonIgnore]
		public int TotalDamageArmorCount => PlayersHurted.ToList()
			.Where(playerHurtedEvent => playerHurtedEvent != null && playerHurtedEvent.AttackerSteamId == SteamId)
			.Sum(playerHurtedEvent => playerHurtedEvent.ArmorDamage);

		/// <summary>
		/// Total health damage the player has received
		/// </summary>
		[JsonIgnore]
		public int TotalDamageHealthReceivedCount => PlayersHurted.ToList()
			.Where(playerHurtedEvent => playerHurtedEvent != null && playerHurtedEvent.HurtedSteamId == SteamId)
			.Sum(playerHurtedEvent => playerHurtedEvent.HealthDamage);

		/// <summary>
		/// Total armor damage the player has received
		/// </summary>
		[JsonIgnore]
		public int TotalDamageArmorReceivedCount => PlayersHurted.ToList()
			.Where(playerHurtedEvent => playerHurtedEvent != null && playerHurtedEvent.HurtedSteamId == SteamId)
			.Sum(playerHurtedEvent => playerHurtedEvent.ArmorDamage);

		/// <summary>
		/// Average damage (Health + armor) the player has done during the match
		/// </summary>
		[JsonIgnore]
		public double AverageDamageByRoundCount
		{
			get
			{
				double total = 0;

				if (PlayersHurted.Any())
				{
					int roundNumber = 1;
					foreach (PlayerHurtedEvent playerHurtedEvent in PlayersHurted.ToList().Where(
						playerHurtedEvent => playerHurtedEvent != null && playerHurtedEvent.AttackerSteamId == SteamId))
					{
						total += playerHurtedEvent.HealthDamage + playerHurtedEvent.ArmorDamage;
						roundNumber = playerHurtedEvent.RoundNumber;
					}
					if (Math.Abs(total) < 0.1) return total;
					total = Math.Round(total / roundNumber, 1);
				}

				return total;
			}
		}

		[JsonIgnore]
		public decimal HeadshotPercent
		{
			get
			{
				decimal headshotPercent = 0;
				if (_headshotCount <= 0) return headshotPercent;
				if(_killCount > 0) headshotPercent = (_headshotCount * 100) / (decimal)_killCount;
				headshotPercent = Math.Round(headshotPercent, 2);

				return headshotPercent;
			}
		}

		[JsonIgnore]
		public decimal RatioEntryKill
		{
			get
			{
				int entryKillCount = EntryKills.Count();
				int entryKillWin = EntryKills.Count(e => e.HasWon);
				int entryKillLoss = EntryKills.Count(e => e.HasWon == false);

				decimal entryKillPercent = 0;
				if (entryKillWin == 0) return entryKillPercent;
				if (entryKillLoss == 0) return 100;
				entryKillPercent = (entryKillWin / (decimal)entryKillCount) * 100;
				entryKillPercent = Math.Round(entryKillPercent, 0);

				return entryKillPercent;
			}
		}

		[JsonIgnore]
		public decimal RatioEntryHoldKill
		{
			get
			{
				int entryHoldKillCount = EntryHoldKills.Count();
				int entryHoldKillWin = EntryHoldKills.Count(e => e.HasWon);
				int entryHoldKillLoss = EntryHoldKills.Count(e => e.HasWon == false);

				decimal entryHoldKillPercent = 0;
				if (entryHoldKillWin == 0) return entryHoldKillPercent;
				if (entryHoldKillLoss == 0) return 100;
				entryHoldKillPercent = entryHoldKillWin / (decimal)entryHoldKillCount * 100;
				entryHoldKillPercent = Math.Round(entryHoldKillPercent, 0);

				return entryHoldKillPercent;
			}
		}

		[JsonIgnore]
		public bool HasBomb
		{
			get { return _hasBomb; }
			set { Set(() => HasBomb, ref _hasBomb, value); }
		}

		[JsonIgnore]
		public double KillPerRound
		{
			get
			{
				if (RoundPlayedCount > 0) return Math.Round((double)KillsCount / RoundPlayedCount, 2);
				return 0;
			}
		}

		[JsonIgnore]
		public double AssistPerRound
		{
			get
			{
				if (RoundPlayedCount > 0) return Math.Round((double)AssistCount / RoundPlayedCount, 2);
				return 0;
			}
		}

		[JsonIgnore]
		public double DeathPerRound
		{
			get
			{
				if (RoundPlayedCount > 0) return Math.Round((double)DeathCount / RoundPlayedCount, 2);
				return 0;
			}
		}

		[JsonIgnore]
		public int MatchCount { get; set; } = 1;

		#endregion

		public override bool Equals(object obj)
		{
			var item = obj as PlayerExtended;

			return item != null && SteamId.Equals(item.SteamId);
		}

		public override int GetHashCode()
		{
			return 1;
		}

		public PlayerExtended()
		{
			EntryKills = new ObservableCollection<EntryKillEvent>();
			EntryHoldKills = new ObservableCollection<EntryHoldKillEvent>();
			PlayersHurted = new ObservableCollection<PlayerHurtedEvent>();
			Clutches = new ObservableCollection<ClutchEvent>();
			EntryKills.CollectionChanged += OnEntryKillsCollectionChanged;
			EntryHoldKills.CollectionChanged += OnEntryHoldKillsCollectionChanged;
			PlayersHurted.CollectionChanged += OnPlayersHurtedCollectionChanged;
			Clutches.CollectionChanged += OnClutchesCollectionChanged;
		}

		private void OnPlayersHurtedCollectionChanged(object sender, NotifyCollectionChangedEventArgs e)
		{
			RaisePropertyChanged(() => TotalDamageHealthCount);
			RaisePropertyChanged(() => TotalDamageArmorCount);
			RaisePropertyChanged(() => AverageDamageByRoundCount);
		}

		private void OnEntryKillsCollectionChanged(object sender, NotifyCollectionChangedEventArgs e)
		{
			RaisePropertyChanged(() => EntryKills);
			RaisePropertyChanged(() => EntryKillWonCount);
			RaisePropertyChanged(() => EntryKillLossCount);
			RaisePropertyChanged(() => RatioEntryKill);
		}

		private void OnEntryHoldKillsCollectionChanged(object sender, NotifyCollectionChangedEventArgs e)
		{
			RaisePropertyChanged(() => EntryKills);
			RaisePropertyChanged(() => EntryHoldKillWonCount);
			RaisePropertyChanged(() => EntryHoldKillLossCount);
			RaisePropertyChanged(() => RatioEntryHoldKill);
		}

		private void OnClutchesCollectionChanged(object sender, NotifyCollectionChangedEventArgs e)
		{
			RaisePropertyChanged(() => ClutchCount);
			RaisePropertyChanged(() => ClutchLostCount);
			RaisePropertyChanged(() => Clutch1V1Count);
			RaisePropertyChanged(() => Clutch1V2Count);
			RaisePropertyChanged(() => Clutch1V3Count);
			RaisePropertyChanged(() => Clutch1V4Count);
			RaisePropertyChanged(() => Clutch1V5Count);
			RaisePropertyChanged(() => Clutch1V1WonCount);
			RaisePropertyChanged(() => Clutch1V2WonCount);
			RaisePropertyChanged(() => Clutch1V3WonCount);
			RaisePropertyChanged(() => Clutch1V4WonCount);
			RaisePropertyChanged(() => Clutch1V5WonCount);
			RaisePropertyChanged(() => Clutch1V1LossCount);
			RaisePropertyChanged(() => Clutch1V2LossCount);
			RaisePropertyChanged(() => Clutch1V3LossCount);
			RaisePropertyChanged(() => Clutch1V4LossCount);
			RaisePropertyChanged(() => Clutch1V5LossCount);
		}

		public void ResetStats()
		{
			KillsCount = 0;
			DeathCount = 0;
			AssistCount = 0;
			HeadshotCount = 0;
			TeamKillCount = 0;
			RoundMvpCount = 0;
			OnekillCount = 0;
			TwokillCount = 0;
			ThreekillCount = 0;
			FourKillCount = 0;
			FiveKillCount = 0;
			BombDefusedCount = 0;
			BombPlantedCount = 0;
			Score = 0;
			HasEntryKill = false;
			HasEntryHoldKill = false;
			RatingHltv = 0;
			EntryKills.Clear();
			EntryHoldKills.Clear();
			PlayersHurted.Clear();
			Clutches.Clear();
			RoundPlayedCount = 0;
			StartMoneyRounds.Clear();
			EquipementValueRounds.Clear();
			RoundsMoneyEarned.Clear();
			_flashDurationTemp = 0;
			CrouchKillCount = 0;
			_tradeKillCount = 0;
			_tradeDeathCount = 0;
			EseaRws = 0;
			EseaRwsPointCount = 0;
		}

		public PlayerExtended Clone()
		{
			return (PlayerExtended)MemberwiseClone();
		}
	}
}