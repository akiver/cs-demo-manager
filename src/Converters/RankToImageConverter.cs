using System;
using System.Globalization;
using System.Windows.Data;

namespace CSGO_Demos_Manager.Converters
{
	public class RankToImageConverter : IValueConverter
	{
		public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
		{
			if (value == null) return null;

			double rankNumber = 0;
			if (value is string)
			{
				rankNumber = double.Parse((string) value);
			}
			else
			{
				rankNumber = System.Convert.ToDouble(value);
			}

			if (rankNumber >= 1 && rankNumber < 2) return new Uri("/resources/images/ranks/elo01.png", UriKind.Relative);
			if (rankNumber >= 2 && rankNumber < 3) return new Uri("/resources/images/ranks/elo02.png", UriKind.Relative);
			if (rankNumber >= 3 && rankNumber < 4) return new Uri("/resources/images/ranks/elo03.png", UriKind.Relative);
			if (rankNumber >= 4 && rankNumber < 5) return new Uri("/resources/images/ranks/elo04.png", UriKind.Relative);
			if (rankNumber >= 5 && rankNumber < 6) return new Uri("/resources/images/ranks/elo05.png", UriKind.Relative);
			if (rankNumber >= 6 && rankNumber < 7) return new Uri("/resources/images/ranks/elo06.png", UriKind.Relative);
			if (rankNumber >= 7 && rankNumber < 8) return new Uri("/resources/images/ranks/elo07.png", UriKind.Relative);
			if (rankNumber >= 8 && rankNumber < 9) return new Uri("/resources/images/ranks/elo08.png", UriKind.Relative);
			if (rankNumber >= 9 && rankNumber < 10) return new Uri("/resources/images/ranks/elo09.png", UriKind.Relative);
			if (rankNumber >= 10 && rankNumber < 11) return new Uri("/resources/images/ranks/elo10.png", UriKind.Relative);
			if (rankNumber >= 11 && rankNumber < 12) return new Uri("/resources/images/ranks/elo11.png", UriKind.Relative);
			if (rankNumber >= 12 && rankNumber < 13) return new Uri("/resources/images/ranks/elo12.png", UriKind.Relative);
			if (rankNumber >= 13 && rankNumber < 14) return new Uri("/resources/images/ranks/elo13.png", UriKind.Relative);
			if (rankNumber >= 14 && rankNumber < 15) return new Uri("/resources/images/ranks/elo14.png", UriKind.Relative);
			if (rankNumber >= 15 && rankNumber < 16) return new Uri("/resources/images/ranks/elo15.png", UriKind.Relative);
			if (rankNumber >= 16 && rankNumber < 17) return new Uri("/resources/images/ranks/elo16.png", UriKind.Relative);
			if (rankNumber >= 17 && rankNumber < 18) return new Uri("/resources/images/ranks/elo17.png", UriKind.Relative);
			if (rankNumber >= 18) return new Uri("/resources/images/ranks/elo18.png", UriKind.Relative);
			return new Uri("/resources/images/ranks/no_rank.png", UriKind.Relative);
		}

		public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
		{
			return value;
		}
	}
}