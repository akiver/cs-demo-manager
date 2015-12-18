using System.Windows;
using System.Windows.Controls;
using CSGO_Demos_Manager.Models.Timeline;
using Telerik.Windows.Controls.Timeline;

namespace CSGO_Demos_Manager.Models.Selectors
{
	class RoundTimeLineTemplateSelector : DataTemplateSelector
	{
		public override DataTemplate SelectTemplate(object item, DependencyObject container)
		{
			var e = item as TimelineDataItem;
			var roundEvent = e?.DataItem as RoundEvent;
			if (roundEvent == null) return null;
			switch (roundEvent.Type)
			{
				case "kill":
					return KillTemplate;
				case "flash":
					return FlashbangTemplate;
				case "smoke":
					return SmokeTemplate;
				case "he":
					return HeTemplate;
				case "decoy":
					return DecoyTemplate;
				case "molotov":
					return MolotovTemplate;
				case "incendiary":
					return IncendiaryTemplate;
				case "bomb_planted":
					return BombPlantedTemplate;
				case "bomb_exploded":
					return BombExplodedTemplate;
				case "bomb_defused":
					return BombDefusedTemplate;
				default:
					return null;
			}
		}

		public DataTemplate FlashbangTemplate { get; set; }

		public DataTemplate SmokeTemplate { get; set; }

		public DataTemplate HeTemplate { get; set; }

		public DataTemplate MolotovTemplate { get; set; }

		public DataTemplate IncendiaryTemplate { get; set; }

		public DataTemplate DecoyTemplate { get; set; }

		public DataTemplate KillTemplate { get; set; }

		public DataTemplate BombPlantedTemplate { get; set; }

		public DataTemplate BombExplodedTemplate { get; set; }

		public DataTemplate BombDefusedTemplate { get; set; }
	}
}
