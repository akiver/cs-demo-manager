using System;
using System.Globalization;
using System.Windows.Data;

namespace Manager.Converters
{
    public class MultiLineTextToSingleLineConverter : IValueConverter
    {
        public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
        {
            string text = value as string;
            if (text == null)
            {
                return string.Empty;
            }

            return text.Replace(Environment.NewLine, " ");
        }

        public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
        {
            return value;
        }
    }
}
