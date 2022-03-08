using System.IO;

namespace DemoInfo.DP.FastNetmessages
{
    /// <summary>
    /// FastNetMessage adaptation of CMsg_CVars protobuf message
    /// https://github.com/SteamRE/SteamKit/blob/master/Resources/Protobufs/csgo/netmessages.proto#L127
    /// </summary>
    public struct CVars
    {
        public void Parse(IBitStream bitstream, DemoParser parser)
        {
            while (!bitstream.ChunkFinished)
            {
                var desc = bitstream.ReadProtobufVarInt();
                var wireType = desc & 7;
                var fieldnum = desc >> 3;

                if (wireType == 2 && fieldnum == 1)
                {
                    bitstream.BeginChunk(bitstream.ReadProtobufVarInt() * 8);
                    new CVar().Parse(bitstream, parser);
                    bitstream.EndChunk();
                }
                else
                {
                    throw new InvalidDataException();
                }
            }
        }
    }
}
