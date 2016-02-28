using GalaSoft.MvvmLight;

namespace CSGO_Demos_Manager.Models
{
	public class ComboboxSelector : ObservableObject
	{
		#region Properties

		private string _id;

		private string _title;

		#endregion

		#region Accessors

		public string Id
		{
			get { return _id; }
			set { Set(() => Id, ref _id, value); }
		}

		public string Title
		{
			get { return _title; }
			set { Set(() => Title, ref _title, value); }
		}

		#endregion

		public ComboboxSelector(string id, string title)
		{
			_id = id;
			_title = title;
		}

		public StuffType ToStuffType()
		{
			switch (Id)
			{
				case "smokes":
					return StuffType.SMOKE;
				case "flashbangs":
					return StuffType.FLASHBANG;
				case "he":
					return StuffType.HE;
				case "molotovs":
					return StuffType.MOLOTOV;
				case "incendiary":
					return StuffType.INCENDIARY;
				case "decoys":
					return StuffType.DECOY;
				default:
					return StuffType.UNKNOWN;
			}
		}
	}
}