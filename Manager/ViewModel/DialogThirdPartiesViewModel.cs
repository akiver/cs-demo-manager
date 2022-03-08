using System.Collections.Generic;
using GalaSoft.MvvmLight;
using GalaSoft.MvvmLight.CommandWpf;
using GalaSoft.MvvmLight.Messaging;
using Manager.Messages;
using Manager.Models;
using Manager.Services;
using Services.Concrete.ThirdParties;

namespace Manager.ViewModel
{
    public class DialogThirdPartiesViewModel : ViewModelBase
    {
        private readonly IDialogService _dialogService;

        private List<ComboboxSelector> _thirdPartiesSelector;

        private ComboboxSelector _selectedThirdParty;

        private RelayCommand _closeCommand;

        private RelayCommand _selectCommand;

        public string WarningMessage => string.Format(Properties.Resources.DialogSendShareCodeWarning, SelectedThirdParty.Title);

        public List<ComboboxSelector> ThirdPartiesSelector
        {
            get { return _thirdPartiesSelector; }
            set { Set(() => ThirdPartiesSelector, ref _thirdPartiesSelector, value); }
        }

        public ComboboxSelector SelectedThirdParty
        {
            get { return _selectedThirdParty; }
            set { Set(() => SelectedThirdParty, ref _selectedThirdParty, value); }
        }

        public RelayCommand CloseCommand
        {
            get
            {
                return _closeCommand
                       ?? (_closeCommand = new RelayCommand(
                           async () => { await _dialogService.HideCurrentDialog(); }));
            }
        }

        public RelayCommand SelectCommand
        {
            get
            {
                return _selectCommand
                       ?? (_selectCommand = new RelayCommand(
                           () =>
                           {
                               ThirdPartySelected msg = new ThirdPartySelected
                               {
                                   Name = SelectedThirdParty.Id,
                               };
                               Messenger.Default.Send(msg);
                               CloseCommand.Execute(null);
                           }, () => SelectedThirdParty != null));
            }
        }

        public DialogThirdPartiesViewModel(IDialogService dialogService)
        {
            _dialogService = dialogService;

            ThirdPartiesSelector = new List<ComboboxSelector>();
            foreach (ThirdParty thirdParty in ThirdPartiesServiceFactory.ThirdParties)
            {
                ThirdPartiesSelector.Add(new ComboboxSelector(thirdParty.Name, thirdParty.Url));
            }

            if (ThirdPartiesSelector.Count > 0)
            {
                SelectedThirdParty = ThirdPartiesSelector[0];
            }
        }
    }
}
