using System;
using System.IO;
using System.Linq;

namespace DemoInfo.DP.FastNetmessages
{
    public struct VoiceData
    {
        public int Client;
        private int _proximity;
        public bool Proximity => _proximity != 0;
        public long SteamID;
        public byte[] Data;
        public int AudibleMask;
        private int _caster;
        public bool Caster => _caster != 0;
        private int _format;
        public string Format
        {
            get
            {
                if (_format == 0)
                {
                    return "VOICEDATA_FORMAT_STEAM";
                }

                return "VOICEDATA_FORMAT_ENGINE";
            }
        }
        public int SequenceBytes;
        public uint SectionNumber;
        public uint UncompressedSampleOffset;

        public void Parse(IBitStream bitstream, DemoParser parser)
        {
            while (!bitstream.ChunkFinished)
            {
                var desc = bitstream.ReadProtobufVarInt();
                var wireType = desc & 7;
                var fieldnum = desc >> 3;

                if (wireType == 0 && fieldnum == 1)
                {
                    Client = bitstream.ReadProtobufVarInt();
                }
                else if (wireType == 0 && fieldnum == 2)
                {
                    _proximity = bitstream.ReadProtobufVarInt();
                }
                else if (wireType == 1 && fieldnum == 3)
                {
                    SteamID = bitstream.ReadFixedInt64();
                }
                else if (wireType == 0 && fieldnum == 4)
                {
                    AudibleMask = bitstream.ReadProtobufVarInt();
                }
                else if (wireType == 2 && fieldnum == 5)
                {
                    Data = bitstream.ReadBytes(bitstream.ReadProtobufVarInt());
                }
                else if (wireType == 0 && fieldnum == 6)
                {
                    _caster = bitstream.ReadProtobufVarInt();
                }
                else if (wireType == 0 && fieldnum == 7)
                {
                    _format = bitstream.ReadProtobufVarInt();
                }
                else if (wireType == 0 && fieldnum == 8)
                {
                    SequenceBytes = bitstream.ReadProtobufVarInt();
                }
                else if (wireType == 0 && fieldnum == 9)
                {
                    SectionNumber = (uint)bitstream.ReadProtobufVarInt();
                }
                else if (wireType == 0 && fieldnum == 10)
                {
                    UncompressedSampleOffset = (uint)bitstream.ReadProtobufVarInt();
                }
                else
                {
                    throw new InvalidDataException();
                }
            }

            Raise(parser);
        }

        private void Raise(DemoParser parser)
        {
            var steamId = SteamID;
            var e = new VoiceDataEventArgs
            {
                AudibleMask = AudibleMask,
                Data = Data,
                Caster = Caster,
                Client = Client,
                Format = Format,
                Proximity = Proximity,
                SectionNumber = SectionNumber,
                SequenceBytes = SequenceBytes,
                SteamID = SteamID,
                UncompressedSampleOffset = UncompressedSampleOffset,
                Player = parser.Players.Values.FirstOrDefault(p => p.SteamID == steamId),
            };

            parser.RaiseVoiceData(e);
        }
    }
}
