using System;
using System.Globalization;
using System.Windows.Data;

namespace Manager.Converters
{
    public class SecondsToTimerConverter : IValueConverter
    {
        public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
        {
            float totalSeconds = value as float? ?? 0;
            double minutes = Math.Floor(totalSeconds / 60 % 60);
            double seconds = Math.Floor(totalSeconds % 60);

            return $"{FormatValue(minutes)}:{FormatValue(seconds)}";
        }

        public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
        {
            return value;
        }

        private static string FormatValue(double value)
        {
            return value.ToString(CultureInfo.InvariantCulture).PadLeft(2, '0');
        }
    }
}
