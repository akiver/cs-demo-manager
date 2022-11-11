using System;

namespace Services.Exceptions.Voice
{
    public class NoVoiceDataException : Exception
    {
        public NoVoiceDataException() : base("No voice data found")
        {
        }
    }
}
