using GalaSoft.MvvmLight;

namespace CSGO_Demos_Manager.Models
{
	public class HeatmapSelector : ObservableObject
	{
		#region Properties

		private string _id;

		private string _title;

		#endregion

		#region Accessors

		public string Id
		{
			get
			{
				return _id;
			}
			set
			{
				Set(() => Id, ref _id, value);
			}
		}

		public string Title
		{
			get
			{
				return _title;
			}
			set
			{
				Set(() => Title, ref _title, value);
			}
		}

		#endregion

		public HeatmapSelector(string id, string title)
		{
			_id = id;
			_title = title;
		}
	}
}
