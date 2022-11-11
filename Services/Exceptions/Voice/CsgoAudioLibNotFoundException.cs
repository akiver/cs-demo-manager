using System;

namespace Services.Exceptions.Voice
{
    public class CsgoAudioLibNotFoundException : Exception
    {
        public CsgoAudioLibNotFoundException() : base("CSGO audio library not found")
        {
        }
    }
}
