#DemoInfo

This is a C#-Library that makes reading CS:GO-Demos and analyzing them easier. 

![Travis CI results](https://travis-ci.org/moritzuehling/demoinfo-public.svg?branch=master)

##IRC

We now have a fancy IRC-Channel. Join [#demoinfogo](http://webchat.quakenet.org/?channels=demoinfogo) on Quakenet. If no one is there, you might want to try [#dota2replay](http://webchat.quakenet.org/?channels=dota2ŕeplay), the parsing of demos is pretty similar between those two games (There are some differences in how the field-headers are stored in the packet-entites, however).

##nuget-package
We now have an official nuget-package! See https://www.nuget.org/packages/DemoInfo/



##Usage
Refer to [this guide](https://github.com/moritzuehling/demostatistics-generator/blob/master/README.md#usage-of-demoinfo-public). There is also an example-project where you can see the parser in action!

##Features 
* Get Informations about each player at any point in time: 
 * Name
 * SteamID
 * Team
 * Clantag
 * Position
 * View-Direction
 * HP
 * Wether he is alive
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
 * 
[1] This is not networked for some odd reason. 

[2] This is actually pretty tricky since, for example the USP and the CZ are actually networked with the same class. We use some dark magic to find out what is the correct weapon. 
  
 Any questions? Contact me per mail or just join #demoinfogo on QuakeNet. 
