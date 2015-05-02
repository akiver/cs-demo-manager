# CSGO Demos Manager #

CSGO Demos Manager is an application to manage replays from the game Counter-Strike: Global Offensive.
You can download the last release from http://csgo-demos-manager.com.

## Features ##
- Generate data from demos
- Watch quickly demos (Highlights / Lowlights)
- Export data to Excel
- Comment your demos
- Generate heatmaps
- Track VAC ban
- Manage demos location

## Dependencies ##

* Microsoft Visual Studio 2015 (C# 6 is required)
* [MVVM Light](https://mvvmlight.codeplex.com/)
* [Mahapps](https://github.com/MahApps/MahApps.Metro)
* [DemoInfo](https://github.com/EHVAG/demoinfo)
* [Json.net](https://github.com/JamesNK/Newtonsoft.Json)
* [CefSharp](https://github.com/cefsharp/CefSharp)
* [Heatmap.js](https://github.com/pa7/heatmap.js)
* [Steam API](http://steamcommunity.com/dev) (You need a Steam API key to be able to use the "suspects" feature)
* [NPOI](https://github.com/tonyqus/npoi)

## Build instructructions ##

* Download the repository and extract it
* Copy / paste your Steam API key into the file "steam_api_key.txt". If you don't do it you will have an error each time a call to the Steam API occurs.
* The [DemoInfo](https://github.com/EHVAG/demoinfo) pre-release isn't properly signed. You have to download [snremove](http://www.nirsoft.net/dot_net_tools/strong_name_remove.html) and copy / paste it into your "bin/{platform}/Debug" and "bin/{platform}/Release" folders.
* Open the solution within Visual Studio 2015
* Build and start