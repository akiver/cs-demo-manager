using System;

namespace CSGO_Demos_Manager.Exceptions.Launcher
{
	public class CsgoNotFoundException : Exception
	{
		public CsgoNotFoundException() : base("csgo.exe not found!.")
		{
		}
	}
}