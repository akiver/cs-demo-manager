using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;

namespace DemoInfo.DP.Handler
{
    /// <summary>
    /// This class manages all GameEvents for a demo-parser. 
    /// </summary>
    public static class GameEventHandler
    {
        // Track players fall damages per tick to properly detect damages caused by the "World".
        private static readonly Dictionary<int, int> _userIdFallDamagePerTick = new Dictionary<int, int>();

        public static void HandleGameEventList(IEnumerable<GameEventList.Descriptor> gel, DemoParser parser)
        {
            parser.GEH_Descriptors = new Dictionary<int, GameEventList.Descriptor>();
            foreach (var d in gel)
            {
                parser.GEH_Descriptors[d.EventId] = d;
            }
        }

        /// <summary>
        /// Apply the specified rawEvent to the parser.
        /// </summary>
        /// <param name="rawEvent">The raw event.</param>
        /// <param name="parser">The parser to mutate.</param>
        public static void Apply(GameEvent rawEvent, DemoParser parser)
        {
            var descriptors = parser.GEH_Descriptors;
            //previous blind implementation
            var blindPlayers = parser.GEH_BlindPlayers;

            if (descriptors == null)
            {
                return;
            }

            Dictionary<string, object> data;
            var eventDescriptor = descriptors[rawEvent.EventId];

            if (parser.Players.Count == 0 && eventDescriptor.Name != "player_connect")
            {
                return;
            }

            if (eventDescriptor.Name == "round_start")
            {
                data = MapData(eventDescriptor, rawEvent);

                RoundStartedEventArgs rs = new RoundStartedEventArgs()
                {
                    TimeLimit = (int)data["timelimit"],
                    FragLimit = (int)data["fraglimit"],
                    Objective = (string)data["objective"],
                };

                parser.RaiseRoundStart(rs);
            }

            if (eventDescriptor.Name == "cs_win_panel_match")
            {
                parser.RaiseWinPanelMatch();
            }

            if (eventDescriptor.Name == "round_announce_final")
            {
                parser.RaiseRoundFinal();
            }

            if (eventDescriptor.Name == "round_announce_last_round_half")
            {
                parser.RaiseLastRoundHalf();
            }

            if (eventDescriptor.Name == "round_end")
            {
                data = MapData(eventDescriptor, rawEvent);

                Team t = Team.Spectate;

                int winner = (int)data["winner"];

                if (winner == parser.tID)
                {
                    t = Team.Terrorist;
                }
                else if (winner == parser.ctID)
                {
                    t = Team.CounterTerrorist;
                }

                RoundEndedEventArgs roundEnd = new RoundEndedEventArgs()
                {
                    Reason = (RoundEndReason)data["reason"],
                    Winner = t,
                    Message = (string)data["message"],
                };

                parser.RaiseRoundEnd(roundEnd);
            }

            if (eventDescriptor.Name == "round_officially_ended")
            {
                parser.RaiseRoundOfficiallyEnd();
            }

            if (eventDescriptor.Name == "round_mvp")
            {
                data = MapData(eventDescriptor, rawEvent);

                RoundMVPEventArgs roundMVPArgs = new RoundMVPEventArgs();
                roundMVPArgs.Player = parser.Players.ContainsKey((int)data["userid"]) ? parser.Players[(int)data["userid"]] : null;
                roundMVPArgs.Reason = (RoundMVPReason)data["reason"];

                parser.RaiseRoundMVP(roundMVPArgs);
            }

            if (eventDescriptor.Name == "bot_takeover")
            {
                data = MapData(eventDescriptor, rawEvent);

                BotTakeOverEventArgs botTakeOverArgs = new BotTakeOverEventArgs();
                botTakeOverArgs.Taker = parser.Players.ContainsKey((int)data["userid"]) ? parser.Players[(int)data["userid"]] : null;

                parser.RaiseBotTakeOver(botTakeOverArgs);
            }

            if (eventDescriptor.Name == "begin_new_match")
            {
                parser.RaiseMatchStarted();
            }

            if (eventDescriptor.Name == "round_announce_match_start")
            {
                parser.RaiseRoundAnnounceMatchStarted();
            }

            if (eventDescriptor.Name == "round_freeze_end")
            {
                parser.RaiseFreezetimeEnded();
            }

            switch (eventDescriptor.Name)
            {
                case "weapon_fire":

                    data = MapData(eventDescriptor, rawEvent);

                    var fire = new WeaponFiredEventArgs
                    {
                        Shooter = parser.Players.ContainsKey((int)data["userid"]) ? parser.Players[(int)data["userid"]] : null,
                        Weapon = new Equipment((string)data["weapon"]),
                    };

                    parser.RaiseWeaponFired(fire);
                    break;
                case "player_falldamage":
                    data = MapData(eventDescriptor, rawEvent);
                    var fallDamageUserId = (int)data["userid"];
                    if (_userIdFallDamagePerTick.ContainsKey(fallDamageUserId))
                    {
                        _userIdFallDamagePerTick[fallDamageUserId] = parser.IngameTick;
                    }
                    else
                    {
                        _userIdFallDamagePerTick.Add(fallDamageUserId, parser.IngameTick);
                    }
                    break;
                case "player_death":
                    data = MapData(eventDescriptor, rawEvent);

                    PlayerKilledEventArgs kill = new PlayerKilledEventArgs();

                    var victimUserId = (int)data["userid"];
                    kill.Victim = parser.Players.ContainsKey(victimUserId) ? parser.Players[victimUserId] : null;
                    kill.Killer = parser.Players.ContainsKey((int)data["attacker"]) ? parser.Players[(int)data["attacker"]] : null;
                    kill.Assister = parser.Players.ContainsKey((int)data["assister"]) ? parser.Players[(int)data["assister"]] : null;
                    kill.Headshot = (bool)data["headshot"];
                    kill.Weapon = new Equipment((string)data["weapon"], (string)data["weapon_itemid"]);
                    kill.Weapon = GetAttackerWeapon(parser, kill.Weapon, victimUserId);

                    if (data.ContainsKey("assistedflash"))
                    {
                        kill.AssistedFlash = (bool)data["assistedflash"];
                    }

                    kill.PenetratedObjects = (int)data["penetrated"];

                    parser.RaisePlayerKilled(kill);
                    break;
                case "player_hurt":
                    data = MapData(eventDescriptor, rawEvent);

                    PlayerHurtEventArgs hurt = new PlayerHurtEventArgs();
                    var userId = (int)data["userid"];
                    hurt.Player = parser.Players.ContainsKey(userId) ? parser.Players[userId] : null;
                    hurt.Attacker = parser.Players.ContainsKey((int)data["attacker"]) ? parser.Players[(int)data["attacker"]] : null;
                    hurt.Health = (int)data["health"];
                    hurt.Armor = (int)data["armor"];
                    hurt.HealthDamage = (int)data["dmg_health"];
                    hurt.ArmorDamage = (int)data["dmg_armor"];
                    hurt.Hitgroup = (Hitgroup)(int)data["hitgroup"];
                    hurt.Weapon = GetAttackerWeapon(parser, new Equipment((string)data["weapon"]), userId);

                    parser.RaisePlayerHurt(hurt);
                    break;

                #region Nades

                case "player_blind":
                    data = MapData(eventDescriptor, rawEvent);

                    if (parser.Players.ContainsKey((int)data["userid"]))
                    {
                        var blindPlayer = parser.Players.ContainsKey((int)data["userid"]) ? parser.Players[(int)data["userid"]] : null;

                        if (blindPlayer != null && blindPlayer.Team != Team.Spectate)
                        {
                            BlindEventArgs blind = new BlindEventArgs();
                            blind.Player = blindPlayer;
                            if (data.ContainsKey("attacker") && parser.Players.ContainsKey((int)data["attacker"]))
                            {
                                blind.Attacker = parser.Players[(int)data["attacker"]];
                            }
                            else
                            {
                                blind.Attacker = null;
                            }

                            if (data.ContainsKey("blind_duration"))
                            {
                                blind.FlashDuration = (float?)data["blind_duration"];
                            }
                            else
                            {
                                blind.FlashDuration = null;
                            }

                            parser.RaiseBlind(blind);
                        }

                        //previous blind implementation
                        blindPlayers.Add(parser.Players[(int)data["userid"]]);
                    }

                    break;
                case "flashbang_detonate":
                    var args = FillNadeEvent<FlashEventArgs>(MapData(eventDescriptor, rawEvent), parser);
                    args.FlashedPlayers = blindPlayers.ToArray(); //prev blind implementation
                    parser.RaiseFlashExploded(args);
                    blindPlayers.Clear(); //prev blind implementation
                    break;
                case "hegrenade_detonate":
                    parser.RaiseGrenadeExploded(FillNadeEvent<GrenadeEventArgs>(MapData(eventDescriptor, rawEvent), parser));
                    break;
                case "decoy_started":
                    parser.RaiseDecoyStart(FillNadeEvent<DecoyEventArgs>(MapData(eventDescriptor, rawEvent), parser));
                    break;
                case "decoy_detonate":
                    parser.RaiseDecoyEnd(FillNadeEvent<DecoyEventArgs>(MapData(eventDescriptor, rawEvent), parser));
                    break;
                case "smokegrenade_detonate":
                    parser.RaiseSmokeStart(FillNadeEvent<SmokeEventArgs>(MapData(eventDescriptor, rawEvent), parser));
                    break;
                case "smokegrenade_expired":
                    parser.RaiseSmokeEnd(FillNadeEvent<SmokeEventArgs>(MapData(eventDescriptor, rawEvent), parser));
                    break;
                case "inferno_startburn":
                    var fireData = MapData(eventDescriptor, rawEvent);
                    var fireArgs = FillNadeEvent<FireEventArgs>(fireData, parser);
                    var fireStarted = new Tuple<int, FireEventArgs>((int)fireData["entityid"], fireArgs);
                    parser.GEH_StartBurns.Enqueue(fireStarted);
                    parser.RaiseFireStart(fireArgs);
                    break;
                case "inferno_expire":
                    var fireEndData = MapData(eventDescriptor, rawEvent);
                    var fireEndArgs = FillNadeEvent<FireEventArgs>(fireEndData, parser);
                    int entityID = (int)fireEndData["entityid"];
                    if (parser.InfernoOwners.ContainsKey(entityID))
                    {
                        fireEndArgs.ThrownBy = parser.InfernoOwners[entityID];
                    }

                    parser.RaiseFireEnd(fireEndArgs);
                    break;

                #endregion

                case "player_connect":
                    data = MapData(eventDescriptor, rawEvent);

                    PlayerInfo player = new PlayerInfo();
                    player.UserID = (int)data["userid"];
                    player.Name = (string)data["name"];
                    player.GUID = (string)data["networkid"];
                    player.XUID = player.GUID == "BOT" ? 0 : GetCommunityID(player.GUID);


                    //player.IsFakePlayer = (bool)data["bot"];

                    int index = (int)data["index"];

                    parser.RawPlayers[index] = player;


                    break;
                case "player_disconnect":
                    data = MapData(eventDescriptor, rawEvent);

                    PlayerDisconnectEventArgs disconnect = new PlayerDisconnectEventArgs
                    {
                        Reason = (string)data["reason"],
                    };
                    disconnect.Player = parser.Players.ContainsKey((int)data["userid"]) ? parser.Players[(int)data["userid"]] : null;
                    parser.RaisePlayerDisconnect(disconnect);

                    int toDelete = (int)data["userid"];
                    for (int i = 0; i < parser.RawPlayers.Length; i++)
                    {
                        if (parser.RawPlayers[i] != null && parser.RawPlayers[i].UserID == toDelete)
                        {
                            parser.RawPlayers[i] = null;
                            break;
                        }
                    }

                    if (parser.Players.ContainsKey(toDelete))
                    {
                        parser.Players.Remove(toDelete);
                    }

                    break;

                case "player_team":
                    data = MapData(eventDescriptor, rawEvent);
                    var swapped = parser.Players.ContainsKey((int)data["userid"]) ? parser.Players[(int)data["userid"]] : null;
                    var newTeam = (Team)data["team"];
                    if (swapped != null)
                    {
                        if (swapped.Team != newTeam)
                        {
                            swapped.Team = newTeam;
                        }
                    }
                    else
                    {
                        // ¯\_(ツ)_/¯
                        Trace.WriteLine("player_team event occurred but the swapped player is null");
                    }

                    var playerTeamEvent = new PlayerTeamEventArgs
                    {
                        NewTeam = newTeam,
                        OldTeam = (Team)data["oldteam"],
                        Swapped = swapped,
                        IsBot = (bool)data["isbot"],
                        Silent = (bool)data["silent"],
                    };

                    parser.RaisePlayerTeam(playerTeamEvent);
                    break;
                case "bomb_beginplant": //When the bomb is starting to get planted
                case "bomb_abortplant": //When the bomb planter stops planting the bomb
                case "bomb_planted": //When the bomb has been planted
                case "bomb_defused": //When the bomb has been defused
                case "bomb_exploded": //When the bomb has exploded
                    data = MapData(eventDescriptor, rawEvent);

                    var bombEventArgs = new BombEventArgs();
                    bombEventArgs.Player = parser.Players.ContainsKey((int)data["userid"]) ? parser.Players[(int)data["userid"]] : null;

                    int site = (int)data["site"];

                    if (site == parser.bombsiteAIndex)
                    {
                        bombEventArgs.Site = 'A';
                    }
                    else if (site == parser.bombsiteBIndex)
                    {
                        bombEventArgs.Site = 'B';
                    }
                    else
                    {
                        var relevantTrigger = parser.triggers.Single(a => a.Index == site);
                        if (relevantTrigger.Contains(parser.bombsiteACenter))
                        {
                            //planted at A.
                            bombEventArgs.Site = 'A';
                            parser.bombsiteAIndex = site;
                        }
                        else
                        {
                            //planted at B.
                            bombEventArgs.Site = 'B';
                            parser.bombsiteBIndex = site;
                        }
                    }


                    switch (eventDescriptor.Name)
                    {
                        case "bomb_beginplant":
                            parser.CurrentPlanter = bombEventArgs.Player;
                            if (parser.CurrentPlanter != null)
                            {
                                parser.CurrentPlanter.IsPlanting = true;
                            }
                            parser.RaiseBombBeginPlant(bombEventArgs);
                            break;
                        case "bomb_planted":
                            if (parser.CurrentPlanter != null)
                            {
                                parser.CurrentPlanter.IsPlanting = false;
                            }
                            parser.CurrentPlanter = null;
                            parser.RaiseBombPlanted(bombEventArgs);
                            break;
                        case "bomb_defused":
                            parser.CurrentDefuser = null;
                            parser.RaiseBombDefused(bombEventArgs);
                            break;
                        case "bomb_exploded":
                            parser.CurrentDefuser = null;
                            parser.RaiseBombExploded(bombEventArgs);
                            break;
                    }

                    break;
                case "bomb_begindefuse":
                    data = MapData(eventDescriptor, rawEvent);
                    var e = new BombDefuseEventArgs();
                    e.Player = parser.Players.ContainsKey((int)data["userid"]) ? parser.Players[(int)data["userid"]] : null;
                    e.HasKit = (bool)data["haskit"];
                    parser.CurrentDefuser = e.Player;
                    parser.RaiseBombBeginDefuse(e);
                    break;
            }
        }

