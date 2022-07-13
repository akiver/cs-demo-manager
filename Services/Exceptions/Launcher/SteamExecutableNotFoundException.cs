using System;

namespace Services.Exceptions.Launcher
{
    public class SteamExecutableNotFoundException : Exception
    {
        public SteamExecutableNotFoundException() : base("Steam.exe not found")
        {
        }
    }
}
