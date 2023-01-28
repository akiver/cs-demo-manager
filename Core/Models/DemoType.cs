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
    }
}
