using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.Linq;
using System.Runtime.InteropServices;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using CSGO_Demos_Manager.Internals;
using CSGO_Demos_Manager.Models;
using CSGO_Demos_Manager.Models.Events;
using CSGO_Demos_Manager.Services.Map;
using DemoInfo;
using Color = System.Windows.Media.Color;
using PixelFormat = System.Drawing.Imaging.PixelFormat;

namespace CSGO_Demos_Manager.Services
{
	public class DrawService
	{
		public MapService MapService { get; set; }

		public WriteableBitmap OverviewLayer { get; set; }

		public WriteableBitmap WeaponLayer { get; set; }

		public WriteableBitmap KillLayer { get; set; }

		public WriteableBitmap SmokeLayer { get; set; }

		public WriteableBitmap FlashbangLayer { get; set; }

		public WriteableBitmap HegrenadeLayer { get; set; }

		public WriteableBitmap DecoyLayer { get; set; }

		public WriteableBitmap MolotovLayer { get; set; }

		public WriteableBitmap PlayerMarkerLayer { get; set; }

		private readonly Color[] _colors =
		{
			Color.FromArgb(255, 255, 0, 0),
			Color.FromArgb(255, 0, 255, 0),
			Color.FromArgb(255, 0, 0, 255),
			Color.FromArgb(255, 255, 255, 0),
			Color.FromArgb(255, 0, 255, 255),
			Color.FromArgb(255, 255, 0, 255),
			Color.FromArgb(255, 255, 255, 255),
			Color.FromArgb(255, 0, 0, 0),
			Color.FromArgb(255, 48, 32, 19),
			Color.FromArgb(255, 255, 179, 255),
		};

		public DrawService(MapService mapService)
		{
			MapService = mapService;
			OverviewLayer = mapService.GetWriteableImage();
			WeaponLayer = BitmapFactory.New(MapService.ResX, MapService.ResY);
			KillLayer = BitmapFactory.New(MapService.ResX, MapService.ResY);
			SmokeLayer = BitmapFactory.New(MapService.ResX, MapService.ResY);
			FlashbangLayer = BitmapFactory.New(MapService.ResX, MapService.ResY);
			HegrenadeLayer = BitmapFactory.New(MapService.ResX, MapService.ResY);
			DecoyLayer = BitmapFactory.New(MapService.ResX, MapService.ResY);
			MolotovLayer = BitmapFactory.New(MapService.ResX, MapService.ResY);
			PlayerMarkerLayer = BitmapFactory.New(MapService.ResX, MapService.ResY);
		}

