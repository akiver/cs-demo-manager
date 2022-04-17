namespace Services.Concrete
{
    public enum BoilerExitCode
    {
        Success = 0,
        FatalError = 1,
        InvalidArguments = 2,
        CommunicationFailure = 3,
        AlreadyConnectedToGC = 4,
        SteamRestartRequired = 5,
        SteamNotRunningOrLoggedIn = 6,
        SteamUserNotLoggedIn = 7, // probably in offline mode
        NoMatchesFound = 8,
        WriteFileFailure = 9,
    }
}
