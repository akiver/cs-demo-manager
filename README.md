#DemoInfo

This is a C#-Library that makes reading CS:GO-Demos and analyzing them easier. 

![Travis CI results](https://travis-ci.org/moritzuehling/demoinfo-public.svg?branch=master)

##IRC

We now have a fancy IRC-Channel. Join [#demoinfogo](http://webchat.quakenet.org/?channels=demoinfogo) on Quakenet. If no one is there, you might want to try [#dota2replay](http://webchat.quakenet.org/?channels=dota2ŕeplay), the parsing of demos is pretty similar between those two games (There are some differences in how the field-headers are stored in the packet-entites, however).

##Usage
Include the DemoInfo-Project. You can then can create an instance of the ``DemoParser``-Class. 
```csharp
DemoParser parser = new DemoParser(File.OpenRead("file.dem"));
```
Then you can subscribe to events: 
```csharp
parser.TickDone += parser_TickDone;
parser.MatchStarted += parser_MatchStarted;
parser.PlayerKilled += HandlePlayerKilled;
parser.WeaponFired += HandleWeaponFired;
```
For starting parsing, you first need to parse the Header of the Demo by calling the ``ParsHeader``-Method of the ``DemoParser``. You can either parse the whole demo (then you call ``parser.ParseToEnd()``), or parse tick by tick. (then call  repeatedly ``parser.ParseNextTick ()`` to parse the next tick). The method returns ``true`` as long as there is an other tick. 

##Features 
* Get Informations about each player at any point in time: 
 * Name
 * SteamID
 * Team
 * Clantag
 * Position
 * View-Direction
 * HP
 * ID of his Entity-Object
 * Wether he is alive
 * His Team (CT / T / Spec)
 * His weapons
 * Kills
 * Deaths
 * Assists
 * MVPs
 * Score
 * Money
    * Current Money
    * Current Equipment Value
* Scores
* Team-Names
* The following Game-Events: 
 * Exploding / Starting / Stopping of the following Nades: 
    * Grenade (Position, Throwing player)
    * Smoke (Position, Throwing player, when did it start, when did it stop)
    * Fire (Position, ~~Throwing player~~, when did it start, when did it stop)
    * Flash (Position, Throwing player, Flashed Players)
 * Weapon fired (Who fired, what weapon^1, position)
 * Player died (Weapon, Killer, Killed Person, Weapon, Position)
 * Round Start
 * Match Start
 * End of Freezetime
 * Bomb-Events
 * We're working on more! - Include your own, see ``DP/Handler/GameEventHandler.cs`` for how to implement those, and create a pull-request! 

[1] This is actually pretty tricky since, for example the USP and the CZ are actually networked with the same class. We use some dark magic to find out what is the correct weapon. 
  
 Any questions? Contact me per mail or just join #demoinfogo on QuakeNet. 
