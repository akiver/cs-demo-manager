using System;
using System.IO;
using DemoInfo;

namespace DevNullPlayer
{
	class MainClass
	{
		public static void Main(string[] args)
		{
			using (var input = File.OpenRead(args[0]))
				new DemoParser(input).ParseDemo(true);
		}
	}
}
