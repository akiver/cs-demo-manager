using System;

namespace Services.Exceptions.Voice
{
    public class LoadCsgoAudioLibException : Exception
    {
        public LoadCsgoAudioLibException() : base("Failed to load CSGO audio library")
        {
        }
    }
}
