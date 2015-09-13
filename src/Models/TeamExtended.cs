using System;
using System.Collections.ObjectModel;
using System.Collections.Specialized;
using System.Linq;
using GalaSoft.MvvmLight;
using Newtonsoft.Json;

namespace CSGO_Demos_Manager.Models
{
	public class TeamExtended : ObservableObject
	{
		private string _name;

		[JsonProperty("name")]
		public string Name
		{
			get { return _name; }
			set { Set(() => Name, ref _name, value); }
		}

		[JsonProperty("players")]
		public ObservableCollection<PlayerExtended> Players { get; set; }

		[JsonProperty("entry_kill_count")]
		public int EntryKillCount
		{
			get { return Players.SelectMany(p => p.EntryKills).Count(); }
		}

		[JsonProperty("entry_kill_win_count")]
		public int EntryKillWinCount
		{
			get { return Players.SelectMany(p => p.EntryKills).Count(e => e.HasWin); }
		}

		[JsonProperty("entry_kill_loss_count")]
		public int EntryKillLossCount
		{
			get { return Players.SelectMany(p => p.EntryKills).Count(e => e.HasWin == false); }
		}

		[JsonIgnore]
		public decimal RatioEntryKill
		{
			get
			{
				int entryKillCount = Players.SelectMany(p => p.EntryKills).Count();
				int entryKillWin = Players.SelectMany(p => p.EntryKills).Count(e => e.HasWin);
				int entryKillLoss = Players.SelectMany(p => p.EntryKills).Count(e => e.HasWin == false);

				decimal entryKillPercent = 0;
				if (EntryKillWinCount == 0) return entryKillPercent;
				if (entryKillLoss == 0) return 100;
				entryKillPercent = (entryKillWin / (decimal)entryKillCount) * 100;
				entryKillPercent = Math.Round(entryKillPercent, 0);

				return entryKillPercent;
			}
		}

		public string RatioEntryKillAsString => RatioEntryKill + " %";

		[JsonProperty("open_kill_count")]
		public int OpenKillCount
		{
			get { return Players.SelectMany(p => p.OpeningKills).Count(); }
		}

		[JsonProperty("open_kill_win_count")]
		public int OpenKillWinCount
		{
			get { return Players.SelectMany(p => p.OpeningKills).Count(e => e.HasWin); }
		}

		[JsonProperty("open_kill_loss_count")]
		public int OpenKillLossCount
		{
			get { return Players.SelectMany(p => p.OpeningKills).Count(e => e.HasWin == false); }
		}

		[JsonIgnore]
		public decimal RatioOpenKill
		{
			get
			{
				int openKillCount = Players.SelectMany(p => p.OpeningKills).Count();
				int openKillWin = Players.SelectMany(p => p.OpeningKills).Count(e => e.HasWin);
				int openKillLoss = Players.SelectMany(p => p.OpeningKills).Count(e => e.HasWin == false);

				decimal openKillPercent = 0;
				if (openKillWin == 0) return openKillPercent;
				if (openKillLoss == 0) return 100;
				openKillPercent = (openKillWin / (decimal)openKillCount) * 100;
				openKillPercent = Math.Round(openKillPercent, 0);

				return openKillPercent;
			}
		}

		public string RatioOpenKillAsString => RatioOpenKill + " %";

		public override bool Equals(object obj)
		{
			var item = obj as TeamExtended;

			return item != null && Name.Equals(item.Name);
		}

		public override int GetHashCode()
		{
			return base.GetHashCode();
		}

		public TeamExtended()
		{
			Players = new ObservableCollection<PlayerExtended>();
			Players.CollectionChanged += OnPlayersCollectionChanged;
			
		}

		private void OnPlayersCollectionChanged(object sender, NotifyCollectionChangedEventArgs e)
		{
			RaisePropertyChanged(() => Players);
			if (Players.Any())
			{
				foreach (var player in Players)
				{
					if (player != null)
					{
						player.EntryKills.CollectionChanged += OnEntryKillsCollectionChanged;
						player.OpeningKills.CollectionChanged += OnOpenKillsCollectionChanged;
					}
				}
			}
		}

		private void OnEntryKillsCollectionChanged(object sender, NotifyCollectionChangedEventArgs e)
		{
			RaisePropertyChanged(() => EntryKillCount);
			RaisePropertyChanged(() => EntryKillWinCount);
			RaisePropertyChanged(() => EntryKillLossCount);
			RaisePropertyChanged(() => RatioEntryKillAsString);
		}

		private void OnOpenKillsCollectionChanged(object sender, NotifyCollectionChangedEventArgs e)
		{
			RaisePropertyChanged(() => OpenKillCount);
			RaisePropertyChanged(() => OpenKillWinCount);
			RaisePropertyChanged(() => OpenKillLossCount);
			RaisePropertyChanged(() => RatioOpenKillAsString);
		}
	}
}