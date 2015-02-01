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
				parser.ParseHeader ();

				#if DEBUG
				if (args.Length >= 2) {
					// progress reporting requested
					using (var progressWriter = new StreamWriter(args[1]) { AutoFlush = false }) {
						int lastPercentage = -1;
						while (parser.ParseNextTick()) {
							var newProgress = (int)(parser.ParsingProgess * 100);
							if (newProgress != lastPercentage) {
								progressWriter.Write(lastPercentage = newProgress);
								progressWriter.Flush();
							}
						}
					}

					return;
				}
				#endif

				parser.ParseToEnd ();
			}
		}
	}
}
