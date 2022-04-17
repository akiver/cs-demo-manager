using System;
using System.IO;
using System.Threading.Tasks;

namespace CLI
{
    internal abstract class BaseCommand
    {
        private readonly string _name;
        private readonly string _description;
        public abstract Task Run(string[] args);
        public abstract void PrintHelp();

        protected BaseCommand(string name, string description = "")
        {
            _name = name;
            _description = description;
        }

        public string GetName()
        {
            return _name;
        }

        public string GetDescription()
        {
            return _description;
        }

        public void ParseArgs(string[] args)
        {
            foreach (string arg in args)
            {
                if (arg == "--help")
                {
                    PrintHelp();
                    Environment.Exit(0);
                }
            }
        }

        protected bool IsCurrentDirectoryWritable()
        {
            return IsDirectoryWritable(Directory.GetCurrentDirectory());
        }

        protected bool IsDirectoryWritable(string directoryPath)
        {
            try
            {
                using (FileStream fs = File.Create(Path.Combine(directoryPath, Path.GetRandomFileName()), 1, FileOptions.DeleteOnClose))
                {
                }

                return true;
            }
            catch
            {
                return false;
            }
        }
    }
}
