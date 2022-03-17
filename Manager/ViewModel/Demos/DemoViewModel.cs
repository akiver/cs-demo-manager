using System;
using Core;
using Core.Models;
using GalaSoft.MvvmLight.CommandWpf;
using Manager.Internals;
using Manager.ViewModel.Shared;

namespace Manager.ViewModel.Demos
{
    public  class DemoViewModel: BaseViewModel
    {
        #region Properties

        private Demo _demo;
        private RelayCommand _showCurrentDemoDetailsCommand;

        #endregion

        #region Accessors

        public Demo Demo
        {
            get => _demo;
            set { Set(() => Demo, ref _demo, value); }
        }

        #endregion

        #region Commands

        public RelayCommand ShowCurrentDemoDetailsCommand
        {
            get
            {
                return _showCurrentDemoDetailsCommand
                       ?? (_showCurrentDemoDetailsCommand = new RelayCommand(
                           () =>
                           {
                               if (Demo == null)
                               {
                                   Logger.Instance.Log(new Exception("Trying to show current demo details but it's null"));
                                   return;
                               }

                               Navigation.ShowCurrentDemoDetails();
                               Cleanup();
                           }));
            }
        }

        #endregion
    }
}
