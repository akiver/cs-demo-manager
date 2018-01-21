using Core.Models;

namespace Manager.ViewModel.Shared
{
	public class SingleDemoViewModel : BaseViewModel
	{
		private Demo _demo;

		public Demo Demo
		{
			get => _demo;
			set { Set(() => Demo, ref _demo, value); }
		}

		public override void Cleanup()
		{
			base.Cleanup();
			Demo = null;
		}
	}
}
