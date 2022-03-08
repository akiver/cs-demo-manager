using System.Windows;
using Services.Models.Timelines;
using Telerik.Windows.Controls.Timeline;

namespace Manager.Models.Selectors
{
    public class DemoTimeLineTemplateSelector : RoundTimeLineTemplateSelector
    {
        public override DataTemplate SelectTemplate(object item, DependencyObject container)
        {
            TimelineDataItem e = item as TimelineDataItem;
            TimelineEvent timelineEvent = e?.DataItem as TimelineEvent;
            if (timelineEvent == null)
            {
                return null;
            }

            switch (timelineEvent.Type)
            {
                case "round_start":
                    return RoundTemplate;
                case "start_tick":
                    return MarkerStartTickTemplate;
                case "end_tick":
                    return MarkerEndTickTemplate;
                default:
                    return base.SelectTemplate(item, container);
            }
        }

        public DataTemplate RoundTemplate { get; set; }

        public DataTemplate MarkerStartTickTemplate { get; set; }

        public DataTemplate MarkerEndTickTemplate { get; set; }
    }
}
