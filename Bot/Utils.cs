using System;
using System.IO;
using IWshRuntimeLibrary;
using File = System.IO.File;

namespace SuspectsBot
{
    public static class Utils
    {
        public static void CreateShortcut()
        {
            string shortcutLocation = GetShortcutLocation();
            WshShell shell = new WshShell();
            IWshShortcut shortcut = (IWshShortcut)shell.CreateShortcut(shortcutLocation);
            shortcut.Description = "CSGO Demos Manager Suspects BOT";
            shortcut.IconLocation = Path.GetDirectoryName(System.Reflection.Assembly.GetExecutingAssembly().Location) + Path.DirectorySeparatorChar +
                                    "app.ico";
            shortcut.TargetPath = System.Reflection.Assembly.GetExecutingAssembly().Location;
            shortcut.Save();
        }

        public static void DeleteShortcut()
        {
            string shortcutLocation = GetShortcutLocation();
            if (File.Exists(shortcutLocation))
            {
                File.Delete(shortcutLocation);
            }
        }

        private static string GetShortcutLocation()
        {
            string shortcutPath = Environment.GetFolderPath(Environment.SpecialFolder.Startup);
            string shortcutLocation = Path.Combine(shortcutPath, "CSGO Suspects BOT.lnk");
            return shortcutLocation;
        }
    }
}
