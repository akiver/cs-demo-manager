using System.Collections.Generic;

namespace Manager.Messages
{
	public class LoadSuspectListMessage
	{
		public List<string> SteamIdList { get; set; }
	}
}
