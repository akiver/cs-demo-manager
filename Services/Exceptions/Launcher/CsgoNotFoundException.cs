using System;

namespace Services.Exceptions.Launcher
{
	public class CsgoNotFoundException : Exception
	{
		public CsgoNotFoundException() : base("csgo.exe not found!.")
		{
		}
	}
}