		/// <summary>
		/// Return PositionPoint for each players determined by selection
		/// </summary>
		/// <param name="demo"></param>
		/// <param name="teamSelector"></param>
		/// <param name="selectedPlayer"></param>
		/// <param name="round"></param>
		/// <returns></returns>
		public async Task<List<List<PositionPoint>>> GetPoints(Demo demo, ComboboxSelector teamSelector, PlayerExtended selectedPlayer, Round round)
		{
			List<List<PositionPoint>> points = new List<List<PositionPoint>>();

			if (teamSelector != null)
			{
				switch (teamSelector.Id)
				{
					case "CT":
						demo.PositionsPoint.Reverse();

						foreach (PlayerExtended playerExtended in demo.Players)
						{
							List<PositionPoint> playerPoints = new List<PositionPoint>();

							for (int i = demo.PositionsPoint.Count - 1; i >= 0; i--)
							{
								if (!demo.PositionsPoint[i].Round.Equals(round)) continue;

								// Keep kills from terrorists
								if (demo.PositionsPoint[i].Event != null
									&& demo.PositionsPoint[i].Team == Team.Terrorist
									&& demo.PositionsPoint[i].Event.GetType() == typeof(KillEvent))
								{
									KillEvent e = (KillEvent)demo.PositionsPoint[i].Event;
									if (e.DeathPerson.Equals(playerExtended))
									{
										playerPoints.Add(demo.PositionsPoint[i]);
										demo.PositionsPoint.RemoveAt(i);
										continue;
									}
								}

								if (demo.PositionsPoint[i].Team != Team.CounterTerrorist) continue;

								// Molotov started
								if (demo.PositionsPoint[i].Event != null
									&& demo.PositionsPoint[i].Event.GetType() == typeof(MolotovFireStartedEvent))
								{
									MolotovFireStartedEvent e = (MolotovFireStartedEvent)demo.PositionsPoint[i].Event;
									if (e.Thrower.Equals(playerExtended))
									{
										playerPoints.Add(demo.PositionsPoint[i]);
										demo.PositionsPoint.RemoveAt(i);
										continue;
									}
								}

								// Molotov ended
								if (demo.PositionsPoint[i].Event != null
									&& demo.PositionsPoint[i].Event.GetType() == typeof(MolotovFireEndedEvent))
								{
									MolotovFireEndedEvent e = (MolotovFireEndedEvent)demo.PositionsPoint[i].Event;
									if (e.Thrower.Equals(playerExtended))
									{
										playerPoints.Add(demo.PositionsPoint[i]);
										demo.PositionsPoint.RemoveAt(i);
										continue;
									}
								}

								if (demo.PositionsPoint[i].Player != null
								&& demo.PositionsPoint[i].Player.Equals(playerExtended))
								{
									playerPoints.Add(demo.PositionsPoint[i]);
									demo.PositionsPoint.RemoveAt(i);
								}
							}
							if (playerPoints.Any()) points.Add(playerPoints);
						}
						break;
					case "T":
						demo.PositionsPoint.Reverse();

						foreach (PlayerExtended playerExtended in demo.Players)
						{
							List<PositionPoint> playerPoints = new List<PositionPoint>();

							for (int i = demo.PositionsPoint.Count - 1; i >= 0; i--)
							{
								if (!demo.PositionsPoint[i].Round.Equals(round)) continue;

								// Keep kills from CT
								if (demo.PositionsPoint[i].Event != null
									&& demo.PositionsPoint[i].Team == Team.CounterTerrorist
									&& demo.PositionsPoint[i].Event.GetType() == typeof(KillEvent))
								{
									KillEvent e = (KillEvent)demo.PositionsPoint[i].Event;
									if (e.DeathPerson.Equals(playerExtended))
									{
										playerPoints.Add(demo.PositionsPoint[i]);
										demo.PositionsPoint.RemoveAt(i);
										continue;
									}
								}

								if (demo.PositionsPoint[i].Team != Team.Terrorist) continue;

								// Molotov started
								if (demo.PositionsPoint[i].Event != null
									&& demo.PositionsPoint[i].Event.GetType() == typeof(MolotovFireStartedEvent))
								{
									MolotovFireStartedEvent e = (MolotovFireStartedEvent)demo.PositionsPoint[i].Event;
									if (e.Thrower.Equals(playerExtended))
									{
										playerPoints.Add(demo.PositionsPoint[i]);
										demo.PositionsPoint.RemoveAt(i);
										continue;
									}
								}

								// Molotov ended
								if (demo.PositionsPoint[i].Event != null
									&& demo.PositionsPoint[i].Event.GetType() == typeof(MolotovFireEndedEvent))
								{
									MolotovFireEndedEvent e = (MolotovFireEndedEvent)demo.PositionsPoint[i].Event;
									if (e.Thrower.Equals(playerExtended))
									{
										playerPoints.Add(demo.PositionsPoint[i]);
										demo.PositionsPoint.RemoveAt(i);
										continue;
									}
								}

								if (demo.PositionsPoint[i].Player != null
								&& demo.PositionsPoint[i].Player.Equals(playerExtended))
								{
									playerPoints.Add(demo.PositionsPoint[i]);
									demo.PositionsPoint.RemoveAt(i);
								}
							}
							if (playerPoints.Any()) points.Add(playerPoints);
						}
						break;
					case "BOTH":
						points.AddRange(
							demo.Players.Select(
								playerExtended => demo.PositionsPoint.Where(
									point => point.Round.Number == round.Number
									&& point.Player.SteamId == playerExtended.SteamId).ToList())
									.Where(pts => pts.Any()));
						break;
				}
			}

			if (selectedPlayer != null)
			{
				await Task.Run(delegate
				{
					List<PositionPoint> pt = demo.PositionsPoint.ToList().Where(
						positionPoint => positionPoint.Player.SteamId == selectedPlayer.SteamId
						&& positionPoint.Round.Number == round.Number
						|| (positionPoint.Event != null
						&& positionPoint.Event.GetType() == typeof(KillEvent))
						&& positionPoint.Round.Number == round.Number).ToList();
					if (pt.Any()) points.Add(pt);
				});
			}

			// Set players color
			await Task.Run(delegate
			{
				int index = 0;
				foreach (List<PositionPoint> positionPoints in points.ToList())
				{
					foreach (PositionPoint positionPoint in positionPoints)
					{
						positionPoint.X = MapService.CalculatePointToResolutionX(positionPoint.X);
						positionPoint.Y = MapService.CalculatePointToResolutionY(positionPoint.Y);
						positionPoint.Color = ColorToInt(_colors[index]);
					}
					index++;
				}
			});

			return points;
		}

