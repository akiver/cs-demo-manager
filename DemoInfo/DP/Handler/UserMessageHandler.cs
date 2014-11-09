using System;
using DemoInfo.Messages;
using System.Diagnostics;

namespace DemoInfo.DP
{
	public class UserMessageHandler : IMessageParser
	{
		public UserMessageHandler ()
		{
		}

		public bool CanHandleMessage (ProtoBuf.IExtensible message)
		{
			return message is CSVCMsg_UserMessage;
		}

		public void ApplyMessage (ProtoBuf.IExtensible message, DemoParser parser)
		{
			CSVCMsg_UserMessage userMessage = (CSVCMsg_UserMessage)message;

			var messageType = (Messages.ECstrike15UserMessages)userMessage.msg_type;

		}

		public int Priority { get { return 0; } }
	}
}

