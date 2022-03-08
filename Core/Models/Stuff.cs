using System.Collections.Generic;

namespace Core.Models
{
    public enum StuffType
    {
        SMOKE = 0,
        FLASHBANG = 1,
        HE = 2,
        MOLOTOV = 3,
        INCENDIARY = 4,
        DECOY = 5,
        UNKNOWN = 6,
    }

    /// <summary>
    /// Use for the stuffs finder view
    /// </summary>
    public class Stuff
    {
        public StuffType Type { get; set; }

        public int Tick { get; set; }

        /// <summary>
        /// Seconds elapsed when the stuff has been thrown since the beginning of the demo.
        /// </summary>
        public float DemoSeconds { get; set; }

        /// <summary>
        /// Seconds elapsed when the stuff has been thrown since the beginning of the round.
        /// </summary>
        public float RoundSeconds { get; set; }

        public int RoundNumber { get; set; }

        public string ThrowerName { get; set; }

        public long ThrowerSteamId { get; set; }

        public float StartX { get; set; }

        public float StartY { get; set; }

        public float EndX { get; set; }

        public float EndY { get; set; }

        public float ShooterPosX { get; set; }

        public float ShooterPosY { get; set; }

        public float ShooterPosZ { get; set; }

        public float ShooterAnglePitch { get; set; }

        public float ShooterAngleYaw { get; set; }

        public List<Player> FlashedPlayers { get; set; }
    }
}
