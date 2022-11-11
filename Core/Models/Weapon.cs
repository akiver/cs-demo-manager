using System.Collections.Generic;
using DemoInfo;
using Newtonsoft.Json;

namespace Core.Models
{
    public enum WeaponType
    {
        Pistol = 1,
        Rifle = 2,
        Sniper = 3,
        SMG = 4,
        Heavy = 5,
        Equipment = 6,
        Grenade = 7,
        Unkown = 8,
    }

    public class Weapon
    {
        public const string AK_47 = "AK-47";
        public const string AUG = "AUG";
        public const string M4A4 = "M4A4";
        public const string FAMAS = "Famas";
        public const string AWP = "AWP";
        public const string M4A1_S = "M4A1-S";
        public const string GLOCK = "Glock-18";
        public const string USP = "USP-S";
        public const string DEAGLE = "Desert Eagle";
        public const string P250 = "P250";
        public const string GALIL = "Galil AR";
        public const string SG008 = "SG008";
        public const string PP_BIZON = "PP-Bizon";
        public const string C4 = "C4";
        public const string CZ75 = "CZ75-Auto";
        public const string DUAL_BERETTAS = "Dual Berettas";
        public const string FIVE_SEVEN = "Five-SeveN";
        public const string G3SG1 = "G3SG1";
        public const string KNIFE = "Knife";
        public const string M249 = "M249";
        public const string MP5SD = "MP5-SD";
        public const string MP7 = "MP7";
        public const string MP9 = "MP9";
        public const string MAC_10 = "MAC-10";
        public const string NEGEV = "Negev";
        public const string NOVA = "Nova";
        public const string XM1014 = "XM1014";
        public const string P2000 = "P2000";
        public const string P90 = "P90";
        public const string SG_553 = "SG 553";
        public const string SAWED_OFF = "Sawed-Off";
        public const string SCAR_20 = "Scar-20";
        public const string SSG_08 = "SSG 08";
        public const string MAG_7 = "MAG-7";
        public const string TEC_9 = "Tec-9";
        public const string UMP_45 = "UMP-45";
        public const string R8 = "R8 Revolver";
        public const string ZEUS = "Zeus (Tazer)";
        public const string FLASHBANG = "Flashbang";
        public const string HE = "HE Grenade";
        public const string SMOKE = "Smoke";
        public const string DECOY = "Decoy";
        public const string MOLOTOV = "Molotov";
        public const string INCENDIARY = "Incendiary";
        public const string KEVLAR = "Kevlar";
        public const string HELMET = "Helmet";
        public const string DEFUSE_KIT = "Defuse Kit";
        public const string WORLD = "World";
        public const string UNKNOWN = "Unknown";

        [JsonProperty("element")] public EquipmentElement Element { get; set; }

        [JsonProperty("type")] public WeaponType Type { get; set; }

        [JsonProperty("weapon_name")] public string Name { get; set; }

        [JsonIgnore] public int KillAward { get; set; }

        public override bool Equals(object obj)
        {
            var item = (Weapon)obj;

            return item != null && Element == item.Element;
        }

        public override int GetHashCode()
        {
            return 1;
        }

