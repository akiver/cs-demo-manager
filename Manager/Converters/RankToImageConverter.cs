using System;
using System.Globalization;
using System.Windows.Data;
using Core;

namespace Manager.Converters
{
    public class RankToImageConverter : IValueConverter
    {
        public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
        {
            if (value == null)
            {
                return null;
            }

            int rankNumber = int.Parse(value.ToString());
            if (rankNumber == 0)
            {
                return new Uri(AppSettings.CORE_URI + "Resources/Images/Ranks/no_rank.png", UriKind.RelativeOrAbsolute);
            }

            string imagePath = "Resources/Images/Ranks/elo" + rankNumber.ToString("D" + 2) + ".png";

            return new Uri(AppSettings.CORE_URI + imagePath, UriKind.RelativeOrAbsolute);
        }

        public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
        {
            return value;
        }
    }
}
