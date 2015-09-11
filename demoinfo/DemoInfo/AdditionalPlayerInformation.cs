using DemoInfo.DP;
using DemoInfo.DT;
using DemoInfo.Messages;
using DemoInfo.ST;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Diagnostics;
using System.Text;

namespace DemoInfo
{
	public class AdditionalPlayerInformation
	{
		public int Kills { get; internal set; }
		public int Deaths { get; internal set; }
		public int Assists { get; internal set; }
		public int Score { get; internal set; }
		public int MVPs { get; internal set; }
		public int Ping { get; internal set; }
		public string Clantag { get; internal set; }
		public int TotalCashSpent { get; internal set;}

		#if DEBUG
		//why is this debug? Because it doesn't provie any additional information
		//since we know this about the player
		//but this is *very* important for a unit-test. 

		/// <summary>
		/// Should always match Player.HP
		/// </summary>
		/// <value>The scoreboard armor.</value>
		public int ScoreboardHP { get; set;}

		/// <summary>
		/// Should always match Player.Armor
		/// </summary>
		/// <value>The scoreboard H.</value>
		public int ScoreboardArmor { get; set;}
		#endif
	}

}
