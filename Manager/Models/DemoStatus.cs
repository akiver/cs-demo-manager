using System.Collections.Generic;

namespace Manager.Models
{
	/// <summary>
	/// Status assignable to a demo
	/// </summary>
	public class DemoStatus
	{
		public string Name { get; set; }

		public string Label { get; set; }

		public const string NAME_DEMO_STATUS_NONE = "none";
		public const string NAME_DEMO_STATUS_WATCHED = "watched";
		public const string NAME_DEMO_STATUS_TO_WATCH = "towatch";
		public const string NAME_DEMO_STATUS_CORRUPTED = "corrupted";
		public const string NAME_DEMO_STATUS_ERROR = "error";

		private static readonly DemoStatus DEMO_STATUS_NONE = new DemoStatus
		{
			Name = NAME_DEMO_STATUS_NONE,
			Label = Properties.Resources.DemoStatusNone
		};

		private static readonly DemoStatus DEMO_STATUS_WATCHED = new DemoStatus
		{
			Name = NAME_DEMO_STATUS_WATCHED,
			Label = Properties.Resources.DemoStatusWatched
		};

		private static readonly DemoStatus DEMO_STATUS_TO_WATCH = new DemoStatus
		{
			Name = NAME_DEMO_STATUS_TO_WATCH,
			Label = Properties.Resources.DemoStatusToWatch
		};

		private static readonly DemoStatus DEMO_STATUS_CORRUPTED = new DemoStatus
		{
			Name = NAME_DEMO_STATUS_CORRUPTED,
			Label = Properties.Resources.DemoStatusCorrupted
		};

		private static readonly DemoStatus DEMO_STATUS_ERROR = new DemoStatus
		{
			Name = NAME_DEMO_STATUS_ERROR,
			Label = Properties.Resources.DemoStatusError
		};

		public static List<DemoStatus> DefaultStatus = new List<DemoStatus>
		{
			DEMO_STATUS_NONE,
			DEMO_STATUS_TO_WATCH,
			DEMO_STATUS_WATCHED,
			DEMO_STATUS_CORRUPTED,
			DEMO_STATUS_ERROR,
		};
	}
}
