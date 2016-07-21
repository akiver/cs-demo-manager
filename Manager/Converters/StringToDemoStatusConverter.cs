using System;
using System.Globalization;
using System.Windows.Data;
using Core;
using Core.Models;

namespace Manager.Converters
{
	public class StringToDemoStatusConverter : IValueConverter
	{
		public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
		{
			string status = value as string;
			foreach (DemoStatus st in AppSettings.DefaultStatus)
			{
				if (st.Name == status) return st;
			}

			return AppSettings.DefaultStatus[0];
		}

		public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
		{
			DemoStatus ds = value as DemoStatus;
			if (ds == null) return "none";
			return ds.Name;
		}
	}
}
