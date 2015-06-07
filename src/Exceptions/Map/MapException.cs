using System;

namespace CSGO_Demos_Manager.Exceptions.Map
{
	public class MapException : Exception
	{
		public MapException(string message)
			: base(message)
		{
		}
	}
}
