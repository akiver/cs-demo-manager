using System;
using System.Globalization;
using System.Windows.Data;
using Core.Models;

namespace Manager.Converters
{
    public class StuffTypeToolTipToStringConverter : IValueConverter
    {
        public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
        {
            if (value != null)
            {
                StuffType type = (StuffType)value;
                switch (type)
                {
                    case StuffType.DECOY:
                        return Properties.Resources.Adecoy;
                    case StuffType.FLASHBANG:
                        return Properties.Resources.AFlashbang;
                    case StuffType.HE:
                        return Properties.Resources.AnHE;
                    case StuffType.INCENDIARY:
                        return Properties.Resources.AnIncendiary;
                    case StuffType.MOLOTOV:
                        return Properties.Resources.AMolotov;
                    case StuffType.SMOKE:
                        return Properties.Resources.Asmoke;
                    default:
                        return Properties.Resources.Unknown;
                }
            }

            return Properties.Resources.Unknown;
        }

        public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
        {
            return value;
        }
    }
}