		/// <summary>
		/// Draw a pixel on main overview
		/// </summary>
		/// <param name="positionPoint"></param>
		public void DrawPixel(PositionPoint positionPoint)
		{
			OverviewLayer.SetPixel((int)positionPoint.X, (int)positionPoint.Y, positionPoint.Color);
		}

		/// <summary>
		/// Draw player's marker
		/// </summary>
		/// <param name="positionPoint"></param>
		public async void DrawPlayerMarker(PositionPoint positionPoint)
		{
			try
			{
				PlayerMarkerLayer.FillEllipseCentered((int)positionPoint.X, (int)positionPoint.Y, 5, 5, positionPoint.Color);

				Bitmap icon = null;
				if (positionPoint.Player.HasBomb)
				{
					icon = new Bitmap(Properties.Resources.bomb_overview);
					DrawIcon(PlayerMarkerLayer, icon, positionPoint);
				}

				await Task.Delay(200);

				PlayerMarkerLayer.FillEllipseCentered((int)positionPoint.X, (int)positionPoint.Y, 5, 5, Colors.Transparent);

				if (positionPoint.Player.HasBomb)
				{
					await Task.Delay(200);

					ClearIcon(PlayerMarkerLayer, icon, positionPoint);
					icon?.Dispose();
				}
			}
			catch (Exception e)
			{
				Logger.Instance.Log(e);
			}
		}

		/// <summary>
		/// Draw weapon icon
		/// </summary>
		/// <param name="positionPoint"></param>
		public async void DrawWeapon(PositionPoint positionPoint)
		{
			var ev = (WeaponFire)positionPoint.Event;
			Bitmap icon = null;
			switch (ev.Weapon.Name)
			{
				case "Flashbang":
					icon = new Bitmap(Properties.Resources.flashbang);
					break;
				case "He grenade":
					icon = new Bitmap(Properties.Resources.hegrenade);
					break;
				case "Smoke":
					icon = new Bitmap(Properties.Resources.smokegrenade);
					break;
				case "Decoy":
					icon = new Bitmap(Properties.Resources.decoy);
					break;
				case "Molotov":
					icon = new Bitmap(Properties.Resources.molotov);
					break;
				case "Incendiary":
					icon = new Bitmap(Properties.Resources.incendiary);
					break;
			}

			if (icon != null)
			{
				try
				{
					DrawIcon(WeaponLayer, icon, positionPoint);

					await Task.Delay(2000);

					ClearIcon(WeaponLayer, icon, positionPoint);

					icon.Dispose();
				}
				catch (Exception e)
				{
					Logger.Instance.Log(e);
				}
			}
		}

