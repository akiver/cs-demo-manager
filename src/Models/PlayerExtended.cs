using DemoInfo;
using GalaSoft.MvvmLight;
using Newtonsoft.Json;
using System;
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
		/// Score of the player (calculated by the game)
		/// </summary>
		private int _score;

		/// <summary>
		/// Indicate if the player is controlling a BOT
		/// </summary>
		private bool _isControllingBot;

		/// <summary>
		/// Number of opponents if the player is in clutch
		/// </summary>
		private int _opponentClutchCount;

		/// <summary>
		/// Indicate if the player is alive
		/// </summary>
		private bool _isAlive = true;

		/// <summary>
		/// Player kills / Deaths ratio
		/// </summary>
		private decimal _killsDeathsRatio;

		/// <summary>
		/// Player's current team (change when half side is over)
		/// </summary>
		private Team _team;

		/// <summary>
		/// Player's SteamID 64
		/// </summary>
		private long _steamId;

		/// <summary>
		/// Player's nickname used when he was playing
		/// </summary>
		private string _name = "";

		/// <summary>
		/// Number of 1v1 the player made during the match
		/// </summary>
		private int _1V1Count;

		/// <summary>
		/// Number of 1v2 the player made during the match
		/// </summary>
		private int _1V2Count ;

		/// <summary>
		/// Number of 1v3 the player made during the match
		/// </summary>
		private int _1V3Count;

		/// <summary>
		/// Number of 1v4 the player made during the match
		/// </summary>
		private int _1V4Count;

		/// <summary>
		/// Number of 1v5 the player made during the match
		/// </summary>
		private int _1V5Count;

		/// <summary>
		/// Flag to know if the player had an entry kill during a round
		/// </summary>
		private bool _hasEntryKill;

		/// <summary>
		/// Flag to know if the player had the open kill during a round
		/// </summary>
		private bool _hasOpeningKill;

		/// <summary>
		/// Rating based on hltv.org formula that the player made during the match
		/// </summary>
		private float _ratingHltv;

		#endregion

		#region Accessors

		[JsonIgnore]
		public bool HasEntryKill
		{
			get { return _hasEntryKill; }
			set { Set(() => HasEntryKill, ref _hasEntryKill, value); }
		}

		[JsonIgnore]
		public bool HasOpeningKill
		{
			get { return _hasOpeningKill; }
			set { Set(() => HasOpeningKill, ref _hasOpeningKill, value); }
		}

		[JsonIgnore]
		public bool IsControllingBot
		{
			get { return _isControllingBot; }
			set { Set(() => IsControllingBot, ref _isControllingBot, value); }
		}

		[JsonProperty("score")]
		public int Score
		{
			get { return _score; }
			set { Set(() => Score, ref _score, value); }
		}

		[JsonProperty("teamkill_count")]
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

		[JsonProperty("death_count")]
		public int DeathCount
		{
			get { return _deathCount; }
			set {
				RaisePropertyChanged("KillDeathRatio");
				Set(() => DeathCount, ref _deathCount, value);
			}
		}

		[JsonProperty("five_kills_count")]
		public int FiveKillCount
		{
			get { return _fiveKillCount; }
			set { Set(() => FiveKillCount, ref _fiveKillCount, value); }
		}

		[JsonProperty("four_kills_count")]
		public int FourKillCount
		{
			get { return _fourKillCount; }
			set { Set(() => FourKillCount, ref _fourKillCount, value); }
		}

		[JsonProperty("three_kills_count")]
		public int ThreekillCount
		{
			get { return _threekillCount; }
			set { Set(() => ThreekillCount, ref _threekillCount, value); }
		}

		[JsonProperty("two_kills_count")]
		public int TwokillCount
		{
			get { return _twokillCount; }
			set { Set(() => TwokillCount, ref _twokillCount, value); }
		}

		[JsonProperty("one_kill_count")]
		public int OnekillCount
		{
			get { return _onekillCount; }
			set { Set(() => OnekillCount, ref _onekillCount, value); }
		}

		[JsonProperty("headshot_count")]
		public int HeadshotCount
		{
			get { return _headshotCount; }
			set
			{
				RaisePropertyChanged("HeadshotAsString");
				Set(() => HeadshotCount, ref _headshotCount, value);
			}
		}

		[JsonProperty("kd_ratio")]
		public decimal KillDeathRatio
		{
			get
			{
				if (_killCount != 0 && _deathCount != 0) return Math.Round((decimal)_killCount / (decimal)_deathCount, 2);
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

		[JsonIgnore]
		public Team Team
		{
			get { return _team; }
			set { Set(() => Team, ref _team, value); }
		}

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
				RaisePropertyChanged("KillDeathRatio");
				RaisePropertyChanged("HeadshotAsString");
				Set(() => KillsCount, ref _killCount, value);
			}
		}

		[JsonProperty("rating_hltv")]
		public float RatingHltv
		{
			get { return _ratingHltv; }
			set { Set(() => RatingHltv, ref _ratingHltv, value); }
		}

		[JsonIgnore]
		public bool IsAlive
		{
			get { return _isAlive; }
			set { Set(() => IsAlive, ref _isAlive, value); }
		}

		[JsonIgnore]
		public int OpponentClutchCount
		{
			get { return _opponentClutchCount; }
			set { Set(() => OpponentClutchCount, ref _opponentClutchCount, value); }
		}

		[JsonProperty("1v1_count")]
		public int Clutch1V1Count
		{
			get { return _1V1Count; }
			set { Set(() => Clutch1V1Count, ref _1V1Count, value); }
		}

		[JsonProperty("1v2_count")]
		public int Clutch1V2Count
		{
			get { return _1V2Count; }
			set { Set(() => Clutch1V2Count, ref _1V2Count, value); }
		}

		[JsonProperty("1v3_count")]
		public int Clutch1V3Count
		{
			get { return _1V3Count; }
			set { Set(() => Clutch1V3Count, ref _1V3Count, value); }
		}

		[JsonProperty("1v4_count")]
		public int Clutch1V4Count
		{
			get { return _1V4Count; }
			set { Set(() => Clutch1V4Count, ref _1V4Count, value); }
		}

		[JsonProperty("1v5_count")]
		public int Clutch1V5Count
		{
			get { return _1V5Count; }
			set { Set(() => Clutch1V5Count, ref _1V5Count, value); }
		}

		[JsonProperty("entry_kills")]
		public ObservableCollection<EntryKillEvent> EntryKills { get; set; }

		[JsonProperty("opening_kills")]
		public ObservableCollection<OpenKillEvent> OpeningKills { get; set; }

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

		[JsonProperty("entry_kill_win_count")]
		public int EntryKillWinCount
		{
			get { return EntryKills.Count(e => e.HasWin); }
		}

		[JsonProperty("entry_kill_loss_count")]
		public int EntryKillLossCount
		{
			get { return EntryKills.Count(e => e.HasWin == false); }
		}

		[JsonProperty("open_kill_win_count")]
		public int OpenKillWinCount
		{
			get { return OpeningKills.Count(e => e.HasWin); }
		}

		[JsonProperty("open_kill_loss_count")]
		public int OpenKillLossCount
		{
			get { return OpeningKills.Count(e => e.HasWin == false); }
		}

		[JsonIgnore]
		public decimal RatioEntryKill
		{
			get
			{
				int entryKillCount = EntryKills.Count();
				int entryKillWin = EntryKills.Count(e => e.HasWin);
				int entryKillLoss = EntryKills.Count(e => e.HasWin == false);

				decimal entryKillPercent = 0;
				if (entryKillWin == 0) return entryKillPercent;
				if (entryKillLoss == 0) return 100;
				entryKillPercent = (entryKillWin / (decimal)entryKillCount) * 100;
				entryKillPercent = Math.Round(entryKillPercent, 0);

				return entryKillPercent;
			}
		}

		[JsonIgnore]
		public decimal RatioOpenKill
		{
			get
			{
				int openKillCount = OpeningKills.Count();
				int openKillWin = OpeningKills.Count(e => e.HasWin);
				int openKillLoss = OpeningKills.Count(e => e.HasWin == false);

				decimal openKillPercent = 0;
				if (openKillWin == 0) return openKillPercent;
				if (openKillLoss == 0) return 100;
				openKillPercent = (openKillWin / (decimal)openKillCount) * 100;
				openKillPercent = Math.Round(openKillPercent, 0);

				return openKillPercent;
			}
		}

		[JsonIgnore]
		public string RatioEntryKillAsString => RatioEntryKill + " %";

		[JsonIgnore]
		public string RatioOpenKillAsString => RatioOpenKill + " %";

		[JsonIgnore]
		public string HeadshotAsString => _headshotCount + " (" + HeadshotPercent + "%)";

		#endregion

		public override bool Equals(object obj)
		{
			var item = obj as PlayerExtended;

			return item != null && SteamId.Equals(item.SteamId);
		}

		public override int GetHashCode()
		{
			return base.GetHashCode();
		}

		public PlayerExtended()
		{
			EntryKills = new ObservableCollection<EntryKillEvent>();
			OpeningKills = new ObservableCollection<OpenKillEvent>();
			EntryKills.CollectionChanged += OnEntryKillsCollectionChanged;
			OpeningKills.CollectionChanged += OnOpeningKillsCollectionChanged;
		}

		private void OnEntryKillsCollectionChanged(object sender, NotifyCollectionChangedEventArgs e)
		{
			RaisePropertyChanged(() => EntryKills);
			RaisePropertyChanged("EntryKillWinCount");
			RaisePropertyChanged("EntryKillLossCount");
			RaisePropertyChanged("RatioEntryKillAsString");
		}

		private void OnOpeningKillsCollectionChanged(object sender, NotifyCollectionChangedEventArgs e)
		{
			RaisePropertyChanged(() => EntryKills);
			RaisePropertyChanged("OpenKillWinCount");
			RaisePropertyChanged("OpenKillLossCount");
			RaisePropertyChanged("RatioOpenKillAsString");
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
			Clutch1V1Count = 0;
			Clutch1V2Count = 0;
			Clutch1V3Count = 0;
			Clutch1V4Count = 0;
			Clutch1V5Count = 0;
			BombDefusedCount = 0;
			BombPlantedCount = 0;
			Score = 0;
			OpponentClutchCount = 0;
			HasEntryKill = false;
			HasOpeningKill = false;
			RatingHltv = 0;
			OpeningKills.Clear();
			EntryKills.Clear();
		}
	}
}