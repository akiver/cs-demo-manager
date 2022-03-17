using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using System.Windows;
using System.Windows.Interop;
using Core;
using GalaSoft.MvvmLight.Messaging;
using MahApps.Metro.Controls;
using Manager.Messages;
using Manager.ViewModel;

namespace Manager
{
    public partial class MainWindow : MetroWindow
    {
        public MainWindow()
        {
            InitializeComponent();
            Closing += (s, e) => ViewModelLocator.Cleanup();

            TaskbarItemInfo = new System.Windows.Shell.TaskbarItemInfo
            {
                ProgressState = System.Windows.Shell.TaskbarItemProgressState.Normal,
            };

            Messenger.Default.Register<UpdateTaskbarProgressMessage>(this,
                msg => { TaskbarItemInfo.ProgressValue = msg.Value >= 1 ? 0 : msg.Value; });
        }

        protected override void OnSourceInitialized(EventArgs e)
        {
            base.OnSourceInitialized(e);
            HwndSource source = PresentationSource.FromVisual(this) as HwndSource;
            source?.AddHook(WndProc);
        }

        private IntPtr WndProc(IntPtr hwnd, int msg, IntPtr wParam, IntPtr lParam, ref bool handled)
        {
            if (msg == Win32Utils.WM_COPYDATA)
            {
                Win32Utils.COPYDATASTRUCT cps = (Win32Utils.COPYDATASTRUCT)Marshal.PtrToStructure(lParam, typeof(Win32Utils.COPYDATASTRUCT));
                if ((int)cps.dwData == Win32Utils.WM_SUSPECTS)
                {
                    if (cps.cbData == Marshal.SizeOf(typeof(Win32Utils.SteamIdListStruct)))
                    {
                        Win32Utils.SteamIdListStruct myStruct =
                            (Win32Utils.SteamIdListStruct)Marshal.PtrToStructure(cps.lpData, typeof(Win32Utils.SteamIdListStruct));
                        List<string> steamIdList = new List<string>();

                        for (int i = 0; i < 100; ++i)
                        {
                            if (myStruct.SteamIdList[i] != 0)
                            {
                                steamIdList.Add(myStruct.SteamIdList[i].ToString());
                            }
                        }

                        // send msg to view model
                        LoadSuspectListMessage loadSuspectListMsg = new LoadSuspectListMessage
                        {
                            SteamIdList = steamIdList,
                        };
                        Messenger.Default.Send(loadSuspectListMsg);
                        handled = true;
                    }
                }

                if ((int)cps.dwData == Win32Utils.WM_LOAD_DEMO)
                {
                    try
                    {
                        string demoPath = Marshal.PtrToStringAnsi(cps.lpData, cps.cbData);
                        LoadDemoFromAppArgument loadDemoMessage = new LoadDemoFromAppArgument(demoPath);
                        Messenger.Default.Send(loadDemoMessage);
                        handled = true;
                    }
                    catch (Exception e)
                    {
                        Logger.Instance.Log(e);
                    }
                }
            }

            if (msg == Win32Utils.WM_SUSPECTS)
            {
                NavigateToSuspectsViewMessage navigateToSuspectsMsg = new NavigateToSuspectsViewMessage();
                Messenger.Default.Send(navigateToSuspectsMsg);
                handled = true;
            }

            if (msg == Win32Utils.WM_BANNED_SUSPECT_COUNT)
            {
                UpdateSuspectBannedCountMessage bannedCountMessage = new UpdateSuspectBannedCountMessage
                {
                    Count = (int)wParam,
                };
                Messenger.Default.Send(bannedCountMessage);
                handled = true;
            }

            if (msg == Win32Utils.WM_DOWNLOAD_DEMOS)
            {
                DownloadDemosMessage downloadDemosMessage = new DownloadDemosMessage();
                Messenger.Default.Send(downloadDemosMessage);
                handled = true;
            }

            return IntPtr.Zero;
        }
    }
}
