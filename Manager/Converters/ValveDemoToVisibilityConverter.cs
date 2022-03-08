using System;
using System.Globalization;
using System.Windows;
using System.Windows.Data;

namespace Manager.Converters
{
    public class ValveDemoToVisibilityConverter : IValueConverter
    {
        public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
        {
            string demoSourceName = value as string;
            if (demoSourceName == "valve")
            {
                return Visibility.Visible;
            }

            return Visibility.Collapsed;
        }

        public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
        {
            return value;
        }
    }
}
