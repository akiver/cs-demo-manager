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
				rankNumber = (int)value;
			}

			if (rankNumber >= 1 && rankNumber < 2) return "../resources/images/ranks/elo01.png";
			if (rankNumber >= 2 && rankNumber < 3) return "../resources/images/ranks/elo02.png";
			if (rankNumber >= 3 && rankNumber < 4) return "../resources/images/ranks/elo03.png";
			if (rankNumber >= 4 && rankNumber < 5) return "../resources/images/ranks/elo04.png";
			if (rankNumber >= 5 && rankNumber < 6) return "../resources/images/ranks/elo05.png";
			if (rankNumber >= 6 && rankNumber < 7) return "../resources/images/ranks/elo06.png";
			if (rankNumber >= 7 && rankNumber < 8) return "../resources/images/ranks/elo07.png";
			if (rankNumber >= 8 && rankNumber < 9) return "../resources/images/ranks/elo08.png";
			if (rankNumber >= 9 && rankNumber < 10) return "../resources/images/ranks/elo09.png";
			if (rankNumber >= 10 && rankNumber < 11) return "../resources/images/ranks/elo10.png";
			if (rankNumber >= 11 && rankNumber < 12) return "../resources/images/ranks/elo11.png";
			if (rankNumber >= 12 && rankNumber < 13) return "../resources/images/ranks/elo12.png";
			if (rankNumber >= 13 && rankNumber < 14) return "../resources/images/ranks/elo13.png";
			if (rankNumber >= 14 && rankNumber < 15) return "../resources/images/ranks/elo14.png";
			if (rankNumber >= 15 && rankNumber < 16) return "../resources/images/ranks/elo15.png";
			if (rankNumber >= 16 && rankNumber < 17) return "../resources/images/ranks/elo16.png";
			if (rankNumber >= 17 && rankNumber < 18) return "../resources/images/ranks/elo17.png";
			if (rankNumber >= 18) return "../resources/images/ranks/elo18.png";
			return "../resources/images/ranks/no_rank.png";
		}

		public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
		{
			return value;
		}
	}
}