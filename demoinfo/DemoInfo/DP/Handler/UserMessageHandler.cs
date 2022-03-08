using System;
using DemoInfo.Messages;

namespace DemoInfo.DP.Handler
{
#if SLOW_PROTOBUF
	public class UserMessageHandler : IMessageParser
	{
		public bool TryApplyMessage(ProtoBuf.IExtensible message, DemoParser parser)
		{
			CSVCMsg_UserMessage userMessage = message as CSVCMsg_UserMessage;

			if (userMessage == null || !Enum.IsDefined(typeof(ECstrike15UserMessages), userMessage.msg_type))
				return false;

			var messageType = (Messages.ECstrike15UserMessages)userMessage.msg_type;
			// Using protobuf-net is recommended for debugging but for better performances, it's recommended to parse this kind
			// of messages the same way as FastNetmessages are.
			// You can find examples in DemoInfo.DP.FastNetmessages.
			// You are free to read the message using protobuf-net here, or implement a FastNetmessage to gain speed.
			return true;
		}

		public int Priority { get { return 0; } }
	}
#endif
}
