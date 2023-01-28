using Core.Models.Serialization;
using Newtonsoft.Json;

namespace Core.Models.Events
{
    public class KillEvent : BaseEvent
    {
        [JsonProperty("killer_steamid")]
        [JsonConverter(typeof(LongToStringConverter))]
        public long KillerSteamId { get; set; }

        [JsonProperty("killed_steamid")]
        [JsonConverter(typeof(LongToStringConverter))]
        public long KilledSteamId { get; set; }

        [JsonProperty("assister_steamid")]
        [JsonConverter(typeof(LongToStringConverter))]
        public long AssisterSteamId { get; set; }

        [JsonProperty("weapon")] public Weapon Weapon { get; set; }

        [JsonProperty("heatmap_point")] public KillHeatmapPoint Point { get; set; }

        [JsonProperty("killer_vel_x")] public float KillerVelocityX { get; set; }

        [JsonProperty("killer_vel_y")] public float KillerVelocityY { get; set; }

        [JsonProperty("killer_vel_z")] public float KillerVelocityZ { get; set; }

        [JsonProperty("killer_side")]
        public Side KillerSide { get; set; }

        [JsonProperty("killer_team")] public string KillerTeam { get; set; }

        [JsonProperty("killed_side")]
        public Side KilledSide { get; set; }

        [JsonProperty("killed_team")] public string KilledTeam { get; set; }

        [JsonProperty("killer_name")] public string KillerName { get; set; }

        [JsonProperty("killed_name")] public string KilledName { get; set; }

        [JsonProperty("assister_name")] public string AssisterName { get; set; }

        [JsonProperty("round_number")] public int RoundNumber { get; set; }

        /// <summary>
        /// Number of seconds elapsed since the freezetime end
        /// </summary>
        [JsonProperty("time_death_seconds")]
        public float TimeDeathSeconds { get; set; }

        [JsonProperty("killer_crouching")] public bool IsKillerCrouching { get; set; }

        [JsonProperty("killer_blinded")] public bool KillerIsBlinded { get; set; }

        [JsonProperty("is_trade_kill")] public bool IsTradeKill { get; set; }

        [JsonProperty("is_headshot")] public bool IsHeadshot { get; set; }

        [JsonProperty("killer_is_controlling_bot")]
        public bool KillerIsControllingBot { get; set; }

        [JsonProperty("killed_is_controlling_bot")]
        public bool KilledIsControllingBot { get; set; }

        [JsonProperty("victim_blinded")] public bool VictimIsBlinded { get; set; }

        [JsonProperty("assister_is_controlling_bot")]
        public bool AssisterIsControllingBot { get; set; }

        [JsonIgnore] public override string Message => KillerName + " killed " + KilledName + " with " + Weapon.Name;

        [JsonIgnore]
        public bool IsKillerBot => KillerSteamId == 0;

        [JsonIgnore]
        public bool IsVictimBot => KilledSteamId == 0;

        public KillEvent(int tick, float seconds) : base(tick, seconds)
        {
        }
    }
}
