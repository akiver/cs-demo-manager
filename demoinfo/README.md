#DemoInfo

This is a C#-Library that makes reading CS:GO-Demos and analyzing them easier. 

![Travis CI results](https://travis-ci.org/EHVAG/demoinfo.svg?branch=master)

##IRC and Gitter

[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/EHVAG/demoinfo?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=body_badge)

We now have a fancy IRC-Channel. Join [#demoinfogo](http://webchat.quakenet.org/?channels=demoinfogo) on Quakenet. If no one is there, you might want to try [#dota2replay](http://webchat.quakenet.org/?channels=dota2ŕeplay), the parsing of demos is pretty similar between those two games (There are some differences in how the field-headers are stored in the packet-entites, however).

##nuget-package
We now have an official nuget-package! See https://www.nuget.org/packages/DemoInfo/

### Stable releases

These are created and uploaded manually by us. The assemblies are properly signed (the *public* key is right here in the repo).

### Prereleases

Our nuget prereleases are created automatically by travis whenever the `master` branch is updated. Therefore, bugs and sudden API changes are more likely. In return, you always get the latest improvements as soon as we push them. The version strings look like this: `0.0.0-ci<unix timestamp when the package was built>-<git commit hash>`

Please note that the assemblies in these releases are **not** properly signed. They're [delay-signed](https://msdn.microsoft.com/en-us/library/t07a3dye.aspx) to ensure seamless compatibility with regular (stable) releases, but they don't carry a valid signature. This means that you *may* have to exclude `DemoInfo.dll` from strong name verification if you use these prereleases (see also: [#39](https://github.com/moritzuehling/demoinfo-public/pull/39)).

### Debug symbols

Since no Windows machines are involved in any part of the development process, we can't provide `pdb` symbols for our releases. If you need to step into DemoInfo during debugging, you have to download the source code and add it to your project. Sorry.

##Usage
Refer to [this guide](https://github.com/moritzuehling/demostatistics-generator/blob/master/README.md#usage-of-demoinfo-public). There is also an example-project where you can see the parser in action!

##Features 
###ToDo
A list of which game-events are implemented and which aren't can be found [here](https://gist.github.com/moritzuehling/bcc71f306249f0d85628). 

###Done

* Get Informations about each player at any point in time: 
 * Name
 * SteamID
 * Team
 * Clantag
 * Position
 * View-Direction
 * HP
 * Whether he is alive
 * The players team (CT / T / Spectator)
 * The players weapons
 * Kills
 * Deaths
 * Assists
 * MVPs
 * Score
 * Money
    * Current money
    * Current equipment value
* Scores
* Team-names
* The following game-events: 
 * Player was attacked (for GOTV demos newer than July 1st 2015)
 * Exploding / starting / stopping of the following nades: 
    * Grenade (position, throwing player)
    * Smoke (position, throwing player, when did it start, when did it stop)
    * Fire (position, ~~throwing player~~[1], when did it start, when did it stop)
    * Flash (position, throwing player, flashed players)
 * Weapon fired (who fired, what weapon[2], position)
 * Player died (weapon, killer, victim, weapon, position)
 * Round start
 * Match start
 * End of Freezetime
 * Bomb-Events

[1] This is not networked for some odd reason. 

[2] This is actually pretty tricky since, for example the USP and the CZ are actually networked with the same class. We use some dark magic to find out what is the correct weapon. 
  
 Any questions? Contact me per mail or just join #demoinfogo on QuakeNet. 
