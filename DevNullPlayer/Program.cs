using System;
using System.IO;
using DemoInfo;

namespace DevNullPlayer
{
	class MainClass
	{
		public static void Main(string[] args)
		{
			using (var input = File.OpenRead(args[0])) {
				var parser = new DemoParser(input);
				parser.ShallAttributeWeapons = true;
				#if DEBUG
				parser.TickDone += (sender, e) => Console.Write(".");;
				#endif
				parser.ParseDemo(true);
			}
		}
	}
}
