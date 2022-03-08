using System;
using System.Globalization;
using System.Windows;
using System.Windows.Data;
using Core.Models.Events;
using Manager.Properties;

namespace Manager.Converters
{
    public class EventToVisibilityConverter : IValueConverter
    {
        public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
        {
            BaseEvent e = value as BaseEvent;
            if (e == null)
            {
                return Visibility.Collapsed;
            }

            if (e.GetType() != typeof(KillEvent) && Settings.Default.LogOnlyKillOnOverview)
            {
                return Visibility.Collapsed;
            }

            return Visibility.Visible;
        }

        public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
        {
            return value;
        }
    }
}
