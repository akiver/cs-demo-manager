using DemoInfo.Messages;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace DemoInfo.DP
{
	public static class DemoPacketParser
    {
		private static IEnumerable<IMessageParser> Parsers = (
			from type in Assembly.GetExecutingAssembly().GetTypes()
			where type.GetInterfaces().Contains(typeof(IMessageParser))
			let parser = (IMessageParser)type.GetConstructor(new Type[0]).Invoke(new object[0])
			orderby -parser.Priority
			select parser).ToArray();

		public static void ParsePacket(Stream stream, DemoParser demo)
        {
			var reader = new BinaryReader(stream);

			while (stream.Position < stream.Length)
            {
                int cmd = reader.ReadVarInt32();

                Type toParse = null;

                if (Enum.IsDefined(typeof(SVC_Messages), cmd))
                {
                    SVC_Messages msg = (SVC_Messages)cmd;
                    toParse = Assembly.GetExecutingAssembly().GetType("DemoInfo.Messages.CSVCMsg_" + msg.ToString().Substring(4));
                }
                else if (Enum.IsDefined(typeof(NET_Messages), cmd))
                {
                    NET_Messages msg = (NET_Messages)cmd;
                    toParse = Assembly.GetExecutingAssembly().GetType("DemoInfo.Messages.CNETMsg_" + msg.ToString().Substring(4));
                }

                if (toParse == null)  
                {
                    reader.ReadBytes(reader.ReadVarInt32());
                    continue;
                }


                var result = reader.ReadProtobufMessage(toParse, ProtoBuf.PrefixStyle.Base128);

                foreach (var parser in Parsers)
                {
                    if (parser.CanHandleMessage(result))
                    {
                        parser.ApplyMessage(result, demo);

                        if (parser.Priority > 0)
                            break;
                    }
                }
                
            }
        }
    }
}
