namespace Core.Models
{
    public enum Side
    {
        None = 0,
        Spectate = 1,
        Terrorist = 2,
        CounterTerrorist = 3,
    }

    public static class SideExtensions
    {
        public static string AsString(this Side side)
        {
            switch (side)
            {
                case Side.CounterTerrorist:
                    return "CT";
                case Side.Terrorist:
                    return "T";
                case Side.Spectate:
                    return "SPEC";
                default:
                    return string.Empty;
            }
        }

        public static Side ToSide(this DemoInfo.Team team)
        {
            switch (team)
            {
                case DemoInfo.Team.CounterTerrorist:
                    return Side.CounterTerrorist;
                case DemoInfo.Team.Terrorist:
                    return Side.Terrorist;
                case DemoInfo.Team.Spectate:
                    return Side.Spectate;
                default:
                    return Side.None;
            }
        }
    }
}
