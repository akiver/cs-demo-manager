using System;
using System.IO;
using DemoInfo;
using System.Diagnostics;
using System.Collections.Generic;

namespace DevNullPlayer
{
	class MainClass
	{
		public static void Main(string[] args)
		{
			using (var input = File.OpenRead(args[0])) {
				var parser = new DemoParser(input);


				parser.TickDone += (sender, e) => Console.WriteLine((parser.ParsingProgess * 100).ToString() + "%");

				#if DEBUG
				Debug.Listeners.Add(new ConsoleTraceListener(true));

				parser.TickDone += (sender, e) => Console.WriteLine((parser.ParsingProgess * 100).ToString() + "%");

				//This is a different "unit-test", so it gets a different method.
				Dictionary<Player, int> failures = new Dictionary<Player, int>();
				parser.TickDone += (sender, e) => {
					//Problem: The HP coming from CCSPlayerEvent are sent 1-4 ticks later
					//I guess this is because the think()-method of the CCSPlayerResource isn't called
					//that often. Haven't checked though.
					foreach(var p in parser.PlayingParticipants)
					{
						//Make sure the array is never empty ;)
						failures[p] = failures.ContainsKey(p) ? failures[p] : 0;

						if(p.HP == p.AdditionaInformations.ScoreboardHP)
							failures[p] = 0;
						else
							failures[p]++; //omg this is hacky. 

						//Okay, if it's wrong 2 seconds in a row, something's off
						//Since there should be a tick where it's right, right?
						//And if there's something off (e.g. two players are swapped)
						//there will be 2 seconds of ticks where it's wrong
						//So no problem here :)
						Debug.Assert(
							failures[p] < parser.TickRate * 2, 
							string.Format(
								"The player-HP({0}) of {2} (Clan: {3}) and it's Scoreboard HP ({1}) didn't match for {4} ticks. ", 
								p.HP, p.AdditionaInformations.ScoreboardHP, p.Name, p.AdditionaInformations.Clantag, parser.TickRate * 2
							)
						);

					}
				};
				#endif

				parser.ParseHeader ();
				parser.ParseToEnd ();
			}
		}
	}
}
