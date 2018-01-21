using System.Windows;
using System.Windows.Controls;
using Services.Models.Timelines;
using Telerik.Windows.Controls.Timeline;

namespace Manager.Models.Selectors
{
	public class RoundTimeLineTemplateSelector : DataTemplateSelector
	{
		public override DataTemplate SelectTemplate(object item, DependencyObject container)
		{
			TimelineDataItem e = item as TimelineDataItem;
			TimelineEvent roundEvent = e?.DataItem as TimelineEvent;
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
