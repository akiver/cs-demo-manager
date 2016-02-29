using System;
using System.Windows.Data;
using CSGO_Demos_Manager.Models;

namespace CSGO_Demos_Manager.Converters
{
	public class MapNameToImageConverter : IValueConverter
	{
		public object Convert(object value, Type targetType, object parameter, System.Globalization.CultureInfo culture)
		{
			Demo demo = value as Demo;
			if(demo == null) return "../Resources/images/maps/preview/unknown.png";

			switch (demo.MapName)
			{
				case "de_ali":
					return "../Resources/images/maps/preview/ali.png";
				case "de_aztec":
					return "../Resources/images/maps/preview/aztec.png";
				case "de_bazaar":
					return "../Resources/images/maps/preview/bazaar.png";
				case "de_blackgold":
					return "../Resources/images/maps/preview/black_gold.png";
				case "de_cache":
					return "../Resources/images/maps/preview/cache.png";
				case "de_castle":
					return "../Resources/images/maps/preview/castle.png";
				case "de_cbble":
					return "../Resources/images/maps/preview/cobblestone.png";
				case "de_chinatown":
					return "../Resources/images/maps/preview/chinatown.png";
				case "de_coast":
					return "../Resources/images/maps/preview/coast.png";
				case "de_contra":
					return "../Resources/images/maps/preview/contra.png";
				case "cs_cruise":
					return "../Resources/images/maps/preview/cruise.png";
				case "de_crown":
					return "../Resources/images/maps/preview/crown.png";
				case "de_dust":
					return "../Resources/images/maps/preview/dust.png";
				case "de_dust2":
					return "../Resources/images/maps/preview/dust2.png";
				case "de_empire":
					return "../Resources/images/maps/preview/empire.png";
				case "de_facade":
					return "../Resources/images/maps/preview/facade.png";
				case "de_favela":
					return "../Resources/images/maps/preview/favela.png";
				case "de_fire":
					return "../Resources/images/maps/preview/fire.png";
				case "de_gwalior":
					return "../Resources/images/maps/preview/gwalior.png";
				case "de_inferno":
					return "../Resources/images/maps/preview/inferno.png";
				case "de_inferno_ce":
					return "../Resources/images/maps/preview/inferno_ce.png";
				case "de_log":
					return "../Resources/images/maps/preview/log.png";
				case "de_marquis":
					return "../Resources/images/maps/preview/marquis.png";
				case "de_mikla":
					return "../Resources/images/maps/preview/mikla.png";
				case "de_mirage":
					return "../Resources/images/maps/preview/mirage.png";
				case "de_mist":
					return "../Resources/images/maps/preview/mist.png";
				case "de_nuke":
					if (demo.Date > new DateTime(2016, 02, 17)) return "../Resources/images/maps/preview/new_nuke.png";
					return "../Resources/images/maps/preview/nuke.png";
				case "de_overgrown":
					return "../Resources/images/maps/preview/overgrown.png";
				case "de_overpass":
					return "../Resources/images/maps/preview/overpass.png";
				case "de_print":
					return "../Resources/images/maps/preview/print.png";
				case "de_rails":
					return "../Resources/images/maps/preview/rails.png";
				case "de_resort":
					return "../Resources/images/maps/preview/resort.png";
				case "de_royal":
					return "../Resources/images/maps/preview/royal.png";
				case "de_ruins":
					return "../Resources/images/maps/preview/ruins.png";
				case "de_santorini":
					return "../Resources/images/maps/preview/santorini.png";
				case "de_seaside":
					return "../Resources/images/maps/preview/seaside.png";
				case "de_season":
					return "../Resources/images/maps/preview/season.png";
				case "de_train":
					return "../Resources/images/maps/preview/train.png";
				case "de_tulip":
					return "../Resources/images/maps/preview/tulip.png";
				case "de_tuscan":
					return "../Resources/images/maps/preview/tuscan.png";
				case "de_vertigo":
					return "../Resources/images/maps/preview/vertigo.png";
				case "de_zoo":
					return "../Resources/images/maps/preview/zoo.png";
				default:
					return "../Resources/images/maps/preview/unknown.png";
			}
		}

		public object ConvertBack(object value, Type targetType, object parameter, System.Globalization.CultureInfo culture)
		{
			return null;
		}
	}
}