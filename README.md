# CSGO Demos Manager #

CSGO Demos Manager is an application to manage replays from the game Counter-Strike: Global Offensive.
You can download the last release from https://csgo-demos-manager.com.

You can follow [@CSGODemoManager](https://twitter.com/CSGODemoManager) on Twitter to keep updated on releases.

## Preview ##

![preview](https://github.com/akiver/CSGO-Demos-Manager/blob/master/preview.jpg)
More screenshots and video are available at [https://csgo-demos-manager.com](https://csgo-demos-manager.com).

## Features ##
- Generate data from demos (kills, deaths, round stats, damages...)
- Watch demos (Highlights / Lowlights from any perspective, rounds, stuffs...)
- Export data to Excel
- Comment your demos
- Generate heatmaps (Kills, shots, smokes...)
- Track VAC ban (A BOT send Windows notifications in background)
- Manage demos location
- Watch rounds from an animated map overview
- Display damages by hitbox
- Track your stats (overall stats and graphs)
- [HLAE](https://github.com/advancedfx/advancedfx/wiki/Half-Life-Advanced-Effects) integration
- Download your last matchmaking demos
- Download demos from share codes
- Generate videos from demos

## Dependencies ##

* Microsoft Visual Studio 2017 (C# 7 is required)
* [Multilingual App Toolkit v4](https://visualstudiogallery.msdn.microsoft.com/6dab9154-a7e1-46e4-bbfa-18b5e81df520) (required to handle app translations)
* [MVVM Light](https://mvvmlight.codeplex.com/)
* [Mahapps](https://github.com/MahApps/MahApps.Metro)
* [DemoInfo](https://github.com/EHVAG/demoinfo)
* [Json.net](https://github.com/JamesNK/Newtonsoft.Json)
* [Steam API](http://steamcommunity.com/dev) (Optional, used to retrieve players data mainly for the suspects features)
* [NPOI](https://github.com/tonyqus/npoi)
* [WriteableBitmapEx](http://writeablebitmapex.codeplex.com/)
* [Telerik](http://www.telerik.com/products/wpf/overview.aspx)
* [Protobuf-net](https://github.com/mgravell/protobuf-net)
* [boiler-writter](https://github.com/akiver/boiler-writter)
* [SharpZipLib](http://icsharpcode.github.io/SharpZipLib/)

## Integrated Tools ##

* [HLAE](https://github.com/advancedfx/advancedfx/wiki/Half-Life-Advanced-Effects)
* [Simple Radar](http://simpleradar.com/)
* [VirtualDub](http://www.virtualdub.org/)
* [FFmpeg](http://ffmpeg.org/)

## Build instructructions ##

### You need Telerik binaries to be able to compile the application.

* Install [Telerik binaries](https://www.telerik.com/products/wpf/overview.aspx)
* Download the repository and extract it
* Launch the solution in Visual Studio
* Set the correct path for Telerik references if needed
* (optional) Copy / paste your Steam API key into the file "steam_api_key.txt". If you don't have a Steam API key, suspects features will not work and players avatar will not be fetched.
* The [DemoInfo](https://github.com/EHVAG/demoinfo) pre-release isn't properly signed. You have to download [snremove](http://www.nirsoft.net/dot_net_tools/strong_name_remove.html) and copy / paste it into the folder "bin/Debug" and "bin/Release" of demoinfo AND CSGO Demos Manager.
* Select the x86 platform configuration
* Build and start

## Contribute

You are free to contribute to the project. Please follow the [AngularJS commit guidelines](https://github.com/angular/angular.js/blob/master/CONTRIBUTING.md#-git-commit-guidelines).

## Donate

 If you want to say thank you, please feel free to make a donation. Thank you!

 [![Paypal](https://www.paypalobjects.com/en_US/i/btn/btn_donate_SM.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=4K9LM2PMM8D3E&lc=US&item_name=CSGO%20Demos%20Manager&currency_code=EUR&bn=PP%2dDonationsBF%3abtn_donate_SM%2egif%3aNonHosted)

## Translations

#### Overview

The application translation is done with the resources based system [Microsoft Multilingual App Toolkit](https://visualstudiogallery.msdn.microsoft.com/6dab9154-a7e1-46e4-bbfa-18b5e81df520).

To translate the application in a specific language, the only files that you have to edit are XLIFF files (.xlf). These files are located in the folder **"MultilingualResources"** of each project.

The following projects have their own translations files:
- Core
- Bot
- Manager
- Services

For example, if you want to translate the app in Spanish, you will have to edit the following files:
- Core.es.xlf (from Core project)
- Services.es.xlf (from Services project)
- Manager.es.xlf (from Manager project)
- Bot.es.xlf (from Bot project)

#### How-to translate step by step (no Git required)

[Watch the how-to video](https://www.youtube.com/watch?v=HszGeLVEZ-w&feature=youtu.be)

1. Install
2. Download the zip
3. Edit the .xlf files of your language ()
4. Send me the .xlf files at contact@csgo-demos-manager.com

#### How-to translate step by step

**Please check issues to see if someone is already translating the app in your language and if it's not the case, create an issue to inform that you are working on it.**

*I assume you have some basic knowledge of Git / GitHub.*

1. Install [Git](https://git-scm.com/)
2. Install [Multilingual App Toolkit v4](https://visualstudiogallery.msdn.microsoft.com/6dab9154-a7e1-46e4-bbfa-18b5e81df520) or the XLIFF files editor of your choice
3. Fork the repository and [clone](https://help.github.com/articles/cloning-a-repository/) it on your computer
4. Edit the .xlf files of your language (don't forget to update resources status: "Needs review" if you are not sure, "Final" otherwise)
5. (Optional) Test your translations by building the app
6. (Optional) Add your nickname to the translators array in the [app.cs](https://github.com/akiver/CSGO-Demos-Manager/blob/master/Manager/App.xaml.cs#L28) file. I will do it for you if you are not sure how to do it.
7. Commit your changes
    - `git commit . -m "feat(locales): add mycountry translation"`

    or if it's for typo fixes:

    - ``git commit . -m "fix(locales): typo mycountry"``
8. Push you changes to your repository

    ``git push origin master`` (I assume that you are on the master branch)
9. Create a [pull request](https://help.github.com/articles/creating-a-pull-request/)

#### Notes

- **If your language files are missing, please create an issue, I will add all necessary files.**

- Some resources are displayed in the xlf editor but are not translatable. You can use the editor filter to hide it.

- If you want to test your translations before commiting files, you have to setup your system to be able to build the application by yourself.
Please follow the build instructions from the readme file.

- Sometimes it's not easy to guess exactly where a string is used, I added some comments visible from the xlf editor to help you.

- Some strings contains characters such as **"{0}"** or **"{1}"**.
These are placeholder for variables.

*Example:*

The string resource **"DialogDemosHaveBeenDownloaded"** is in English **"{0} demo(s) have been downloaded."**.
It means that **{0}** will be replaced by the number of demos downloaded.
For example **"8 demo(s) have been downloaded."**

- XLIFF files have the ability to set a "status" to strings. By default the status is "New", when you are sure about your translation, you can change the status to "Final". If you are not sure, please set the status to "Needs Review".

- Since English is the fallback language, if an existing resource from the English files changed, all others resources languages files are updated and the changed resources are set to "Needs review". You are free to check if some resources of your language have the status "Needs review" and create a pull request with the final translation.

## License

[GPL v2](https://github.com/akiver/CSGO-Demos-Manager/blob/master/LICENSE)
