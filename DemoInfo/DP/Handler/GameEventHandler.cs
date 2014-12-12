using DemoInfo.Messages;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DemoInfo.DP.Handler
{
	class GameEventHandler : IMessageParser
	{
		public bool TryApplyMessage(ProtoBuf.IExtensible message, DemoParser parser)
		{
			if (message is CSVCMsg_GameEventList) {
				parser.GEH_Descriptors = new Dictionary<int, CSVCMsg_GameEventList.descriptor_t>();

				foreach (var d in ((CSVCMsg_GameEventList)message).descriptors) {
					parser.GEH_Descriptors[d.eventid] = d;
				}

				return true;
			}


			var descriptors = parser.GEH_Descriptors;
			var blindPlayers = parser.GEH_BlindPlayers;

			if (descriptors == null)
				return false;

			var rawEvent = message as CSVCMsg_GameEvent;
			if (rawEvent == null)
				return false;


			var eventDescriptor = descriptors[rawEvent.eventid];

			if (parser.Players.Count == 0 && eventDescriptor.name != "player_connect")
				return true;

			if (eventDescriptor.name == "round_start")
				parser.RaiseRoundStart();

			if (eventDescriptor.name == "round_announce_match_start")
				parser.RaiseMatchStarted();


			Dictionary<string, object> data;
			switch (eventDescriptor.name) {
			case "weapon_fire":

				data = MapData(eventDescriptor, rawEvent);

				WeaponFiredEventArgs fire = new WeaponFiredEventArgs();
				fire.Shooter = parser.Players[(int)data["userid"]];
				fire.Weapon = new Equipment((string)data["weapon"]);

				parser.RaiseWeaponFired(fire);
				break;
			case "player_death":
				data = MapData(eventDescriptor, rawEvent);

				PlayerKilledEventArgs kill = new PlayerKilledEventArgs();

				kill.DeathPerson = parser.Players[(int)data["userid"]];
				kill.Killer = parser.Players[(int)data["attacker"]];
				kill.Headshot = (bool)data["headshot"];
				kill.Weapon = new Equipment((string)data["weapon"], (string)data["weapon_itemid"]);
				kill.PenetratedObjects = (int)data["penetrated"];

					parser.RaisePlayerKilled(kill);
				break;

				#region Nades
			case "player_blind":
				data = MapData(eventDescriptor, rawEvent);
				if (parser.Players.ContainsKey((int)data["userid"] - 2))
					blindPlayers.Add(parser.Players[(int)data["userid"] - 2]);
				break;
			case "flashbang_detonate":
				var args = FillNadeEvent<FlashEventArgs>(MapData(eventDescriptor, rawEvent), parser);
				args.FlashedPlayers = blindPlayers.ToArray();
				parser.RaiseFlashExploded(args);
				blindPlayers.Clear();
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
				parser.RaiseFireStart(FillNadeEvent<FireEventArgs>(MapData(eventDescriptor, rawEvent), parser));
				break;
			case "inferno_expire":
				parser.RaiseFireEnd(FillNadeEvent<FireEventArgs>(MapData(eventDescriptor, rawEvent), parser));
				break;
				#endregion
			
			case "player_connect":
				data = MapData(eventDescriptor, rawEvent);

				PlayerInfo player = new PlayerInfo();
				player.UserID = (int)data["userid"];
				player.Name = (string)data["name"];

				//player.IsFakePlayer = (bool)data["bot"];

				int index = (int)data["index"];

				parser.RawPlayers[index] = player;


				break;
			case "player_disconnect":
				data = MapData(eventDescriptor, rawEvent);
				int toDelete = (int)data["userid"];
				bool found = false;
				for (int i = 0; i < parser.RawPlayers.Length; i++) {

					if (parser.RawPlayers[i] != null && parser.RawPlayers[i].UserID == toDelete) {
						parser.RawPlayers[i] = null;
						break;
					}
				}

				parser.Players.Remove(toDelete);

				break;
			case "bomb_beginplant": //When the bomb is starting to get planted
			case "bomb_abortplant": //When the bomb planter stops planting the bomb
			case "bomb_planted": //When the bomb has been planted
			case "bomb_defused": //When the bomb has been defused
			case "bomb_exploded": //When the bomb has exploded
				data = MapData(eventDescriptor, rawEvent);

				var bombEventArgs = new BombEventArgs();
				bombEventArgs.Player = parser.Players[(int)data["userid"]];
				var bombSiteIndex = (int)data["site"]; //entity index of the bombsite.

				break;
			case "bomb_begindefuse":
				data = MapData(eventDescriptor, rawEvent);
				var e = new BombDefuseEventArgs();
				e.Player = parser.Players[(int)data["userid"]];
				e.HasKit = (bool)data["haskit"];
				parser.RaiseBombBeginDefuse(e);
				break;
			case "bomb_abortdefuse":
				data = MapData(eventDescriptor, rawEvent);
				var e2 = new BombDefuseEventArgs();
				e2.Player = parser.Players[(int)data["userid"]];
				e2.HasKit = e2.Player.HasDefuseKit;
				parser.RaiseBombAbortDefuse(e2);
				break;
			}

			return true;
		}

		private T FillNadeEvent<T>(Dictionary<string, object> data, DemoParser parser) where T : NadeEventArgs, new()
		{
			var nade = new T();

			if (data.ContainsKey("userid") && parser.Players.ContainsKey((int)data["userid"]))
				nade.ThrownBy = parser.Players[(int)data["userid"]];
				
			Vector vec = new Vector();
			vec.X = (float)data["x"];
			vec.Y = (float)data["y"];
			vec.Z = (float)data["z"];
			nade.Position = vec;

			return nade;
		}

		private Dictionary<string, object> MapData(CSVCMsg_GameEventList.descriptor_t eventDescriptor, CSVCMsg_GameEvent rawEvent)
		{
			Dictionary<string, object> data = new Dictionary<string, object>();

			var i = 0;
			foreach (var key in eventDescriptor.keys) {
				data[key.name] = GetData(rawEvent.keys[i++]);
			}

			return data;
		}

		private object GetData(CSVCMsg_GameEvent.key_t eventData)
		{
			switch (eventData.type) {
			case 1:
				return eventData.val_string;
			case 2:
				return eventData.val_float;
			case 3:
				return eventData.val_long;
			case 4:
				return eventData.val_short;
			case 5:
				return eventData.val_byte; 
			case 6:
				return eventData.val_bool;
			default:
				break;
			}

			return null;
		}

		public int Priority { get { return 0; } }
	}
}
