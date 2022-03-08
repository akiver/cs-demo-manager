using System.Windows;
using System.Windows.Controls;
using Services.Models.Charts;
using Telerik.Charting;

namespace Manager.Models.Selectors
{
    public class RankPointTemplateSelector : DataTemplateSelector
    {
        public override DataTemplate SelectTemplate(object item, DependencyObject container)
        {
            CategoricalDataPoint dataPoint = item as CategoricalDataPoint;
            RankDateChart point = dataPoint?.DataItem as RankDateChart;

            if (point != null)
            {
                switch (point.WinStatus)
                {
                    case 1:
                    case 2:
                        return WinTemplate;
                    case -1:
                    case -2:
                        return LostTemplate;
                    case 0:
                        return DrawTemplate;
                }
            }

            return LostTemplate;
        }

        public DataTemplate WinTemplate { get; set; }

        public DataTemplate LostTemplate { get; set; }

        public DataTemplate DrawTemplate { get; set; }
    }
}
