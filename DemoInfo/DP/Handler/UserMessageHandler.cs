using System;
using DemoInfo.Messages;
using System.Diagnostics;

namespace DemoInfo.DP
{
	#if SLOW_PROTOBUF
	public class UserMessageHandler : IMessageParser
	{
		public bool TryApplyMessage(ProtoBuf.IExtensible message, DemoParser parser)
		{
			CSVCMsg_UserMessage userMessage = message as CSVCMsg_UserMessage;
			if (userMessage == null)
				return false;

			var messageType = (Messages.ECstrike15UserMessages)userMessage.msg_type;
			// TODO: maybe, like, implement something here one day?
			//Problem: There is no real useful info here if I see it correcly. Sorry.
			return true;
		}

		public int Priority { get { return 0; } }
	}
	#endif
}
