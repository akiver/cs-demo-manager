namespace DemoInfo.DP.FastNetmessages
{
    public struct ServerInfo
    {
        public int Protocol;
        public int ServerCount;
        private int _isDedicated;
        public bool IsDedicated => _isDedicated != 0;
        private int _isOfficialValveServer;
        public bool IsOfficialValveServer => _isOfficialValveServer != 0;
        private int _isHltv;
        public bool IsHltv => _isHltv != 0;
        private int _isReplay;
        public bool IsReplay => _isReplay != 0;
        public int COs;
        public uint MapCrc;
        public uint ClientCrc;
        public uint StringTableCrc;
        public int MaxClients;
        public int MaxClasses;
        public int PlayerSlot;
        public float TickInterval;
        public string GameDir;
        public string MapName;
        public string MapGroupName;
        public string SkyName;
        public string Hostname;
        public uint PublicIp;
        private int _isRedirectingToProxyRelay;
        public bool IsRedirectingToProxyRelay => _isRedirectingToProxyRelay != 0;
        public uint UgcMapId;

        public void Parse(IBitStream bitstream, DemoParser parser)
        {
            while (!bitstream.ChunkFinished)
            {
                var desc = bitstream.ReadProtobufVarInt();
                var wireType = desc & 7;
                var fieldnum = desc >> 3;

                if (wireType == 0 && fieldnum == 1)
                {
                    Protocol = bitstream.ReadProtobufVarInt();
                }
                else if (wireType == 0 && fieldnum == 2)
                {
                    ServerCount = bitstream.ReadProtobufVarInt();
                }
                else if (wireType == 0 && fieldnum == 3)
                {
                    _isDedicated = bitstream.ReadProtobufVarInt();
                }
                else if (wireType == 0 && fieldnum == 4)
                {
                    _isOfficialValveServer = bitstream.ReadProtobufVarInt();
                }
                else if (wireType == 0 && fieldnum == 5)
                {
                    _isHltv = bitstream.ReadProtobufVarInt();
                }
                else if (wireType == 0 && fieldnum == 6)
                {
                    _isReplay = bitstream.ReadProtobufVarInt();
                }
                else if (wireType == 0 && fieldnum == 7)
                {
                    COs = bitstream.ReadProtobufVarInt();
                }
                else if (wireType == 5 && fieldnum == 8)
                {
                    MapCrc = bitstream.ReadFixedInt32();
                }
                else if (wireType == 5 && fieldnum == 9)
                {
                    ClientCrc = bitstream.ReadFixedInt32();
                }
                else if (wireType == 5 && fieldnum == 10)
                {
                    StringTableCrc = bitstream.ReadFixedInt32();
                }
                else if (wireType == 0 && fieldnum == 11)
                {
                    MaxClients = bitstream.ReadProtobufVarInt();
                }
                else if (wireType == 0 && fieldnum == 12)
                {
                    MaxClasses = bitstream.ReadProtobufVarInt();
                }
                else if (wireType == 0 && fieldnum == 13)
                {
                    PlayerSlot = bitstream.ReadProtobufVarInt();
                }
                else if (wireType == 5 && fieldnum == 14)
                {
                    TickInterval = bitstream.ReadFloat();
                }
                else if (wireType == 2 && fieldnum == 15)
                {
                    GameDir = bitstream.ReadProtobufString();
                }
                else if (wireType == 2 && fieldnum == 16)
                {
                    MapName = bitstream.ReadProtobufString();
                }
                else if (wireType == 2 && fieldnum == 17)
                {
                    MapGroupName = bitstream.ReadProtobufString();
                }
                else if (wireType == 2 && fieldnum == 18)
                {
                    SkyName = bitstream.ReadProtobufString();
                }
                else if (wireType == 2 && fieldnum == 19)
                {
                    Hostname = bitstream.ReadProtobufString();
                }
                else if (wireType == 0 && fieldnum == 20)
                {
                    PublicIp = (uint)bitstream.ReadProtobufVarInt();
                }
                else if (wireType == 0 && fieldnum == 21)
                {
                    _isRedirectingToProxyRelay = bitstream.ReadProtobufVarInt();
                }
                else if (wireType == 0 && fieldnum == 22)
                {
                    UgcMapId = (uint)bitstream.ReadProtobufVarInt();
                }
            }

            Raise(parser);
        }

        private void Raise(DemoParser parser)
        {
            var e = new ServerInfoEventArgs
            {
                Hostname = Hostname,
                MapName = MapName,
                MaxClients = MaxClients,
                Protocol = Protocol,
                ServerCount = ServerCount,
                TickInterval = TickInterval,
                IsDedicated = IsDedicated,
                IsOfficialValveServer = IsOfficialValveServer,
                IsHltv = IsHltv,
                IsReplay = IsReplay,
                IsRedirectingToProxyRelay = IsRedirectingToProxyRelay,
                COs = COs,
                MapCrc = MapCrc,
                ClientCrc = ClientCrc,
                StringTableCrc = StringTableCrc,
                MaxClasses = MaxClasses,
                PlayerSlot = PlayerSlot,
                GameDir = GameDir,
                MapGroupName = MapGroupName,
                SkyName = SkyName,
                PublicIp = PublicIp,
                UgcMapId = UgcMapId,
            };

            parser.RaiseServerInfo(e);
        }
    }
}
