using Core.Models.Serialization;
using Newtonsoft.Json;

namespace Core.Models.Events
{
    public class WeaponFireEvent : BaseEvent
    {
        [JsonProperty("heatmap_point")] public HeatmapPoint Point { get; set; }

        [JsonProperty("shooter_steamid")]
        [JsonConverter(typeof(LongToStringConverter))]
        public long ShooterSteamId { get; set; }

        [JsonProperty("shooter_name")] public string ShooterName { get; set; }

        [JsonProperty("shooter_side")]
        public Side ShooterSide { get; set; }

        [JsonProperty("weapon")] public Weapon Weapon { get; set; }

        [JsonProperty("round_number")] public int RoundNumber { get; set; }

        [JsonProperty("shooter_vel_x")] public float ShooterVelocityX { get; set; }

        [JsonProperty("shooter_vel_y")] public float ShooterVelocityY { get; set; }

        [JsonProperty("shooter_vel_z")] public float ShooterVelocityZ { get; set; }

        [JsonProperty("shooter_pos_x")] public float ShooterPosX { get; set; }

        [JsonProperty("shooter_pos_y")] public float ShooterPosY { get; set; }

        [JsonProperty("shooter_pos_z")] public float ShooterPosZ { get; set; }

        [JsonProperty("shooter_angle_pitch")] public float ShooterAnglePitch { get; set; }

        [JsonProperty("shooter_angle_yaw")] public float ShooterAngleYaw { get; set; }

        [JsonIgnore] public override string Message => ShooterName + " thrown " + Weapon.Name;

        public WeaponFireEvent(int tick, float seconds) : base(tick, seconds)
        {
        }
    }
}
