# CSGO Demo Manager

CSGO Demo Manager is an application to manage replays from the game Counter-Strike: Global Offensive.
You can download the last release from https://cs-demo-manager.com.

You can follow [@CSGODemoManager](https://twitter.com/CSGODemoManager) on Twitter to keep updated on releases.

## Preview

![preview](https://github.com/akiver/CSGO-Demos-Manager/blob/main/preview.jpg)
More screenshots and video are available at [https://cs-demo-manager.com](https://cs-demo-manager.com).

## Features

- Generate data from demos (kills, deaths, round stats, damages...)
- Watch demos (Highlights / Lowlights from any perspective, rounds, stuffs...)
- Export data to Excel / JSON
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

## Development

### Building the app

1. Install [Telerik UI for WPF](https://www.telerik.com/products/wpf/overview.aspx). If you don't have a license, install the trial version, it will display a trial message from time to time.
2. Clone the repository and open the solution in Visual Studio 2022
3. (optional) Copy / paste your Steam API key into the file `"steam_api_key.txt"`. If you don't have a Steam API key, suspects features will not work and players avatar will not be fetched.
4. Build and start the `Manager` project

### Code formatting

1. Download the [Resharper CLI](https://www.jetbrains.com/resharper/download/#section=commandline) and extract it
2. `./cleanupcode.exe --profile=format "path/to/CSGO Demos Manager.sln"`

To format the code and also apply syntax styles, use the profile `--profile=format-syntax`

### Commit message format

Please follow the [AngularJS commit conventions](https://docs.google.com/document/d/1QrDFcIiPjSLDn3EL15IJygNPiHORgU1_OOAqWjiDU5Y/edit#).

## Credits

- [DemoInfo](https://github.com/StatsHelix/demoinfo)
- [HLAE](https://github.com/advancedfx/advancedfx/wiki/Half-Life-Advanced-Effects)
- [Simple Radar](http://simpleradar.com/)
- [VirtualDub](http://www.virtualdub.org/)
- [FFmpeg](http://ffmpeg.org/)

## Donate

If you want to say thank you, please feel free to make a donation. Thank you!

[![Paypal](https://www.paypalobjects.com/en_US/i/btn/btn_donate_SM.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=4K9LM2PMM8D3E&lc=US&item_name=CSGO%20Demos%20Manager&currency_code=EUR&bn=PP%2dDonationsBF%3abtn_donate_SM%2egif%3aNonHosted)

## Translation

### Overview

The application translation is done with the resources based system [Microsoft Multilingual App Toolkit](https://docs.microsoft.com/en-us/windows/apps/design/globalizing/multilingual-app-toolkit-editor-downloads).

To translate the application in a specific language, the only files that you have to edit are `XLIFF` files (`.xlf`). Those files are located in the folder `MultilingualResources` of each project.

The following projects have their own translations files:

- `Core`
- `Bot`
- `Manager`
- `Services`

For example, if you want to translate the app in Spanish, you will have to edit the following files:

- `Core.es.xlf` (from `Core` project)
- `Services.es.xlf` (from `Services` project)
- `Manager.es.xlf` (from `Manager` project)
- `Bot.es.xlf` (from `Bot` project)

### Starting a new translation

**Please check GitHub issues to see if someone is already translating the app in your language and if it's not the case, create an issue to inform that you are working on it.**

1. Install [Git](https://git-scm.com/)
2. Install [Multilingual App Toolkit v4](https://visualstudiogallery.msdn.microsoft.com/6dab9154-a7e1-46e4-bbfa-18b5e81df520) or the `XLIFF` file editor of your choice
3. Fork the repository and [clone](https://help.github.com/articles/cloning-a-repository/) it on your computer
4. Edit the `.xlf` files of your language (don't forget to update the resources status: `Needs review` if you are not sure, `Final` otherwise)
5. (Optional) Test your changes in the app by building it
6. (Optional) Add your nickname to the [translators](https://github.com/akiver/CSGO-Demos-Manager/blob/main/Manager/App.xaml.cs#L27).
7. Commit and push your changes
8. Create a [pull request](https://help.github.com/articles/creating-a-pull-request/)

### Notes

- **If your language files are missing, please create an issue, I will add all necessary files.**

- Some resources are displayed in the xlf editor but are not translatable. You can use the editor filter to hide it.

- If you want to test your translations before commiting files, you have to setup your system to be able to build the application by yourself.
  Please follow the build instructions from the readme file.

- Sometimes it's not easy to guess exactly where a string is used, I added some comments visible from the xlf editor to help you.

- Some strings contains characters such as **"{0}"** or **"{1}"**.
  These are placeholder for variables.

_Example:_

The string resource **"DialogDemosHaveBeenDownloaded"** is in English **"{0} demo(s) have been downloaded."**.
It means that **{0}** will be replaced by the number of demos downloaded.
For example **"8 demo(s) have been downloaded."**

- XLIFF files have the ability to set a "status" to strings. By default the status is "New", when you are sure about your translation, you can change the status to "Final". If you are not sure, please set the status to "Needs Review".

- Since English is the fallback language, if an existing resource from the English files changed, all others resources languages files are updated and the changed resources are set to "Needs review". You are free to check if some resources of your language have the status "Needs review" and create a pull request with the final translation.

## License

[GPL v2](https://github.com/akiver/CSGO-Demos-Manager/blob/main/LICENSE)
