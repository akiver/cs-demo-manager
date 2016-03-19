using DemoInfo.Messages;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using DemoInfo.DP.FastNetmessages;

namespace DemoInfo.DP
{
	public static class DemoPacketParser
    {
		#if SLOW_PROTOBUF
		private static IEnumerable<IMessageParser> Parsers = (
			from type in Assembly.GetExecutingAssembly().GetTypes()
			where type.GetInterfaces().Contains(typeof(IMessageParser))
			let parser = (IMessageParser)type.GetConstructor(new Type[0]).Invoke(new object[0])
			orderby -parser.Priority
			select parser).ToArray();
		#endif

		/// <summary>
		/// Parses a demo-packet. 
		/// </summary>
		/// <param name="bitstream">Bitstream.</param>
		/// <param name="demo">Demo.</param>
		public static void ParsePacket(IBitStream bitstream, DemoParser demo)
        {
			//As long as there is stuff to read
			while (!bitstream.ChunkFinished)
            {
				int cmd = bitstream.ReadProtobufVarInt(); //What type of packet is this?
				int length = bitstream.ReadProtobufVarInt(); //And how long is it?
				bitstream.BeginChunk(length * 8); //read length bytes
				if (cmd == (int)SVC_Messages.svc_PacketEntities) { //Parse packet entities
					new PacketEntities().Parse(bitstream, demo); 
				} else if (cmd == (int)SVC_Messages.svc_GameEventList) { //and all this other stuff
					new GameEventList().Parse(bitstream, demo);
				} else if (cmd == (int)SVC_Messages.svc_GameEvent) {
					new GameEvent().Parse(bitstream, demo);
				} else if (cmd == (int)SVC_Messages.svc_CreateStringTable) {
					new CreateStringTable().Parse(bitstream, demo);
				} else if (cmd == (int)SVC_Messages.svc_UpdateStringTable) {
					new UpdateStringTable().Parse(bitstream, demo);
				} else if (cmd == (int)NET_Messages.net_Tick) { //and all this other stuff
						new NETTick().Parse(bitstream, demo);
				} else if (cmd == (int)SVC_Messages.svc_UserMessage) {
					new UserMessage().Parse(bitstream, demo);
				} else {
					//You can use this flag to see what information the other packets contain, 
					//if you want. Then you can look into the objects. Has some advnatages, and some disdavantages (mostly speed), 
					//so we use our own lightning-fast parsing code. 
					#if SLOW_PROTOBUF 
					Type toParse = null;

					if (Enum.IsDefined(typeof(SVC_Messages), cmd)) {
						SVC_Messages msg = (SVC_Messages)cmd;
						toParse = Assembly.GetExecutingAssembly().GetType("DemoInfo.Messages.CSVCMsg_" + msg.ToString().Substring(4));
					} else if (Enum.IsDefined(typeof(NET_Messages), cmd)) {
						NET_Messages msg = (NET_Messages)cmd;
						toParse = Assembly.GetExecutingAssembly().GetType("DemoInfo.Messages.CNETMsg_" + msg.ToString().Substring(4));
					}

					var data = bitstream.ReadBytes(length);
					if (toParse == null)
						continue;

					ProtoBuf.IExtensible result;
					using (var memstream = new MemoryStream(data))
						result = memstream.ReadProtobufMessage(toParse);

					foreach (var parser in Parsers)
						if (parser.TryApplyMessage(result, demo) && (parser.Priority > 0))
							break;
					#endif
				}
				bitstream.EndChunk();
            }
        }
    }
}
