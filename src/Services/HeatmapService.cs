using CSGO_Demos_Manager.Models;
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.Threading.Tasks;
using System.IO;
using System.Linq;
using System.Windows;
using System.Windows.Interop;
using System.Windows.Media.Imaging;
using CSGO_Demos_Manager.Exceptions.Heatmap;
using CSGO_Demos_Manager.Models.Comparers;
using CSGO_Demos_Manager.Services.Map;
using Color = System.Drawing.Color;
using PixelFormat = System.Drawing.Imaging.PixelFormat;
using Point = System.Drawing.Point;

namespace CSGO_Demos_Manager.Services
{
	public class HeatmapService
	{
		/// <summary>
		/// HeatmapPoint radius
		/// </summary>
		private const int RADIUS_POINT = 20;

		public MapService MapService { get; set; }

		public HeatmapService(MapService mapService)
		{
			MapService = mapService;
		}

		/// <summary>
		/// Computes scaled X,Y coordinates
		/// </summary>
		/// <param name="points"></param>
		/// <returns></returns>
		private List<HeatmapPoint> GetCalculatedPoints(List<HeatmapPoint> points)
		{
			List<HeatmapPoint> heatmapPointsCalculated = new List<HeatmapPoint>();

			// Scale x,y to overview image, we remove duplicate points before
			foreach (HeatmapPoint point in points.Distinct(new HeatmapPointComparer()).ToList())
			{
				// Calcul to resolution
				float x = MapService.CalculatePointToResolutionX(point.X);
				float y = MapService.CalculatePointToResolutionY(point.Y);

				point.X = x;
				point.Y = y;

				heatmapPointsCalculated.Add(point);
			}

			return heatmapPointsCalculated;
		}

		/// <summary>
		/// Return HeatmapPoints to draw on the overview
		/// </summary>
		/// <param name="demo"></param>
		/// <param name="selector"></param>
		/// <returns></returns>
		public async Task<List<HeatmapPoint>> GetPoints(Demo demo, ComboboxSelector selector)
		{
			List<HeatmapPoint> heatmapPoints;
			List<HeatmapPoint> points = new List<HeatmapPoint>();

			switch (selector.Id)
			{
				case "kills":
					heatmapPoints = new List<HeatmapPoint>(demo.Kills.Select(t => t.Point.Clone()).ToList());
					if (heatmapPoints.Count == 0)
					{
						throw new HeatmapDataNotFoundException("No kills occurs in this match");
					}
					break;
				case "shots":
					heatmapPoints = new List<HeatmapPoint>(demo.HeatmapPoints);
					if (heatmapPoints.Count == 0)
					{
						throw new HeatmapDataNotFoundException("No shots occurs during this match");
					}
					// Reduce intensity for "shots" as there is a lot of points
					foreach (HeatmapPoint heatmapPoint in heatmapPoints) heatmapPoint.Intensity = 20;
					break;
				case "flashbangs":
					heatmapPoints = new List<HeatmapPoint>(demo.Rounds.SelectMany(r => r.FlashbangsExploded.Select(f => f.Point.Clone())).ToList());
					if (heatmapPoints.Count == 0)
					{
						throw new HeatmapDataNotFoundException("No flashbangs has been thrown during this match");
					}
					break;
				case "he":
					heatmapPoints = new List<HeatmapPoint>(demo.Rounds.SelectMany(r => r.ExplosiveGrenadesExploded.Select(f => f.Point.Clone())).ToList());
					if (heatmapPoints.Count == 0)
					{
						throw new HeatmapDataNotFoundException("No HE grenades has been thrown during this match");
					}
					break;
				case "smokes":
					heatmapPoints = new List<HeatmapPoint>(demo.Rounds.SelectMany(r => r.SmokesStarted.Select(f => f.Point.Clone())).ToList());
					if (heatmapPoints.Count == 0)
					{
						throw new HeatmapDataNotFoundException("No smokes has been thrown during this match");
					}
					break;
				case "molotovs":
					heatmapPoints = new List<HeatmapPoint>(demo.Rounds.SelectMany(r => r.MolotovsThrowed.Select(f => f.Point.Clone())).ToList());
					if (heatmapPoints.Count == 0)
					{
						throw new HeatmapDataNotFoundException("No molotovs has been thrown during this match");
					}
					break;
				default:
					return points;
			}

			await Task.Run(() =>
			{
				points = GetCalculatedPoints(heatmapPoints);
			});

			return points;
		}

