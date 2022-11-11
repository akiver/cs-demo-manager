using System;

namespace Services.Exceptions.Voice
{
    public class UnsupportedAudioCodecException: Exception
    {
        public UnsupportedAudioCodecException() : base("Unsupported audio codec")
        {
        }
    }
}