		/// <summary>
		/// Draw icon when a flashbang exploded
		/// </summary>
		/// <param name="positionPoint"></param>
		public async void DrawFlashbangExploded(PositionPoint positionPoint)
		{
			try
			{
				Bitmap icon = new Bitmap(Properties.Resources.flashbang_exploded);
				DrawIcon(FlashbangLayer, icon, positionPoint);

				await Task.Delay(2000);

				ClearIcon(FlashbangLayer, icon, positionPoint);

				icon.Dispose();
			}
			catch (Exception e)
			{
				Logger.Instance.Log(e);
			}
		}

		/// <summary>
		/// Draw successive icons to animate smoke started
		/// </summary>
		/// <param name="positionPoint"></param>
		public async void DrawSmokeStarted(PositionPoint positionPoint)
		{
			try
			{
				Bitmap icon = new Bitmap(Properties.Resources.smoke_start);
				DrawIcon(SmokeLayer, icon, positionPoint);

				await Task.Delay(1000);

				icon = new Bitmap(Properties.Resources.smoke);
				DrawIcon(SmokeLayer, icon, positionPoint);

				icon.Dispose();
			}
			catch (Exception e)
			{
				Logger.Instance.Log(e);
			}
		}

		/// <summary>
		/// Clear smoke icon when a smoke ended
		/// </summary>
		/// <param name="positionPoint"></param>
		public void DrawSmokeEnded(PositionPoint positionPoint)
		{
			try
			{
				Bitmap icon = new Bitmap(Properties.Resources.smoke);
				ClearIcon(SmokeLayer, icon, positionPoint);
				icon.Dispose();
			}
			catch (Exception e)
			{
				Logger.Instance.Log(e);
			}
		}

		/// <summary>
		/// Draw burn icon when a molo is started burn
		/// </summary>
		/// <param name="positionPoint"></param>
		public void DrawMolotovStarted(PositionPoint positionPoint)
		{
			try
			{
				Bitmap icon = new Bitmap(Properties.Resources.molotov_burning);
				DrawIcon(MolotovLayer, icon, positionPoint);
				icon.Dispose();
			}
			catch (Exception e)
			{
				Logger.Instance.Log(e);
			}
		}

		/// <summary>
		/// Clear burn icon when a molotov is no more burning
		/// </summary>
		/// <param name="positionPoint"></param>
		public void DrawMolotovEnded(PositionPoint positionPoint)
		{
			try
			{
				Bitmap icon = new Bitmap(Properties.Resources.molotov_burning);
				ClearIcon(MolotovLayer, icon, positionPoint);
				icon.Dispose();
			}
			catch (Exception e)
			{
				Logger.Instance.Log(e);
			}
		}

		/// <summary>
		/// Draw icon when a hegrenade exploded
		/// </summary>
		/// <param name="positionPoint"></param>
		public async void DrawExplosiveNadeExploded(PositionPoint positionPoint)
		{
			try
			{
				Bitmap icon = new Bitmap(Properties.Resources.he_exploded);
				DrawIcon(HegrenadeLayer, icon, positionPoint);

				await Task.Delay(2000);

				ClearIcon(HegrenadeLayer, icon, positionPoint);

				icon.Dispose();
			}
			catch (Exception e)
			{
				Logger.Instance.Log(e);
			}
		}

		/// <summary>
		/// Draw icon when a player has been killed
		/// </summary>
		/// <param name="positionPoint"></param>
		public async void DrawKill(PositionPoint positionPoint)
		{
			try
			{
				Bitmap icon = new Bitmap(Properties.Resources.kill);
				DrawIcon(KillLayer, icon, positionPoint);

				await Task.Delay(2000);

				ClearIcon(KillLayer, icon, positionPoint);

				icon.Dispose();
			}
			catch (Exception e)
			{
				Logger.Instance.Log(e);
			}
		}

