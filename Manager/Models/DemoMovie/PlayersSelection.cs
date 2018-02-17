using GalaSoft.MvvmLight;

namespace Manager.Models.DemoMovie
{
	public class PlayersSelection : ObservableObject
	{
		private long _steamId;
		public long SteamId
		{
			get => _steamId;
			set { Set(() => SteamId, ref _steamId, value); }
		}

		private string _name;
		public string Name
		{
			get => _name;
			set { Set(() => Name, ref _name, value); }
		}

		private bool _displayKills = true;
		public bool DisplayKills
		{
			get => _displayKills;
			set { Set(() => DisplayKills, ref _displayKills, value); }
		}

		private bool _highlightKills = false;
		public bool HighlightKills
		{
			get => _highlightKills;
			set { Set(() => HighlightKills, ref _highlightKills, value); }
		}
	}
}
