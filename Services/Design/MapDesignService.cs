using System;
using System.IO;
using System.Windows.Media.Imaging;
using System.Windows.Resources;
using Core;
using Core.Models;
using Core.Models.Maps;
using Services.Exceptions.Map;
using Services.Interfaces;

namespace Services.Design
{
	public class MapDesignService : IMapService
	{
		public Map Map { get; set; }

		public void InitMap(Demo demo)
		{
			Map = new Dust2();
		}

		public WriteableBitmap GetWriteableImage(bool useSimpleRadar = false)
		{
			try
			{
				StreamResourceInfo sri = System.Windows.Application.GetResourceStream(new Uri(AppSettings.RESOURCES_URI + "images/maps/overview/" + Map.Name + ".png", UriKind.RelativeOrAbsolute));
				if (sri != null)
				{
					using (Stream s = sri.Stream)
					{
						return BitmapFactory.FromStream(s);
					}
				}

				return null;
			}
			catch (Exception)
			{
				throw new MapUnavailableException(Map.Name);
			}
		}

		public float CalculatePointToResolutionX(float x)
		{
			return 0;
		}

		public float CalculatePointToResolutionY(float y)
		{
			return 0;
		}
	}
}
