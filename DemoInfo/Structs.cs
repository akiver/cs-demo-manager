using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DemoInfo
{
	public class DemoHeader
    {
        const int MAX_OSPATH = 260;

	    public string Filestamp { get; private set; }		// Should be HL2DEMO
        public int Protocol { get; private set; }		// Should be DEMO_PROTOCOL
        public int NetworkProtocal { get; private set; }				// Should be PROTOCOL_VERSION
        public string ServerName { get; private set; }		            // Name of server
        public string ClientName { get; private set; }		            // Name of client who recorded the game
        public string MapName { get; private set; }			        // Name of map
        public string GameDirectory { get; private set; }	            // Name of game directory (com_gamedir)
        public float PlaybackTime { get; private set; }				// Time of track
        public int PlaybackTicks { get; private set; }				// # of ticks in track
        public int PlaybackFrames { get; private set; }			// # of frames in track
        public int SignonLength { get; private set; }				// length of sigondata in bytes

        public static DemoHeader ParseFrom(BinaryReader reader)
        {
            return new DemoHeader() {
                Filestamp = reader.ReadCString(8),
                Protocol = reader.ReadInt32(),
                NetworkProtocal = reader.ReadInt32(),
                ServerName = reader.ReadCString(MAX_OSPATH),

                ClientName = reader.ReadCString(MAX_OSPATH),
                MapName = reader.ReadCString(MAX_OSPATH),
                GameDirectory = reader.ReadCString(MAX_OSPATH),
                PlaybackTime = reader.ReadSingle(),

                PlaybackTicks = reader.ReadInt32(),
                PlaybackFrames = reader.ReadInt32(),
                SignonLength = reader.ReadInt32(),
            };
        }
    }

	public class Vector
    {
        public float X { get; set; }
        public float Y { get; set; }
        public float Z { get; set; }

		public double Angle2D
		{
			get
			{
				return Math.Atan2(this.Y, this.X); 
			}
		}

        public static Vector Parse(BinaryReader reader)
        {
            return new Vector
            {
                X = reader.ReadSingle(),
                Y = reader.ReadSingle(),
                Z = reader.ReadSingle(),
            };
        }

		public static Vector operator + (Vector a, Vector b)
		{
			return new Vector() {X = a.X + b.X, Y = a.Y + b.Y, Z = a.Z + b.Z };
		}

		public static Vector operator - (Vector a, Vector b)
		{
			return new Vector() {X = a.X - b.X, Y = a.Y - b.Y, Z = a.Z - b.Z };
		}

        public override string ToString()
        {
            return "{X: " + X + ", Y: " + Y + ", Z: " + Z + " }";
        }
    }

	class QAngle
    {
        public float X { get; private set; }
        public float Y { get; private set; }
        public float Z { get; private set; }

        public static QAngle Parse(BinaryReader reader)
        {
            return new QAngle
            {
                X = reader.ReadSingle(),
                Y = reader.ReadSingle(),
                Z = reader.ReadSingle(),
            };
        }
    }

    

	class Split
    {
        const int FDEMO_NORMAL = 0, FDEMO_USE_ORIGIN2 = 1, FDEMO_USE_ANGLES2 = 2, FDEMO_NOINTERP = 4;

        public int Flags { get; private set; }
        public Vector viewOrigin { get; private set; }
        public QAngle viewAngles { get; private set; }
        public QAngle localViewAngles { get; private set; }

        public Vector viewOrigin2 { get; private set; }
        public QAngle viewAngles2 { get; private set; }
        public QAngle localViewAngles2 { get; private set; }

        public Vector ViewOrigin { get { return (Flags & FDEMO_USE_ORIGIN2) != 0 ? viewOrigin2 : viewOrigin;  }}
    
        public QAngle ViewAngles { get { return (Flags & FDEMO_USE_ANGLES2) != 0 ? viewAngles2 : viewAngles;   }}
    
        public QAngle LocalViewAngles { get { return (Flags & FDEMO_USE_ANGLES2) != 0 ? localViewAngles2 : localViewAngles; }}
    
        public static Split Parse(BinaryReader reader)
        {
            return new Split
            {
                Flags = reader.ReadInt32(),
                viewOrigin = Vector.Parse(reader),
                viewAngles = QAngle.Parse(reader),
                localViewAngles = QAngle.Parse(reader),

                viewOrigin2 = Vector.Parse(reader),
                viewAngles2 = QAngle.Parse(reader),
                localViewAngles2 = QAngle.Parse(reader),
            };
        }
    }

	class CommandInfo
    {
        public Split[] u { get; private set; }

        public static CommandInfo Parse(BinaryReader reader)
        {
            return new CommandInfo 
            {
                u = new Split[2] { Split.Parse(reader), Split.Parse(reader) }
            };
        }
    }
    
    public class PlayerInfo
    {
	    /// version for future compatibility
	    public long Version { get; set; }

	    // network xuid
        public long XUID { get; set; }

	    // scoreboard information
        public string Name { get; set; } //MAX_PLAYER_NAME_LENGTH=128

	    // local server user ID, unique while server is running
        public int UserID { get; set; }

	    // global unique player identifer
        public string GUID { get; set; } //33bytes

	    // friends identification number
        public int FriendsID { get; set; }
	    // friends name
        public string FriendsName { get; set; } //128

	    // true, if player is a bot controlled by game.dll
        public bool IsFakePlayer { get; set; }

	    // true if player is the HLTV proxy
        public bool IsHLTV { get; set; }

        // custom files CRC for this player
        public int customFiles0 { get; set; }
        public int customFiles1 { get; set; }
        public int customFiles2 { get; set; }
        public int customFiles3 { get; set; }

        byte filesDownloaded { get; set; }

	    // this counter increases each time the server downloaded a new file
        byte FilesDownloaded { get; set; }

		internal PlayerInfo()
		{
		}

		internal PlayerInfo(BinaryReader reader)
        {
            Version = reader.ReadInt64SwapEndian();
            XUID = reader.ReadInt64SwapEndian();
            Name = reader.ReadCString(128);
            UserID = reader.ReadInt32SwapEndian();
            GUID = reader.ReadCString(33);
            FriendsID = reader.ReadInt32SwapEndian();
            FriendsName = reader.ReadCString(128);

            IsFakePlayer = reader.ReadBoolean();
            IsHLTV = reader.ReadBoolean();

            customFiles0 = reader.ReadInt32();
            customFiles1 = reader.ReadInt32();
            customFiles2 = reader.ReadInt32();
            customFiles3 = reader.ReadInt32();

            filesDownloaded = reader.ReadByte();
        }

        public static PlayerInfo ParseFrom(BinaryReader reader)
        {
            return new PlayerInfo(reader);
        }

        public static int SizeOf { get { return 8 + 8 + 128 + 4 + 3 + 4 + 1 + 1 + 4 * 8 + 1; } }
    }

    enum DemoCommand
    {

        /// <summary>
        /// it's a startup message, process as fast as possible
        /// </summary>
	    Signon	= 1,
        /// <summary>
        // it's a normal network packet that we stored off
        /// </summary>
	    Packet,

        /// <summary>
        /// sync client clock to demo tick
        /// </summary>
	    Synctick,

	    /// <summary>
        /// Console Command
	    /// </summary>
	    ConsoleCommand,

        /// <summary>
        /// user input command
        /// </summary>
	    UserCommand,

	    /// <summary>
        ///  network data tables
	    /// </summary>
	    DataTables,
	    
        /// <summary>
        /// end of time.
        /// </summary>
	    Stop,

	    /// <summary>
        /// a blob of binary data understood by a callback function
	    /// </summary>
	    CustomData,

	    StringTables,

	    /// <summary>
	    /// Last Command
	    /// </summary>
	    LastCommand	= StringTables,

         /// <summary>
	    /// First Command
	    /// </summary>
	    FirstCommand	= Signon
    };
}
