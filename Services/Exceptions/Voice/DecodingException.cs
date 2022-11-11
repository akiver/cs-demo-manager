using System;

namespace Services.Exceptions.Voice
{
    public class DecodingException : Exception
    {
        public DecodingException() : base("Failed to decode audio data")
        {
        }
    }
}
