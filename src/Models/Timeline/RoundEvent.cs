using System;

namespace CSGO_Demos_Manager.Models.Timeline
{
	public class RoundEvent
	{
		public DateTime StartTime { get; set; }

		public DateTime EndTime { get; set; }

		public string Category { get; set; }

		public string Message { get; set; }

		public TimeSpan Duration => EndTime - StartTime;

		public string Type { get; set; }
	}
}
