using System;
using System.Windows.Data;

namespace Manager.Converters
{
    public class StringToDateConverter : IValueConverter
    {
        public object Convert(object value, Type targetType, object parameter, System.Globalization.CultureInfo culture)
        {
            if (Properties.Settings.Default.DateFormatEuropean)
            {
                return string.Format("{0:dd/MM/yyyy HH:mm:ss}", System.Convert.ToDateTime(value));
            }

            return string.Format("{0:yyyy/MM/dd HH:mm:ss}", System.Convert.ToDateTime(value));
        }

        public object ConvertBack(object value, Type targetType, object parameter, System.Globalization.CultureInfo culture)
        {
            return null;
        }
    }
}
