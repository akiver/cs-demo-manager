using System;

namespace Services.Exceptions
{
    public class InvalidFfmpegExecutableException : Exception
    {
        public InvalidFfmpegExecutableException() : base("Invalid FFmpeg executable")
        {
        }
    }
}
