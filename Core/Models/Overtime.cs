using GalaSoft.MvvmLight;
using Newtonsoft.Json;

namespace Core.Models
{
	public class Overtime : ObservableObject
	{
		private int _number;

		private int _scoreTeam1;

		private int _scoreTeam2;

		[JsonProperty("number")]
		public int Number
		{
			get { return _number; }
			set { Set(() => Number, ref _number, value); }
		}

		[JsonProperty("score_team1")]
		public int ScoreTeam1
		{
			get { return _scoreTeam1; }
			set { Set(() => ScoreTeam1, ref _scoreTeam1, value); }
		}

		[JsonProperty("score_team2")]
		public int ScoreTeam2
		{
			get { return _scoreTeam2; }
			set { Set(() => ScoreTeam2, ref _scoreTeam2, value); }
		}
	}
}