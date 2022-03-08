using Core.Models;
using GalaSoft.MvvmLight.Command;

namespace Manager.Converters
{
    public class RowSuspectDoubleClickedToProfileConverter : IEventArgsConverter
    {
        public object Convert(object value, object parameter)
        {
            Suspect suspect = (Suspect)parameter;
            return suspect;
        }
    }
}
