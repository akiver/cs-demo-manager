using System.Collections.Generic;
using System.IO;
using System.Linq;

namespace DemoInfo.DP.FastNetmessages
{
	/// <summary>
	/// FastNetMessage adaptation of CCSUsrMsg_SayText2 protobuf message
	/// </summary>
	public struct SayText2
	{
		public int EntIdx;
		private int _chat;
		public bool Chat => _chat != 0;
		private int _textAllChat;
		public bool TextAllChat => _textAllChat != 0;
		// Params is a 4 length array but only 2 are used [0] = sender nickname [1] = message text
		public IList<string> Params;
		public string MsgName;

		public void Parse(IBitStream bitstream, DemoParser parser)
		{
			Params = new List<string>();
			while (!bitstream.ChunkFinished)
			{
				var desc = bitstream.ReadProtobufVarInt();
				var wireType = desc & 7;
				var fieldnum = desc >> 3;

				if (wireType == 0 && fieldnum == 1)
				{
					EntIdx = bitstream.ReadProtobufVarInt();
				}
				else if (wireType == 0 && fieldnum == 2)
				{
					_chat = bitstream.ReadProtobufVarInt();
				}
				else if (wireType == 2 && fieldnum == 3)
				{
					MsgName = bitstream.ReadProtobufString();
				}
				else if (wireType == 0 && fieldnum == 5)
				{
					_textAllChat = bitstream.ReadProtobufVarInt();
				}
				else if (wireType == 2 && fieldnum == 4)
				{
					Params.Add(bitstream.ReadProtobufString());
				}
				else
					throw new InvalidDataException();
			}
			Raise(parser);
		}

		private void Raise(DemoParser parser)
		{
			// struct methods are called with a hidden ref to "this",
			// I have to make a local copy to be able to use it in the lambda expression
			IList<string> parameters = Params;
			SayText2EventArgs e = new SayText2EventArgs
			{
				Sender = parser.Players.Values.FirstOrDefault(x => x.Name == parameters[0]),
				Text = Params[1],
				IsChat = Chat,
				IsChatAll = TextAllChat
			};

			parser.RaiseSayText2(e);
		}
	}
}
