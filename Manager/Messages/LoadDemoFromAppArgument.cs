namespace Manager.Messages
{
    /// <summary>
    /// Message sent from the MainWindow to ViewModel to notify that the app had a .dem file as argument
    /// </summary>
    public class LoadDemoFromAppArgument
    {
        public string DemoPath { get; }

        public LoadDemoFromAppArgument(string demoPath)
        {
            DemoPath = demoPath;
        }
    }
}