		/// <summary>
		/// Draw icon when the bomb has been planted
		/// </summary>
		/// <param name="positionPoint"></param>
		public void DrawBombPlanted(PositionPoint positionPoint)
		{
			try
			{
				Bitmap icon = new Bitmap(Properties.Resources.bomb);
				DrawIcon(WeaponLayer, icon, positionPoint);

				icon.Dispose();
			}
			catch (Exception e)
			{
				Logger.Instance.Log(e);
			}
		}

		/// <summary>
		/// Draw icon when the bomb has exploded
		/// </summary>
		/// <param name="positionPoint"></param>
		public async void DrawBombExploded(PositionPoint positionPoint)
		{
			try
			{
				Bitmap icon = new Bitmap(Properties.Resources.bomb);

				ClearIcon(WeaponLayer, icon, positionPoint);

				icon = new Bitmap(Properties.Resources.bomb_exploded);
				DrawIcon(WeaponLayer, icon, positionPoint);

				await Task.Delay(3000);

				ClearIcon(WeaponLayer, icon, positionPoint);

				icon.Dispose();
			}
			catch (Exception e)
			{
				Logger.Instance.Log(e);
			}
		}

		/// <summary>
		/// Draw icon when the bomb has been defused
		/// </summary>
		/// <param name="positionPoint"></param>
		public async void DrawBombDefused(PositionPoint positionPoint)
		{
			try
			{
				Bitmap icon = new Bitmap(Properties.Resources.bomb);

				ClearIcon(WeaponLayer, icon, positionPoint);

				icon = new Bitmap(Properties.Resources.defuser);
				DrawIcon(WeaponLayer, icon, positionPoint);

				await Task.Delay(3000);

				ClearIcon(WeaponLayer, icon, positionPoint);

				icon.Dispose();
			}
			catch (Exception e)
			{
				Logger.Instance.Log(e);
			}
		}

		/// <summary>
		/// Draw icon when a decoy start "screaming"
		/// </summary>
		/// <param name="positionPoint"></param>
		public void DrawDecoyStarted(PositionPoint positionPoint)
		{
			try
			{
				Bitmap icon = new Bitmap(Properties.Resources.decoy_screaming);
				DrawIcon(DecoyLayer, icon, positionPoint);

				icon.Dispose();
			}
			catch (Exception e)
			{
				Logger.Instance.Log(e);
			}
		}

		/// <summary>
		/// Undraw an icon when a decoy is over
		/// </summary>
		/// <param name="positionPoint"></param>
		public async void DrawDecoyEnded(PositionPoint positionPoint)
		{
			try
			{
				Bitmap icon = new Bitmap(Properties.Resources.decoy_screaming);
				ClearIcon(DecoyLayer, icon, positionPoint);

				icon = new Bitmap(Properties.Resources.decoy_exploded);
				DrawIcon(DecoyLayer, icon, positionPoint);

				await Task.Delay(1000);

				ClearIcon(DecoyLayer, icon, positionPoint);

				icon.Dispose();
			}
			catch (Exception e)
			{
				Logger.Instance.Log(e);
			}
		}

		/// <summary>
		/// Undraw a specific icon from the WriteableBitmap layer
		/// </summary>
		/// <param name="layer"></param>
		/// <param name="icon"></param>
		/// <param name="positionPoint"></param>
		private void ClearIcon(WriteableBitmap layer, Bitmap icon, PositionPoint positionPoint)
		{
			BitmapData data = icon.LockBits(new Rectangle(0, 0, icon.Width, icon.Height),
			ImageLockMode.ReadOnly, PixelFormat.Format32bppPArgb);

			IntPtr ptr = data.Scan0;

			// Declare an array to hold the bytes of the bitmap. 
			int bytes = Math.Abs(data.Stride) * icon.Height;
			byte[] rgbValues = new byte[bytes];

			// Copy the RGB values into the array.
			Marshal.Copy(ptr, rgbValues, 0, bytes);

			// Clear data
			Array.Clear(rgbValues, 0, rgbValues.Length);

			layer.WritePixels(
				new Int32Rect(0, 0, icon.Width, icon.Height),
				rgbValues,
				data.Stride,
				(int)positionPoint.X - icon.Width / 2,
				(int)positionPoint.Y - icon.Height / 2);

			icon.UnlockBits(data);
		}

