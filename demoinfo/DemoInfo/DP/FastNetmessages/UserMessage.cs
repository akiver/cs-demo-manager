using System;
using DemoInfo.Messages;

namespace DemoInfo.DP.FastNetmessages
{
	/// <summary>
	/// FastNetMessage adaptation of CSVCMsg_UserMessage protobuf message
	/// </summary>
	public struct UserMessage
	{
		/// <summary>
		/// Correspond to User_Messages enum values
		/// </summary>
		public int MsgType;
		/// <summary>
		/// Don't what is it?
		/// </summary>
		public int PassThrough;

		public void Parse(IBitStream bitstream, DemoParser parser)
		{
			while (!bitstream.ChunkFinished)
			{
				var desc = bitstream.ReadProtobufVarInt();
				var wireType = desc & 7;
				var fieldnum = desc >> 3;

				if (wireType == 0 && fieldnum == 1)
				{
					MsgType = bitstream.ReadProtobufVarInt();
				}
				else if (wireType == 0 && fieldnum == 3)
				{
					PassThrough = bitstream.ReadProtobufVarInt();
				} else if (fieldnum == 2) {
					// msg data
					if (wireType == 2)
					{
						bitstream.BeginChunk(bitstream.ReadProtobufVarInt() * 8);
						switch (MsgType)
						{
							// This is where you can add others UserMessage parsing logic
							case (int)User_Messages.um_SayText:
								new SayText().Parse(bitstream, parser);
								break;
							case (int)User_Messages.um_SayText2:
								new SayText2().Parse(bitstream, parser);
								break;
							case (int)User_Messages.um_ServerRankUpdate:
								new ServerRankUpdate().Parse(bitstream, parser);
								break;
						}

						bitstream.EndChunk();
						if (!bitstream.ChunkFinished)
							throw new NotImplementedException("Lord Gaben wasn't nice to us :/");
					}
				}
			}
		}
	}
}
