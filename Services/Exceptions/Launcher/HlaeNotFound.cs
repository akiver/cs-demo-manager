using System;

namespace Services.Exceptions.Launcher
{
    public class HlaeNotFound : Exception
    {
        public HlaeNotFound() : base("HLAE.exe not found")
        {
        }
    }
}
