using System;
using System.Threading.Tasks;

namespace CLI
{
    internal class HelpCommand : BaseCommand
    {
        public const string COMMAND_NAME = "help";
        private readonly BaseCommand[] _commands;

        public HelpCommand(BaseCommand[] commands) : base(COMMAND_NAME)
        {
            _commands = commands;
        }

        public override Task Run(string[] args)
        {
            PrintHelp();

            return Task.FromResult(true);
        }

        public override void PrintHelp()
        {
            Console.WriteLine(@"CSGO Demo Manager CLI");
            Console.WriteLine(@"");
            Console.WriteLine($@"    Usage: {Program.ExeName} <command> [arguments]");
            Console.WriteLine(@"");
            Console.WriteLine(@"The commands are:");
            Console.WriteLine(@"");
            foreach (BaseCommand command in _commands)
            {
                Console.WriteLine($@"    {command.GetName(),-20} {command.GetDescription()}");
            }
        }
    }
}