		/// <summary>
		/// Merge layers and return the Image for export
		/// </summary>
		/// <param name="image1"></param>
		/// <param name="image2"></param>
		/// <returns></returns>
		public Image GenerateOverviewImage(WriteableBitmap image1, WriteableBitmap image2)
		{
			Bitmap bitmap1 = BitmapFromWriteableBitmap(image1);
			Bitmap bitmap2 = BitmapFromWriteableBitmap(image2);
			bitmap2.MakeTransparent();

			// Final image
			Bitmap finalImage = new Bitmap(MapService.Overview.Width, MapService.Overview.Height);

			using (Graphics g = Graphics.FromImage(finalImage))
			{
				g.DrawImage(bitmap1, new Rectangle(0, 0, bitmap1.Width, bitmap1.Height));
				g.DrawImage(bitmap2, new Rectangle(0, 0, bitmap2.Width, bitmap2.Height));
			}

			return finalImage;
		}

		#region Heatmap functions based on the work of Dylan Vester

		/// <summary>
		/// Generate the final overview heatmap
		/// </summary>
		/// <param name="points"></param>
		/// <returns></returns>
		public WriteableBitmap GenerateHeatmap(List<HeatmapPoint> points)
		{
			// Create a blank bitmap
			Bitmap blankBitmap = new Bitmap(MapService.ResX, MapService.ResY);
			// Calculate mask intensity
			Bitmap dataBitmap = CreateIntensityMask(blankBitmap, points);
			// Colorize the mask
			// TODO variable opacity
			dataBitmap = Colorize(dataBitmap, 150);
			// Convert to BitmapSource
			BitmapSource bitmapSource = CreateBitmapSourceFromBitmap(dataBitmap);
			// Convert to WriteableBitmap
			return new WriteableBitmap(bitmapSource);
		}

		/// <summary>
		/// Create the intensity mask
		/// </summary>
		/// <param name="bitmapSurface"></param>
		/// <param name="points"></param>
		/// <returns></returns>
		private Bitmap CreateIntensityMask(Bitmap bitmapSurface, List<HeatmapPoint> points)
		{
			// Create new graphics surface from memory bitmap
			Graphics drawSurface = Graphics.FromImage(bitmapSurface);
			// Set background color to white so that pixels can be correctly colorized
			drawSurface.Clear(Color.White);

			// Traverse heat point data and draw masks for each heat point
			foreach (HeatmapPoint dataPoint in points)
			{
				// Render current heat point on draw surface
				DrawHeatPoint(drawSurface, dataPoint, RADIUS_POINT);
			}

			return bitmapSurface;
		}

		/// <summary>
		/// Draw a point on the canvas
		/// </summary>
		/// <param name="canvas"></param>
		/// <param name="heatmapPoint"></param>
		/// <param name="radius"></param>
		private void DrawHeatPoint(Graphics canvas, HeatmapPoint heatmapPoint, int radius)
		{
			// Create points generic list of points to hold circumference points
			List<Point> circumferencePointsList = new List<Point>();

			// Create an empty point to predefine the point struct used in the circumference loop
			Point circumferencePoint;

			// Create an empty array that will be populated with points from the generic list
			Point[] circumferencePointsArray;

			// Calculate ratio to scale byte intensity range from 0-255 to 0-1
			float ratio = 1F / byte.MaxValue;
			// Precalulate half of byte max value
			byte half = byte.MaxValue / 2;
			// Flip intensity on it's center value from low-high to high-low
			int intensity = (byte)(heatmapPoint.Intensity - ((heatmapPoint.Intensity - half) * 2));
			// Store scaled and flipped intensity value for use with gradient center location
			float fIntensity = intensity * ratio;

			// Loop through all angles of a circle
			// Define loop variable as a double to prevent casting in each iteration
			// Iterate through loop on 10 degree deltas, this can change to improve performance
			for (double i = 0; i <= 360; i += 10)
			{
				// Replace last iteration point with new empty point struct
				circumferencePoint = new Point();

				// Plot new point on the circumference of a circle of the defined radius
				// Using the point coordinates, radius, and angle
				// Calculate the position of this iterations point on the circle
				circumferencePoint.X = Convert.ToInt32(heatmapPoint.X + radius * Math.Cos(ConvertDegreesToRadians(i)));
				circumferencePoint.Y = Convert.ToInt32(heatmapPoint.Y + radius * Math.Sin(ConvertDegreesToRadians(i)));

				// Add newly plotted circumference point to generic point list
				circumferencePointsList.Add(circumferencePoint);
			}

			// Populate empty points system array from generic points array list
			// Do this to satisfy the datatype of the PathGradientBrush and FillPolygon methods
			circumferencePointsArray = circumferencePointsList.ToArray();

			// Create new PathGradientBrush to create a radial gradient using the circumference points
			PathGradientBrush gradientShaper = new PathGradientBrush(circumferencePointsArray);
			// Create new color blend to tell the PathGradientBrush what colors to use and where to put them
			ColorBlend gradientSpecifications = new ColorBlend(3);

			// Define positions of gradient colors, use intesity to adjust the middle color to
			// show more mask or less mask
			gradientSpecifications.Positions = new float[3] { 0, fIntensity, 1 };
			// Define gradient colors and their alpha values, adjust alpha of gradient colors to match intensity
			gradientSpecifications.Colors = new Color[3]
			{
				Color.FromArgb(0, Color.White),
				Color.FromArgb(heatmapPoint.Intensity, Color.Black),
				Color.FromArgb(heatmapPoint.Intensity, Color.Black)
			};

			// Pass off color blend to PathGradientBrush to instruct it how to generate the gradient
			gradientShaper.InterpolationColors = gradientSpecifications;
			// Draw polygon (circle) using our point array and gradient brush
			canvas.FillPolygon(gradientShaper, circumferencePointsArray);
		}

