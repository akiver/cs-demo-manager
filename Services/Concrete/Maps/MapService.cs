using System;
using System.IO;
using System.Windows.Media.Imaging;
using System.Windows.Resources;
using Core;
using Core.Models;
using Core.Models.Maps;
using Services.Exceptions.Map;
using Services.Interfaces;

namespace Services.Concrete.Maps
{
	public class MapService : IMapService
	{
		private const string DUST2 = "de_dust2";
		private const string INFERNO = "de_inferno";
		private const string NUKE = "de_nuke";
		private const string CACHE = "de_cache";
		private const string SEASON = "de_season";
		private const string TRAIN = "de_train";
		private const string CBBLE = "de_cbble";
		private const string OVERPASS = "de_overpass";
		private const string MIRAGE = "de_mirage";
		private const string EMPIRE = "de_empire";
		private const string SANTORINI = "de_santorini";
		private const string TULIP = "de_tulip";
		private const string ROYAL = "de_royal";
		private const string CRUISE = "cs_cruise";
		private const string COAST = "de_coast";
		private const string MIKLA = "de_mikla";

		public static string[] Maps = {
			DUST2, INFERNO, NUKE, CACHE, SEASON, TRAIN, CBBLE, OVERPASS,
			MIRAGE, EMPIRE, SANTORINI, TULIP, ROYAL, CRUISE, COAST, MIKLA
		};

		public Map Map { get; set; }

		public void InitMap(Demo demo)
		{
			switch (demo.MapName)
			{
				case DUST2:
					Map = new Dust2();
					break;
				case INFERNO:
					Map = new Inferno();
					break;
				case NUKE:
					if (demo.Date > new DateTime(2016, 02, 17))
					{
						Map = new NewNuke();
						break;
					}
					Map = new Nuke();
					break;
				case CACHE:
					Map = new Cache();
					break;
				case SEASON:
					Map = new Season();
					break;
				case CBBLE:
					Map = new Cbble();
					break;
				case OVERPASS:
					Map = new Overpass();
					break;
				case MIRAGE:
					Map = new Mirage();
					break;
				case TRAIN:
					Map = new Train();
					break;
				case EMPIRE:
					Map = new Empire();
					break;
				case SANTORINI:
					Map = new Santorini();
					break;
				case TULIP:
					Map = new Tulip();
					break;
				case ROYAL:
					Map = new Royal();
					break;
				case CRUISE:
					Map = new Cruise();
					break;
				case COAST:
					Map = new Coast();
					break;
				case MIKLA:
					Map = new Mikla();
					break;
				default:
					throw new MapUnavailableException(demo.MapName);
			}
		}

		/// <summary>
		/// Calcul X coordinate where the pixel will be draw on the image
		/// </summary>
		/// <param name="x"></param>
		public float CalculatePointToResolutionX(float x)
		{
			x += (Map.StartX < 0) ? Map.StartX * -1 : Map.StartX;
			x = (float)Math.Floor((x / Map.SizeX) * Map.ResX);
			return x;
		}

		/// <summary>
		/// Calcul Y coordinate where the pixel will be draw on the image
		/// </summary>
		/// <param name="y"></param>
		public float CalculatePointToResolutionY(float y)
		{
			y += (Map.StartY < 0) ? Map.StartY * -1 : Map.StartY;
			y = (float)Math.Floor((y / Map.SizeY) * Map.ResY);
			y = (y - Map.ResY) * -1;
			return y;
		}

		public WriteableBitmap GetWriteableImage()
		{
			try
			{
				StreamResourceInfo sri = System.Windows.Application.GetResourceStream(new Uri(AppSettings.RESOURCES_URI + "images/maps/overview/" + Map.Name + ".png", UriKind.RelativeOrAbsolute));
				if (sri != null)
				{
					using (Stream s = sri.Stream)
					{
						return BitmapFactory.New(Map.ResX, Map.ResY).FromStream(s);
					}
				}

				return null;
			}
			catch (FileNotFoundException)
			{
				throw new MapUnavailableException(Map.Name);
			}
		}
	}
}