        public static List<Weapon> WeaponList = new List<Weapon>
        {
            new Weapon
            {
                Element = EquipmentElement.AK47,
                Name = AK_47,
                Type = WeaponType.Rifle,
                KillAward = 300,
            },
            new Weapon
            {
                Element = EquipmentElement.AUG,
                Name = AUG,
                Type = WeaponType.Rifle,
                KillAward = 300,
            },
            new Weapon
            {
                Element = EquipmentElement.AWP,
                Name = AWP,
                Type = WeaponType.Sniper,
                KillAward = 100,
            },
            new Weapon
            {
                Element = EquipmentElement.Bizon,
                Name = PP_BIZON,
                Type = WeaponType.SMG,
                KillAward = 600,
            },
            new Weapon
            {
                Element = EquipmentElement.Bomb,
                Name = C4,
                Type = WeaponType.Equipment,
                KillAward = 0,
            },
            new Weapon
            {
                Element = EquipmentElement.CZ,
                Name = CZ75,
                Type = WeaponType.Pistol,
                KillAward = 100,
            },
            new Weapon
            {
                Element = EquipmentElement.Deagle,
                Name = DEAGLE,
                Type = WeaponType.Pistol,
                KillAward = 300,
            },
            new Weapon
            {
                Element = EquipmentElement.DualBarettas,
                Name = DUAL_BERETTAS,
                Type = WeaponType.Pistol,
                KillAward = 300,
            },
            new Weapon
            {
                Element = EquipmentElement.Famas,
                Name = FAMAS,
                Type = WeaponType.Rifle,
                KillAward = 300,
            },
            new Weapon
            {
                Element = EquipmentElement.FiveSeven,
                Name = FIVE_SEVEN,
                Type = WeaponType.Pistol,
                KillAward = 300,
            },
            new Weapon
            {
                Element = EquipmentElement.G3SG1,
                Name = G3SG1,
                Type = WeaponType.Sniper,
                KillAward = 300,
            },
            new Weapon
            {
                Element = EquipmentElement.Galil,
                Name = GALIL,
                Type = WeaponType.Rifle,
                KillAward = 300,
            },
            new Weapon
            {
                Element = EquipmentElement.Glock,
                Name = GLOCK,
                Type = WeaponType.Pistol,
                KillAward = 300,
            },
            new Weapon
            {
                Element = EquipmentElement.Knife,
                Name = KNIFE,
                Type = WeaponType.Equipment,
                KillAward = 1500,
            },
            new Weapon
            {
                Element = EquipmentElement.M249,
                Name = M249,
                Type = WeaponType.Heavy,
                KillAward = 300,
            },
            new Weapon
            {
                Element = EquipmentElement.M4A1,
                Name = M4A1_S,
                Type = WeaponType.Rifle,
                KillAward = 300,
            },
            new Weapon
            {
                Element = EquipmentElement.M4A4,
                Name = M4A4,
                Type = WeaponType.Rifle,
                KillAward = 300,
            },
            new Weapon
            {
                Element = EquipmentElement.MP5SD,
                Name = MP5SD,
                Type = WeaponType.SMG,
                KillAward = 600,
            },
            new Weapon
            {
                Element = EquipmentElement.MP7,
                Name = MP7,
                Type = WeaponType.SMG,
                KillAward = 600,
            },
            new Weapon
            {
                Element = EquipmentElement.MP9,
                Name = MP9,
                Type = WeaponType.SMG,
                KillAward = 600,
            },
            new Weapon
            {
                Element = EquipmentElement.Mac10,
                Name = MAC_10,
                Type = WeaponType.SMG,
                KillAward = 600,
            },
            new Weapon
            {
                Element = EquipmentElement.Negev,
                Name = NEGEV,
                Type = WeaponType.Heavy,
                KillAward = 300,
            },
            new Weapon
            {
                Element = EquipmentElement.Nova,
                Name = NOVA,
                Type = WeaponType.Heavy,
                KillAward = 900,
            },
            new Weapon
            {
                Element = EquipmentElement.P2000,
                Name = P2000,
                Type = WeaponType.Pistol,
                KillAward = 300,
            },
            new Weapon
            {
                Element = EquipmentElement.P250,
                Name = P250,
                Type = WeaponType.Pistol,
                KillAward = 300,
            },
            new Weapon
            {
                Element = EquipmentElement.P90,
                Name = P90,
                Type = WeaponType.SMG,
                KillAward = 300,
            },
            new Weapon
            {
                Element = EquipmentElement.SG556,
                Name = SG_553,
                Type = WeaponType.Rifle,
                KillAward = 300,
            },
            new Weapon
            {
                Element = EquipmentElement.SawedOff,
                Name = SAWED_OFF,
                Type = WeaponType.Heavy,
                KillAward = 900,
            },
            new Weapon
            {
                Element = EquipmentElement.Scar20,
                Name = SCAR_20,
                Type = WeaponType.Sniper,
                KillAward = 300,
            },
            new Weapon
            {
                Element = EquipmentElement.Scout,
                Name = SSG_08,
                Type = WeaponType.Sniper,
                KillAward = 300,
            },
            new Weapon
            {
                Element = EquipmentElement.Swag7,
                Name = MAG_7,
                Type = WeaponType.Heavy,
                KillAward = 900,
            },
            new Weapon
            {
                Element = EquipmentElement.Tec9,
                Name = TEC_9,
                Type = WeaponType.Pistol,
                KillAward = 300,
            },
            new Weapon
            {
                Element = EquipmentElement.UMP,
                Name = UMP_45,
                Type = WeaponType.SMG,
                KillAward = 600,
            },
            new Weapon
            {
                Element = EquipmentElement.USP,
                Name = USP,
                Type = WeaponType.Pistol,
                KillAward = 300,
            },
            new Weapon
            {
                Element = EquipmentElement.Revolver,
                Name = R8,
                Type = WeaponType.Pistol,
                KillAward = 300,
            },
            new Weapon
            {
                Element = EquipmentElement.XM1014,
                Name = XM1014,
                Type = WeaponType.Heavy,
                KillAward = 900,
            },
            new Weapon
            {
                Element = EquipmentElement.Zeus,
                Name = ZEUS,
                Type = WeaponType.Equipment,
                KillAward = 300,
            },
            new Weapon
            {
                Element = EquipmentElement.Flash,
                Name = FLASHBANG,
                Type = WeaponType.Grenade,
                KillAward = 300,
            },
            new Weapon
            {
                Element = EquipmentElement.HE,
                Name = HE,
                Type = WeaponType.Grenade,
                KillAward = 300,
            },
            new Weapon
            {
                Element = EquipmentElement.Decoy,
                Name = DECOY,
                Type = WeaponType.Grenade,
                KillAward = 300,
            },
            new Weapon
            {
                Element = EquipmentElement.Smoke,
                Name = SMOKE,
                Type = WeaponType.Grenade,
                KillAward = 300,
            },
            new Weapon
            {
                Element = EquipmentElement.Molotov,
                Name = MOLOTOV,
                Type = WeaponType.Grenade,
                KillAward = 300,
            },
            new Weapon
            {
                Element = EquipmentElement.Incendiary,
                Name = INCENDIARY,
                Type = WeaponType.Grenade,
                KillAward = 300,
            },
            new Weapon
            {
                Element = EquipmentElement.Kevlar,
                Name = KEVLAR,
                Type = WeaponType.Equipment,
                KillAward = 0,
            },
            new Weapon
            {
                Element = EquipmentElement.Helmet,
                Name = HELMET,
                Type = WeaponType.Equipment,
                KillAward = 0,
            },
            new Weapon
            {
                Element = EquipmentElement.DefuseKit,
                Name = DEFUSE_KIT,
                Type = WeaponType.Equipment,
                KillAward = 0,
            },
            new Weapon
            {
                Element = EquipmentElement.World,
                Name = WORLD,
                Type = WeaponType.Unkown,
                KillAward = 0,
            },
            new Weapon
            {
                Element = EquipmentElement.Unknown,
                Name = UNKNOWN,
                Type = WeaponType.Unkown,
            },
        };
    }
}
