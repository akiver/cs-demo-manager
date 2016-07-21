using System;
using System.Reflection;
using System.Runtime.InteropServices;
using System.Threading;
using System.Windows;
using Core;
using Hardcodet.Wpf.TaskbarNotification;
using Application = System.Windows.Application;

namespace SuspectsBot
{
	public partial class App : Application
	{
		private Mutex _instance;
		public static TaskbarIcon NotifyIcon;

		protected override void OnStartup(StartupEventArgs e)
		{
			bool createdNew;
			Assembly assembly = Assembly.GetExecutingAssembly();
			GuidAttribute attribute = (GuidAttribute)assembly.GetCustomAttributes(typeof(GuidAttribute), true)[0];
			string appGuid = attribute.Value;
			_instance = new Mutex(true, @"Global\" + appGuid, out createdNew);
			if (!createdNew)
			{
				_instance = null;
				Current.Shutdown();
				return;
			}

			base.OnStartup(e);
			try
			{
				NotifyIcon = (TaskbarIcon)FindResource("NotifyIcon");
				if (NotifyIcon != null && NotifyIcon.DataContext == null)
				{
					NotifyIcon.DataContext = new NotifyIconViewModel();
				}
			}
			catch (Exception ex)
			{
				Logger.Instance.Log(ex);
				MessageBox.Show("Unable to start the BOT.", "Error");
			}
		}

		protected override void OnExit(ExitEventArgs e)
		{
			_instance?.ReleaseMutex();
			base.OnExit(e);
		}
	}
}
