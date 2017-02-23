using System;
using System.Drawing;
using System.IO;
using System.Windows.Data;
using System.Windows.Media.Imaging;
using Core;
using Core.Models.Source;

namespace Manager.Converters
{
	public class DemoSourceToImageConverter : IValueConverter
	{
		public object Convert(object value, Type targetType, object parameter, System.Globalization.CultureInfo culture)
		{
			try
			{
				string sourceName = value as string;
				Image image = Source.Factory(sourceName).Logo;
				MemoryStream ms = new MemoryStream();
				image.Save(ms, image.RawFormat);
				ms.Seek(0, SeekOrigin.Begin);
				BitmapImage bitmap = new BitmapImage();
				bitmap.BeginInit();
				bitmap.StreamSource = ms;
				bitmap.EndInit();

				return bitmap;
			}
			catch (Exception e)
			{
				Logger.Instance.Log(e);
			}

			return null;
		}

		public object ConvertBack(object value, Type targetType, object parameter, System.Globalization.CultureInfo culture)
		{
			return value;
		}
	}
}
