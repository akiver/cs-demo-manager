using System;
using System.IO;

namespace CSGO_Demos_Manager.Internals
{
	public sealed class Logger
	{
		private const string LOG_FILENAME = "errors.log";

		private static readonly Lazy<Logger> Lazy = new Lazy<Logger>(() => new Logger());

		public static Logger Instance => Lazy.Value;

		private Logger()
		{
		}

		public void Log(Exception e)
		{
			using (StreamWriter sw = File.AppendText(LOG_FILENAME))
			{
				sw.WriteLine("{0} {1}: {2}", DateTime.Now.ToShortDateString(), DateTime.Now.ToShortTimeString(), e.Message);
				sw.WriteLine("StackTrace:");
				sw.WriteLine(e.StackTrace);
				if (e.InnerException != null)
				{
					sw.WriteLine("InnerException:");
					sw.WriteLine(e.InnerException);
				}
				sw.WriteLine("-----------------------------------");
				sw.Close();
			}
		}
	}
}