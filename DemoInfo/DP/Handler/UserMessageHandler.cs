using System;
using DemoInfo.Messages;
using System.Diagnostics;

namespace DemoInfo.DP
{
	public class UserMessageHandler : IMessageParser
	{
		public bool TryApplyMessage (ProtoBuf.IExtensible message, DemoParser parser)
		{
			CSVCMsg_UserMessage userMessage = message as CSVCMsg_UserMessage;
			if (userMessage == null)
				return false;

			var messageType = (Messages.ECstrike15UserMessages)userMessage.msg_type;
			// TODO: maybe, like, implement something here one day?
			return true;
		}

		public int Priority { get { return 0; } }
	}
}

