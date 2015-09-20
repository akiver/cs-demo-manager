using System;
using GalaSoft.MvvmLight.Threading;
using CSGO_Demos_Manager.Internals;

namespace CSGO_Demos_Manager
{
	public partial class App
	{
		public App()
		{
			DispatcherHelper.Initialize();
			AppDomain.CurrentDomain.UnhandledException += HandleAppDomainUnhandleException;
		}

		private static void HandleAppDomainUnhandleException(object sender, UnhandledExceptionEventArgs args)
		{
			Exception e = (Exception)args.ExceptionObject;
			Logger.Instance.Log(e);
			System.Windows.MessageBox.Show("An unexpected error occured. Please send the 'errors.log' file accessible from settings." + Environment.NewLine
				+ "Message Error : " + Environment.NewLine + e.Message, "Error");
		}
	}
}
