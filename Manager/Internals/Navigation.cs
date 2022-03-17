using System.Windows.Controls;
using Core.Models;
using GalaSoft.MvvmLight.Messaging;
using Manager.Messages;
using Manager.ViewModel;
using Manager.Views.Accounts;
using Manager.Views.Demos;
using Manager.Views.Players;
using Manager.Views.Rounds;
using Manager.Views.Suspects;

namespace Manager.Internals
{
    public static class Navigation
    {
        public static void ShowDemoList()
        {
            ShowPage(new DemoListView());
        }

        public static void ShowDemoDetails(Demo demo)
        {
            new ViewModelLocator().DemoDetails.Demo = demo;

            ShowPage(new DemoDetailsView());
        }

        public static void ShowCurrentDemoDetails()
        {
            ShowPage(new DemoDetailsView());
        }

        public static void ShowRoundDetails(Demo demo, int roundNumber)
        {
            var roundViewModel = new ViewModelLocator().RoundDetails;
            roundViewModel.Demo = demo;
            roundViewModel.RoundNumber = roundNumber;

            ShowPage(new RoundDetailsView());
        }

        public static void ShowPlayerDetails(Demo demo, Player player)
        {
            var playerViewModel = new ViewModelLocator().PlayerDetails;
            playerViewModel.Demo = demo;
            playerViewModel.CurrentPlayer = player;

            ShowPage(new PlayerDetailsView());
        }

        public static void ShowDemoHeatmap(Demo demo)
        {
            new ViewModelLocator().DemoHeatmap.Demo = demo;
            
            ShowPage(new DemoHeatmapView());
        }

        public static void ShowDemoOverview(Demo demo)
        {
            new ViewModelLocator().DemoOverview.Demo = demo;

            ShowPage(new DemoOverviewView());
        }

        public static void ShowDemoKills(Demo demo)
        {
            new ViewModelLocator().DemoKills.Demo = demo;

            ShowPage(new DemoKillsView());
        }

        public static void ShowDemoDamages(Demo demo)
        {
            new ViewModelLocator().DemoDamages.Demo = demo;

            ShowPage(new DemoDamagesView());
        }

        public static void ShowDemoFlashbangs(Demo demo)
        {
            new ViewModelLocator().DemoFlashbangs.Demo = demo;

            ShowPage(new DemoFlashbangsView());
        }

        public static void ShowDemoStuffs(Demo demo)
        {
            new ViewModelLocator().DemoStuffs.Demo = demo;

            ShowPage(new DemoStuffsView());
        }

        public static void ShowDemoMovie(Demo demo)
        {
            new ViewModelLocator().DemoMovie.Demo = demo;

            ShowPage(new DemoMovieView());
        }

        public static void ShowSuspectList()
        {
            ShowPage(new SuspectListView());
        }

        public static void ShowWhitelist()
        {
            ShowPage(new WhitelistView());
        }

        public static void ShowAccountOverall()
        {
            ShowPage(new AccountOverallView());
        }

        public static void ShowAccountMaps()
        {
            ShowPage(new AccountMapsView());
        }

        public static void ShowAccountWeapons()
        {
            ShowPage(new AccountWeaponsView());
        }

        public static void ShowAccountRank()
        {
            ShowPage(new AccountRankView());
        }

        public static void ShowAccountProgress()
        {
            ShowPage(new AccountProgressView());
        }

        private static void ShowPage(UserControl page)
        {
            Messenger.Default.Send(new ShowPageMessage(page));
        }
    }
}
