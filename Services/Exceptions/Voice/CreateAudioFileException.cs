using System;

namespace Services.Exceptions.Voice
{
    public class CreateAudioFileException : Exception
    {
        public CreateAudioFileException() : base("Failed to create audio file")
        {
        }
    }
}
