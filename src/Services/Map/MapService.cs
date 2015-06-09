using System;
using System.Drawing;
using System.Windows.Media.Imaging;
using CSGO_Demos_Manager.Exceptions.Map;

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

		public static MapService Factory(string name)
		{
			switch (name)
			{
				case "de_dust2":
					return new Dust2();
				case "de_inferno":
					return new Inferno();
				case "de_nuke":
					return new Nuke();
				case "de_cache":
					return new Cache();
				case "de_season":
					return new Season();
				case "de_cbble":
					return new Cbble();
				case "de_overpass":
					return new Overpass();
				case "de_mirage":
					return new Mirage();
				case "de_train":
					return new Train();
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
				return BitmapFactory.New(SizeX, SizeY).FromResource("Resources/images/overview/" + MapName + ".png");
			}
			catch (System.IO.FileNotFoundException)
			{
				throw new MapUnavailableException();
			}
		}
	}
}