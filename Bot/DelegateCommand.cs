using System;
using System.Windows.Input;

namespace SuspectsBot
{
	/// <summary>
	/// The bot must be tiny, use a simple Commands handler instead of MVVM Light
	/// </summary>
	public class DelegateCommand : ICommand
	{
		public Predicate<object> CanExecuteFunc { get; set; }
		public Action<object> CommandAction { get; set; }

		public void Execute(object parameter)
		{
			CommandAction(parameter);
		}

		public bool CanExecute(object parameter)
		{
			return CanExecuteFunc?.Invoke(parameter) ?? true;
		}

		public event EventHandler CanExecuteChanged
		{
			add { CommandManager.RequerySuggested += value; }
			remove { CommandManager.RequerySuggested -= value; }
		}
	}
}