		/// <summary>
		/// Colorize the colored layer
		/// </summary>
		/// <param name="mask"></param>
		/// <param name="alpha"></param>
		/// <returns></returns>
		private Bitmap Colorize(Bitmap mask, byte alpha)
		{
			mask.MakeTransparent();

			// Create new bitmap to act as a work surface for the colorization process
			Bitmap output = new Bitmap(mask.Width, mask.Height, PixelFormat.Format32bppPArgb);

			// Create a graphics object from our memory bitmap so we can draw on it and clear it's drawing surface
			Graphics surface = Graphics.FromImage(output);
			surface.Clear(Color.Transparent);

			// Build an array of color mappings to remap our greyscale mask to full color
			// Accept an alpha byte to specify the transparancy of the output image
			ColorMap[] colors = CreatePaletteIndex(alpha);

			// Create new image attributes class to handle the color remappings
			// Inject our color map array to instruct the image attributes class how to do the colorization
			ImageAttributes remapper = new ImageAttributes();
			remapper.SetRemapTable(colors);

			// Draw our mask onto our memory bitmap work surface using the new color mapping scheme
			surface.DrawImage(mask, new Rectangle(0, 0, mask.Width, mask.Height), 0, 0, mask.Width, mask.Height, GraphicsUnit.Pixel, remapper);

			// Send back newly colorized memory bitmap
			return output;
		}

		/// <summary>
		/// Create the palette colors from the colors image
		/// </summary>
		/// <param name="alpha"></param>
		/// <returns></returns>
		private ColorMap[] CreatePaletteIndex(byte alpha)
		{
			ColorMap[] outputMap = new ColorMap[256];

			// Change this path to wherever you saved the palette image.
			Bitmap palette = Properties.Resources.colors;

			// Loop through each pixel and create a new color mapping
			for (int x = 0; x <= 255; x++)
			{
				outputMap[x] = new ColorMap
				{
					OldColor = Color.FromArgb(x, x, x),
					NewColor = Color.FromArgb(alpha, palette.GetPixel(x, 0))
				};
			}

			return outputMap;
		}

		#endregion

		#region Utils

		private static double ConvertDegreesToRadians(double degrees)
		{
			return (Math.PI / 180) * degrees;
		}

		/// <summary>
		/// Generate a BitmapSource from a Bitmap
		/// </summary>
		/// <param name="bitmap"></param>
		/// <returns></returns>
		private BitmapSource CreateBitmapSourceFromBitmap(Bitmap bitmap)
		{
			return Imaging.CreateBitmapSourceFromHBitmap(bitmap.GetHbitmap(), IntPtr.Zero, Int32Rect.Empty, BitmapSizeOptions.FromEmptyOptions());
		}

		/// <summary>
		/// Convert a WriteableBitmap object to a Bitmap object
		/// </summary>
		/// <param name="writeableBitmap"></param>
		/// <returns></returns>
		private Bitmap BitmapFromWriteableBitmap(WriteableBitmap writeableBitmap)
		{
			Bitmap bmp;
			using (MemoryStream outStream = new MemoryStream())
			{
				// use PngBitmapEncoder to keep alpha channel
				PngBitmapEncoder encoder = new PngBitmapEncoder();
				encoder.Frames.Add(BitmapFrame.Create(writeableBitmap));
				encoder.Save(outStream);
				bmp = new Bitmap(outStream);
			}
			return bmp;
		}

		#endregion
	}
}