#DemoInfo


This is a C#-Library that makes reading CS:GO-Demos and analyzing them easier. 

##IRC

We now have a fancy IRC-Channel. Join [#demoinfogo](http://webchat.quakenet.org/?channels=demoinfogo) on Quakenet. If no one is there, you might want to try [#dota2replay](http://webchat.quakenet.org/?channels=dota2ŕeplay), the parsing of demos is pretty similar between those two games (There are some differences in how the field-headers are stored in the packet-entites, however).

##Correctness
This is the most accurate implementation I know of. This is because I worked with Valve while creating this. If you find bugs, create an issue. Be sure to provide a demo to reproduce the issue!



##Usage
Include the DemoInfo-Project. You can then can create an instance of the ``DemoParser``-Class. 

    DemoParser parser = new DemoParser(File.OpenRead("file.dem"));
    
Then you can subscribe to events: 

    parser.TickDone += parser_TickDone;
    parser.MatchStarted += parser_MatchStarted;
	parser.PlayerKilled += HandlePlayerKilled;
	parser.WeaponFired += HandleWeaponFired;
    
For starting parsing, you can call the ``ParseDemo``-Method of the parser. You can either parse the whole demo (then you call ``parser.ParseDemo(true)``), or parse tick by tick. (then call ``parser.ParseDemo(false)``, and repeatedly ``parser.ParseNextTick ()`` to parse the next tick. The method returns true as long as there is an other tick. 

##Features 
* Get Informations about each player:
 * Name
 * SteamID
 * Position (Where he died)
 * View-Direction
 * HP
 * ID of his Entity-Object
 * Wether he is alive
 * His Team (CT / T / Spec)
 
* The following Game-Events: 
 * Exploding / Starting / Stopping of the following Nades: 
   * Grenade (Position, Throwing player)
    * Smoke (Position, Throwing player, when did it start, when did it stop)
    * Fire (Position, ~~Throwing player~~, when did it start, when did it stop)
    * Flash (Position, Throwing player, Flashed Players)
 * Weapon fired (Who fired, what weapon)
 * Player died (Weapon, Killer, Killed Person
 * Round-Restart if it's the first round
 * *I'm working on more! - Include your own, see ``DP/Handler/GameEventHandler.cs`` for how to implement those, and create a pull-request! 
 
 Any questions? Contact me on GitHub!
