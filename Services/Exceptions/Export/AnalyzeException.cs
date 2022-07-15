using System;

namespace Services.Exceptions.Export
{
    public class AnalyzeException : Exception
    {
        public AnalyzeException(Exception innerException) : base("Analyze exception", innerException)
        {
        }
    }
}
