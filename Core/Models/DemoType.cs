using System;

namespace Core.Models
{
    public enum DemoType
    {
        GOTV = 0,
        POV = 1,
    }

    public static class DemoTypeExtensions
    {
        public static string AsString(this DemoType demoType)
        {
            switch (demoType)
            {
                case DemoType.GOTV:
                    return "GOTV";
                case DemoType.POV:
                    return "POV";
                default:
                    throw new Exception("Invalid demo type " + demoType);
            }
        }

        public static DemoType FromString(string demoType)
        {
            switch (demoType)
            {
                case "GOTV":
                    return DemoType.GOTV;
                case "POV":
                    return DemoType.POV;
                default:
                    throw new Exception("Invalid demo type " + demoType);
            }
        }
    }
}
