using System;
using System.Threading.Tasks;
using Core.Models;

namespace Services.Models
{
    public class GameLauncherConfiguration
    {
        public GameLauncherConfiguration(Demo demo)
        {
            Demo = demo;
        }

        public Demo Demo { get; }

        /// <summary>
        /// Start game in fullscreen?
        /// </summary>
        public bool Fullscreen { get; set; }

        /// <summary>
        /// Enable HLAE?
        /// </summary>
        public bool EnableHlae { get; set; } = false;

        /// <summary>
        /// HLAE.exe path.
        /// </summary>
        public string HlaeExePath { get; set; }

        /// <summary>
        /// Enable HLAE config parent?
        /// </summary>
        public bool EnableHlaeConfigParent { get; set; }

        /// <summary>
        /// HLAE config parent folder's path.
        /// </summary>
        public string HlaeConfigParentFolderPath { get; set; }

        /// <summary>
        /// Path to csgo.exe, required for HLAE.
        /// </summary>
        public string CsgoExePath { get; set; }

        /// <summary>
        /// Game resolution width.
        /// </summary>
        public int Width { get; set; }

        /// <summary>
        /// Game resolution height.
        /// </summary>
        public int Height { get; set; }

        /// <summary>
        /// Additional game launch parameters.
        /// </summary>
        public string LaunchParameters { get; set; }

        /// <summary>
        /// Use built-in game highlight lowlight?
        /// </summary>
        public bool UseCustomActionsGeneration { get; set; } = true;

        /// <summary>
        /// Focused account SteamID for highlight / lowlight  long??
        /// </summary>
        public long FocusPlayerSteamId { get; set; }

        /// <summary>
        /// Called when the game is closed.
        /// </summary>
        public Func<Task> OnGameClosed = null;

        /// <summary>
        /// Called when the game is started.
        /// </summary>
        public Func<Task> OnGameStarted = null;

        /// <summary>
        /// Avoid restarting CSGO if a Telnet connection is available.
        /// </summary>
        public bool UseTelnetConnection { get; set; } = true;
    }
}