        private static T FillNadeEvent<T>(Dictionary<string, object> data, DemoParser parser) where T : NadeEventArgs, new()
        {
            var nade = new T();

            if (data.ContainsKey("userid") && parser.Players.ContainsKey((int)data["userid"]))
            {
                nade.ThrownBy = parser.Players[(int)data["userid"]];
            }

            Vector vec = new Vector();
            vec.X = (float)data["x"];
            vec.Y = (float)data["y"];
            vec.Z = (float)data["z"];
            nade.Position = vec;

            return nade;
        }

        private static Dictionary<string, object> MapData(GameEventList.Descriptor eventDescriptor, GameEvent rawEvent)
        {
            Dictionary<string, object> data = new Dictionary<string, object>();

            for (int i = 0; i < eventDescriptor.Keys.Length; i++)
            {
                data.Add(eventDescriptor.Keys[i].Name, rawEvent.Keys[i]);
            }

            return data;
        }

        private static long GetCommunityID(string steamID)
        {
            long authServer = Convert.ToInt64(steamID.Substring(8, 1));
            long authID = Convert.ToInt64(steamID.Substring(10));
            return 76561197960265728 + authID * 2 + authServer;
        }


        /// <summary>
        /// Try to return the more accurate weapon for player_hurt/player_death events that have an unknown weapon.
        /// It can happens with players death caused by fall damages or bomb damages.
        /// </summary>
        private static Equipment GetAttackerWeapon(DemoParser parser, Equipment equipment, int userId)
        {
            if (equipment.Weapon != EquipmentElement.Unknown)
            {
                return equipment;
            }

            // The player took damages from falling at the current tick, set the weapon to "World".
            if (_userIdFallDamagePerTick.ContainsKey(userId) && _userIdFallDamagePerTick[userId] == parser.IngameTick)
            {
                return new Equipment("weapon_world");
            }

            return new Equipment("weapon_c4");
        }
    }
}