		/// <summary>
		/// Draw a specific icon on WriteableBitmapEvents layer
		/// </summary>
		/// <param name="layer"></param>
		/// <param name="icon"></param>
		/// <param name="positionPoint"></param>
		private void DrawIcon(WriteableBitmap layer, Bitmap icon, PositionPoint positionPoint)
		{
			BitmapData data = icon.LockBits(new Rectangle(0, 0, icon.Width, icon.Height),
			ImageLockMode.ReadOnly, PixelFormat.Format32bppPArgb);

			IntPtr ptr = data.Scan0;

			// Declare an array to hold the bytes of the bitmap.
			int bytes = Math.Abs(data.Stride) * icon.Height;
			byte[] rgbValues = new byte[bytes];

			// Copy the RGB values into the array.
			Marshal.Copy(ptr, rgbValues, 0, bytes);

			layer.WritePixels(
				new Int32Rect(0, 0, icon.Width, icon.Height),
				rgbValues,
				data.Stride,
				(int)positionPoint.X - icon.Width / 2,
				(int)positionPoint.Y - icon.Height / 2);

			icon.UnlockBits(data);
		}

		/// <summary>
		/// Convert System.Windows.Media.Color to int
		/// </summary>
		/// <param name="color"></param>
		/// <returns></returns>
		private static int ColorToInt(Color color)
		{
			return (color.A << 24) | (color.R << 16) | (color.G << 8) | color.B;
		}

		public void DrawEvent(PositionPoint positionPoint)
		{
			Type type = positionPoint.Event.GetType();
			if (type == typeof(WeaponFire))
			{
				DrawWeapon(positionPoint);
				WeaponFire e = (WeaponFire)positionPoint.Event;
				SoundService.PlayWeaponFired(positionPoint.Team, e);
			}
			else if (type == typeof(FlashbangExplodedEvent))
			{
				DrawFlashbangExploded(positionPoint);
				SoundService.PlayFlashbangExploded();
			}
			else if (type == typeof(SmokeNadeStartedEvent))
			{
				DrawSmokeStarted(positionPoint);
				SoundService.PlaySmokeDetonated();
			}
			else if (type == typeof(SmokeNadeEndedEvent))
			{
				DrawSmokeEnded(positionPoint);
			}
			else if (type == typeof(ExplosiveNadeExplodedEvent))
			{
				DrawExplosiveNadeExploded(positionPoint);
				SoundService.PlayHeExploded();
			}
			else if (type == typeof(MolotovFireStartedEvent))
			{
				DrawMolotovStarted(positionPoint);
				SoundService.PlayMolotovExploded();
			}
			else if (type == typeof(MolotovFireEndedEvent))
			{
				DrawMolotovEnded(positionPoint);
			}
			else if (type == typeof(KillEvent))
			{
				DrawKill(positionPoint);
				SoundService.PlayPlayerKilled(positionPoint.Team);
			}
			else if (type == typeof(DecoyStartedEvent))
			{
				DrawDecoyStarted(positionPoint);
			}
			else if (type == typeof(DecoyEndedEvent))
			{
				DrawDecoyEnded(positionPoint);
				SoundService.PlayDecoyExploded();
			}
			else if (type == typeof(BombPlantedEvent))
			{
				DrawBombPlanted(positionPoint);
				SoundService.PlayBombPlanted();
			}
			else if (type == typeof(BombExplodedEvent))
			{
				DrawBombExploded(positionPoint);
				SoundService.PlayBombExploded();
			}
			else if (type == typeof(BombDefusedEvent))
			{
				DrawBombDefused(positionPoint);
				SoundService.PlayBombDefused();
			}
		}
	}
}