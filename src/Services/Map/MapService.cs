using System;
using System.Drawing;
using System.Windows.Media.Imaging;
using CSGO_Demos_Manager.Exceptions.Map;
using CSGO_Demos_Manager.Models;

namespace CSGO_Demos_Manager.Services.Map
{
	public abstract class MapService
	{
		public string MapName { get; set; }

		public int SizeX { get; set; }

		public int SizeY { get; set; }

		public int StartX { get; set; }

		public int StartY { get; set; }

		public int EndX { get; set; }

		public int EndY { get; set; }

		public int ResX { get; set; }

		public int ResY { get; set; }

		public Image Overview { get; set; }

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

		public static MapService Factory(Demo demo)
		{
			switch (demo.MapName)
			{
				case DUST2:
					return new Dust2();
				case INFERNO:
					return new Inferno();
				case NUKE:
					if (demo.Date > new DateTime(2016, 02, 17)) return new NewNuke();
					return new Nuke();
				case CACHE:
					return new Cache();
				case SEASON:
					return new Season();
				case CBBLE:
					return new Cbble();
				case OVERPASS:
					return new Overpass();
				case MIRAGE:
					return new Mirage();
				case TRAIN:
					return new Train();
				case EMPIRE:
					return new Empire();
				case SANTORINI:
					return new Santorini();
				case TULIP:
					return new Tulip();
				case ROYAL:
					return new Royal();
				case CRUISE:
					return new Cruise();
				case COAST:
					return new Coast();
				case MIKLA:
					return new Mikla();
				default:
					throw new MapUnavailableException();
			}
		}

		public void CalcSize()
		{
			SizeX = EndX - StartX;
			SizeY = EndY - StartY;
		}

		/// <summary>
		/// Calcul X coordinate where the pixel will be draw on the image
		/// </summary>
		/// <param name="x"></param>
		public float CalculatePointToResolutionX(float x)
		{
			x += (StartX < 0) ? StartX * -1 : StartX;
			x = (float)Math.Floor((x / SizeX) * ResX);
			return x;
		}

		/// <summary>
		/// Calcul Y coordinate where the pixel will be draw on the image
		/// </summary>
		/// <param name="y"></param>
		public float CalculatePointToResolutionY(float y)
		{
			y += (StartY < 0) ? StartY * -1 : StartY;
			y = (float)Math.Floor((y / SizeY) * ResY);
			y = (y - ResY) * -1;
			return y;
		}

		public WriteableBitmap GetWriteableImage()
		{
			try
			{
				WriteableBitmap biptmap = BitmapFactory.New(SizeX, SizeY).FromResource("Resources/images/maps/overview/" + MapName + ".png");
				GC.Collect();
				return biptmap;
			}
			catch (System.IO.FileNotFoundException)
			{
				throw new MapUnavailableException();
			}
		}
	}
}