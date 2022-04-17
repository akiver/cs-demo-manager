using System;
using System.Threading.Tasks;

namespace CLI
{
    internal class Program
    {
        public static string ExeName = AppDomain.CurrentDomain.FriendlyName;
        private static readonly BaseCommand[] COMMANDS = { new JsonCommand(), new XlsxCommand(), new DownloadCommand() };

        private static async Task Main(string[] args)
        {
            string commandName = "";
            string[] commandArgs = Array.Empty<string>();
            if (args.Length > 0)
            {
                commandName = args[0];
                commandArgs = new string[args.Length - 1];
                Array.Copy(args, 1, commandArgs, 0, commandArgs.Length);
            }

            BaseCommand command = GetCommandToRun(commandName);
            if (command == null)
            {
                Console.WriteLine($@"{commandName}: unknown command");
                Console.WriteLine($@"Run '{ExeName} help' for usage.");
            }
            else
            {
                await command.Run(commandArgs);
            }
        }

        private static BaseCommand GetCommandToRun(string commandName)
        {
            if (commandName == "" || commandName == HelpCommand.COMMAND_NAME || commandName == "--help")
            {
                return new HelpCommand(COMMANDS);
            }

            foreach (BaseCommand command in COMMANDS)
            {
                if (command.GetName() == commandName)
                {
                    return command;
                }
            }

            return null;
        }
    }
}
