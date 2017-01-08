using System;
using System.IO;

namespace Core
{
	public sealed class Logger
	{
		public readonly string LogFilePath = AppSettings.GetLocalAppDataPath() + Path.DirectorySeparatorChar + "errors.log";

		private static readonly Lazy<Logger> Lazy = new Lazy<Logger>(() => new Logger());

		public static Logger Instance => Lazy.Value;

		private Logger()
		{
		}

		public void Log(Exception e)
		{
			using (StreamWriter sw = File.AppendText(LogFilePath))
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