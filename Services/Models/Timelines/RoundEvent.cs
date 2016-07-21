using System;

namespace Services.Models.Timelines
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
