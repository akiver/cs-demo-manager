using System.Collections.Generic;
using Core.Models;

namespace Services.Models.Movie
{
	public class MovieConfiguration
	{
		public Demo Demo { get; set; }
		/// <summary>s
		/// Run CSGO in fullscreen?
		/// </summary>
		public bool FullScreen { get; set; } = false;
		/// <summary>s
		/// Use VirtualDub or FFmpeg?
		/// </summary>
		public bool UseVirtualDub { get; set; } = true;
		/// <summary>
		/// Delete all raw files at the end of encoding?
		/// </summary>
		public bool CleanUpRawFiles { get; set; } = true;
		/// <summary>
		/// Automatically close the game at the end of recording?
		/// </summary>
		public bool AutoCloseGame { get; set; } = true;
		/// <summary>
		/// Generate the video file?
		/// Users may want only the raw files.
		/// </summary>
		public bool GenerateVideoFile { get; set; } = true;
		/// <summary>
		/// Generate the RAW files?
		/// </summary>
		public bool GenerateRawFiles { get; set; } = true;
		/// <summary>
		/// Recording will start at this tick.
		/// </summary>
		public int StartTick { get; set; }
		/// <summary>
		/// Recording will stop at this tick.
		/// </summary>
		public int EndTick { get; set; }
		/// <summary>
		/// host_framerate used during game recording.
		/// </summary>
		public int FrameRate { get; set; }
		/// <summary>
		/// Focus the camera on this player before recording (spec_player_by_accountid).
		/// </summary>
		public long FocusSteamId { get; set; }
		/// <summary>
		/// SteamIDs that will be hidden on the deathnotices using "mirv_deathmsg block xSTEAMID *" command.
		/// </summary>
		public List<long> BlockedSteamIdList { get; set; } = new List<long>();
		/// <summary>
		/// SteamIDs that will be highlighted on the deathnotices using "mirv_deathmsg highLightId xSTEAMID" command.
		/// This command is added 5 ticks before the kill because "mirv_deathmsg highLightId" is a "static variable", it needs to be updated during playback.
		/// </summary>
		public List<long> HighlightSteamIdList { get; set; } = new List<long>();
		/// <summary>
		/// User's custom CFG.
		/// </summary>
		public List<string> UserCfg { get; set; } = new List<string>();
		/// <summary>
		/// Video codec used for FFmpeg.
		/// Force x264 ATM, maybe make it configurable?
		/// </summary>
		public string VideoCodec { get; set; } = "libx264";
		/// <summary>
		/// x264 quality (crf parameter value).
		/// </summary>
		public int VideoQuality { get; set; } = 23;
		/// <summary>
		/// Audio codec used for FFmpeg.
		/// Force MP3 ATM, maybe make it configurable?
		/// </summary>
		public string AudioCodec { get; set; } = "libmp3lame";
		/// <summary>
		/// Audio bitrate used for FFmpeg.
		/// </summary>
		public int AudioBitrate { get; set; } = 256;
		/// <summary>
		/// Path where raw files (tga and wav) will be saved.
		/// </summary>
		public string RawFilesDestination { get; set; }
		/// <summary>
		/// Folder where the video file will be saved.
		/// </summary>
		public string OutputFileDestinationFolder { get; set; }
		/// <summary>
		/// Video's filename.
		/// </summary>
		public string OutputFilename { get; set; }
		/// <summary>
		/// Open the video in Windows Explorer when encoding is done?
		/// </summary>
		public bool OpenInExplorer { get; set; } = true;
		/// <summary>
		/// Additional FFmpeg input parameters.
		/// </summary>
		public string FFmpegInputParameters { get; set; }
		/// <summary>
		/// Additional FFmpeg extra parameters.
		/// </summary>
		public string FFmpegExtraParameters { get; set; }
		/// <summary>
		/// Width resolution the game will start.
		/// </summary>
		public int Width { get; set; }
		/// <summary>
		/// Height resolution the game will start.
		/// </summary>
		public int Height { get; set; }
		/// <summary>
		/// Add -worldwide startup parameter.
		/// </summary>
		public bool IsWorldwideEnabled { get; set; } = false;
		/// <summary>
		/// Enable HLAE config parent.
		/// </summary>
		public bool EnableHlaeConfigParent { get; set; } = false;
		/// <summary>
		/// HLAE config parent folder path.
		/// </summary>
		public string HlaeConfigParentFolderPath { get; set; }
		/// <summary>
		/// Additional game launch parameters
		/// </summary>
		public string LaunchParameters { get; set; }
		/// <summary>
		/// How many seconds the death notices will be displayed.
		/// mirv_deathmsg cfg noticeLifeTime f
		/// </summary>
		public float DeathsNoticesDisplayTime { get; set; } = 5;
	}
}
