using System.IO;

namespace DemoInfo
{
    public struct NETTick
    {
        public uint Tick;
        public uint HostComputationTime;
        public uint HostComputationTimeStdDeviation;
        public uint HostFramestartTimeStdDeviation;

        public void Parse(IBitStream bitstream, DemoParser parser)
        {
            while (!bitstream.ChunkFinished)
            {
                var desc = bitstream.ReadProtobufVarInt();
                var wireType = desc & 7;
                var fieldnum = desc >> 3;
                if (wireType != 0)
                {
                    throw new InvalidDataException();
                }

                var val = (uint)bitstream.ReadProtobufVarInt();

                switch (fieldnum)
                {
                    case 1:
                        Tick = val;
                        break;
                    case 4:
                        HostComputationTime = val;
                        break;
                    case 5:
                        HostComputationTimeStdDeviation = val;
                        break;
                    case 6:
                        HostFramestartTimeStdDeviation = val;
                        break;
                    default:
                        // silently drop
                        break;
                }
            }
        }
    }
}
