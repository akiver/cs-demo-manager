using System;

namespace Services.Exceptions.Launcher
{
    public class HlaeNotFound : Exception
    {
        public HlaeNotFound() : base(Properties.Resources.HlaeNotFoundException)
        {
        }
    }
}
