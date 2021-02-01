using System;
using System.Windows.Data;
using Core;
using Core.Models;

namespace Manager.Converters
{
	public class MapNameToImageConverter : IValueConverter
	{
		public object Convert(object value, Type targetType, object parameter, System.Globalization.CultureInfo culture)
		{
			Demo demo = value as Demo;
			if (demo == null) return new Uri(AppSettings.RESOURCES_URI + "images/maps/preview/unknown.png", UriKind.RelativeOrAbsolute);

			switch (demo.MapName)
			{
				case "cs_office":
					return new Uri(AppSettings.RESOURCES_URI + "images/maps/preview/office.png", UriKind.RelativeOrAbsolute);
				case "de_biome":
					return new Uri(AppSettings.RESOURCES_URI + "images/maps/preview/biome.png", UriKind.RelativeOrAbsolute);
				case "de_subzero":
					return new Uri(AppSettings.RESOURCES_URI + "images/maps/preview/subzero.png", UriKind.RelativeOrAbsolute);
				case "de_austria":
					return new Uri(AppSettings.RESOURCES_URI + "images/maps/preview/austria.png", UriKind.RelativeOrAbsolute);
				case "cs_agency":
					return new Uri(AppSettings.RESOURCES_URI + "images/maps/preview/agency.png", UriKind.RelativeOrAbsolute);
				case "de_ali":
					return new Uri(AppSettings.RESOURCES_URI + "images/maps/preview/ali.png", UriKind.RelativeOrAbsolute);
				case "de_ancient":
					return new Uri(AppSettings.RESOURCES_URI + "images/maps/preview/ancient.png", UriKind.RelativeOrAbsolute);
				case "de_anubis":
					return new Uri(AppSettings.RESOURCES_URI + "images/maps/preview/anubis.png", UriKind.RelativeOrAbsolute);
				case "de_aztec":
					return new Uri(AppSettings.RESOURCES_URI + "images/maps/preview/aztec.png", UriKind.RelativeOrAbsolute);
				case "de_bazaar":
					return new Uri(AppSettings.RESOURCES_URI + "images/maps/preview/bazaar.png", UriKind.RelativeOrAbsolute);
				case "de_blackgold":
					return new Uri(AppSettings.RESOURCES_URI + "images/maps/preview/black_gold.png", UriKind.RelativeOrAbsolute);
				case "de_cache":
					return new Uri(AppSettings.RESOURCES_URI + "images/maps/preview/cache.png", UriKind.RelativeOrAbsolute);
				case "de_canals":
					return new Uri(AppSettings.RESOURCES_URI + "images/maps/preview/canals.png", UriKind.RelativeOrAbsolute);
				case "de_castle":
					return new Uri(AppSettings.RESOURCES_URI + "images/maps/preview/castle.png", UriKind.RelativeOrAbsolute);
				case "de_cbble":
					return new Uri(AppSettings.RESOURCES_URI + "images/maps/preview/cobblestone.png", UriKind.RelativeOrAbsolute);
				case "de_chinatown":
					return new Uri(AppSettings.RESOURCES_URI + "images/maps/preview/chinatown.png", UriKind.RelativeOrAbsolute);
				case "de_chlorine":
					return new Uri(AppSettings.RESOURCES_URI + "images/maps/preview/chlorine.png", UriKind.RelativeOrAbsolute);
				case "de_coast":
					return new Uri(AppSettings.RESOURCES_URI + "images/maps/preview/coast.png", UriKind.RelativeOrAbsolute);
				case "de_contra":
					return new Uri(AppSettings.RESOURCES_URI + "images/maps/preview/contra.png", UriKind.RelativeOrAbsolute);
				case "cs_cruise":
					return new Uri(AppSettings.RESOURCES_URI + "images/maps/preview/cruise.png", UriKind.RelativeOrAbsolute);
				case "de_crown":
					return new Uri(AppSettings.RESOURCES_URI + "images/maps/preview/crown.png", UriKind.RelativeOrAbsolute);
				case "de_dust":
					return new Uri(AppSettings.RESOURCES_URI + "images/maps/preview/dust.png", UriKind.RelativeOrAbsolute);
				case "de_dust2":
					return new Uri(AppSettings.RESOURCES_URI + "images/maps/preview/dust2.png", UriKind.RelativeOrAbsolute);
				case "de_empire":
					return new Uri(AppSettings.RESOURCES_URI + "images/maps/preview/empire.png", UriKind.RelativeOrAbsolute);
				case "de_facade":
					return new Uri(AppSettings.RESOURCES_URI + "images/maps/preview/facade.png", UriKind.RelativeOrAbsolute);
				case "de_favela":
					return new Uri(AppSettings.RESOURCES_URI + "images/maps/preview/favela.png", UriKind.RelativeOrAbsolute);
				case "de_fire":
					return new Uri(AppSettings.RESOURCES_URI + "images/maps/preview/fire.png", UriKind.RelativeOrAbsolute);
				case "de_gwalior":
					return new Uri(AppSettings.RESOURCES_URI + "images/maps/preview/gwalior.png", UriKind.RelativeOrAbsolute);
				case "de_inferno":
					if (demo.Date > new DateTime(2016, 10, 12)) return new Uri(AppSettings.RESOURCES_URI + "images/maps/preview/new_inferno.png", UriKind.RelativeOrAbsolute);
					return new Uri(AppSettings.RESOURCES_URI + "images/maps/preview/inferno.png", UriKind.RelativeOrAbsolute);
				case "de_inferno_ce":
					return new Uri(AppSettings.RESOURCES_URI + "images/maps/preview/inferno_ce.png", UriKind.RelativeOrAbsolute);
				case "de_log":
					return new Uri(AppSettings.RESOURCES_URI + "images/maps/preview/log.png", UriKind.RelativeOrAbsolute);
				case "de_marquis":
					return new Uri(AppSettings.RESOURCES_URI + "images/maps/preview/marquis.png", UriKind.RelativeOrAbsolute);
				case "de_mikla":
					return new Uri(AppSettings.RESOURCES_URI + "images/maps/preview/mikla.png", UriKind.RelativeOrAbsolute);
				case "de_mirage":
					return new Uri(AppSettings.RESOURCES_URI + "images/maps/preview/mirage.png", UriKind.RelativeOrAbsolute);
				case "de_mist":
					return new Uri(AppSettings.RESOURCES_URI + "images/maps/preview/mist.png", UriKind.RelativeOrAbsolute);
				case "de_nuke":
					if (demo.Date > new DateTime(2016, 02, 17)) return new Uri(AppSettings.RESOURCES_URI + "images/maps/preview/new_nuke.png", UriKind.RelativeOrAbsolute);
					return new Uri(AppSettings.RESOURCES_URI + "images/maps/preview/nuke.png", UriKind.RelativeOrAbsolute);
				case "de_overgrown":
					return new Uri(AppSettings.RESOURCES_URI + "images/maps/preview/overgrown.png", UriKind.RelativeOrAbsolute);
				case "de_overpass":
					return new Uri(AppSettings.RESOURCES_URI + "images/maps/preview/overpass.png", UriKind.RelativeOrAbsolute);
				case "de_print":
					return new Uri(AppSettings.RESOURCES_URI + "images/maps/preview/print.png", UriKind.RelativeOrAbsolute);
				case "de_rails":
					return new Uri(AppSettings.RESOURCES_URI + "images/maps/preview/rails.png", UriKind.RelativeOrAbsolute);
				case "de_resort":
					return new Uri(AppSettings.RESOURCES_URI + "images/maps/preview/resort.png", UriKind.RelativeOrAbsolute);
				case "de_royal":
					return new Uri(AppSettings.RESOURCES_URI + "images/maps/preview/royal.png", UriKind.RelativeOrAbsolute);
				case "de_ruins":
					return new Uri(AppSettings.RESOURCES_URI + "images/maps/preview/ruins.png", UriKind.RelativeOrAbsolute);
				case "de_santorini":
					return new Uri(AppSettings.RESOURCES_URI + "images/maps/preview/santorini.png", UriKind.RelativeOrAbsolute);
				case "de_seaside":
					return new Uri(AppSettings.RESOURCES_URI + "images/maps/preview/seaside.png", UriKind.RelativeOrAbsolute);
				case "de_season":
					return new Uri(AppSettings.RESOURCES_URI + "images/maps/preview/season.png", UriKind.RelativeOrAbsolute);
				case "de_train":
					return new Uri(AppSettings.RESOURCES_URI + "images/maps/preview/train.png", UriKind.RelativeOrAbsolute);
				case "de_tulip":
					return new Uri(AppSettings.RESOURCES_URI + "images/maps/preview/tulip.png", UriKind.RelativeOrAbsolute);
				case "de_tuscan":
					return new Uri(AppSettings.RESOURCES_URI + "images/maps/preview/tuscan.png", UriKind.RelativeOrAbsolute);
				case "de_vertigo":
					return new Uri(AppSettings.RESOURCES_URI + "images/maps/preview/vertigo.png", UriKind.RelativeOrAbsolute);
				case "de_zoo":
					return new Uri(AppSettings.RESOURCES_URI + "images/maps/preview/zoo.png", UriKind.RelativeOrAbsolute);
				default:
					return new Uri(AppSettings.RESOURCES_URI + "images/maps/preview/unknown.png", UriKind.RelativeOrAbsolute);
			}
		}

		public object ConvertBack(object value, Type targetType, object parameter, System.Globalization.CultureInfo culture)
		{
			return null;
		}
	}
}