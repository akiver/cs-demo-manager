using System;

namespace Manager.Exceptions.Launcher
{
	public class HlaeNotFound : Exception
	{
		public HlaeNotFound() : base(Properties.Resources.HlaeNotFoundException)
		{
		}
	}
}
