using System;

namespace Services.Models.Timelines
{
	/// <summary>
	/// We can use DateTime.Today as reference because it starts at 00:00:00 and doesn't change until the next day.
	/// </summary>
	public class TimelineEvent
	{
		/// <summary>
		/// Event type, used to define DataTemplate
		/// </summary>
		public string Type { get; set; }
		/// <summary>
		/// Category where the event must be displayed on the TimeLine (groups)
		/// </summary>
		public string Category { get; set; }
		/// <summary>
		/// Used for localization.
		/// </summary>
		public string EventName { get; set; }
		/// <summary>
		/// Event start tick
		/// </summary>
		public int StartTick { get; }
		/// <summary>
		/// Event end tick
		/// </summary>
		public int EndTick { get; }
		/// <summary>
		/// Demo's tickrate
		/// </summary>
		public float Tickrate { get; }
		public DateTime StartTime => DateTime.Today.AddSeconds(StartTick / Tickrate);
		public DateTime EndTime => DateTime.Today.AddSeconds(EndTick / Tickrate);
		public TimeSpan Duration => EndTime - StartTime;
		
		public TimelineEvent(float tickrate, int startTick, int endTick)
		{
			StartTick = startTick;
			EndTick = endTick;
			Tickrate = tickrate;
		}
	}
}
