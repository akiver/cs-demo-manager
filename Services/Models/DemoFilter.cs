using System;

namespace Services.Models
{
	public class DemoFilter
	{
		/// <summary>
		/// SteamID to filter on
		/// </summary>
		public long SteamId { get; set; }

		/// <summary>
		/// Minimum date 
		/// </summary>
		public DateTime From { get; set; }

		/// <summary>
		/// Maximum date
		/// </summary>
		public DateTime To { get; set; }

		/// <summary>
		/// Folder's path to filter on
		/// </summary>
		public string Folder { get; set; }
	}
}
