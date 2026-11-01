#include <fstream>
#include <nlohmann/json.hpp>
#include <string>

#include "log.h"
#include "playback_overlay.h"
#include "string_utils.h"
#include "ui/playback_timeline.h"

using nlohmann::json;
using std::string;

static void ReadTimelineRoundTeam(const json& data, TimelineRoundTeam& team) {
    CopyUtf8Truncated(team.name, data.value("name", string()));
    team.team = data.value("side", 0);
    team.score = data.value("score", 0);
    team.economyType = ParseEconomyType(data.value("economyType", string()).c_str());
}

static void ReadTimelineSequences(const json& data, std::vector<TimelineSequence>& sequences) {
    for (auto& item : data) {
        TimelineSequence sequence = {};
        sequence.startTick = item.value("startTick", 0);
        sequence.endTick = item.value("endTick", 0);
        sequence.steamId = strtoull(item.value("steamId", string()).c_str(), NULL, 10);
        sequence.team = item.value("side", 0);
        CopyUtf8Truncated(sequence.playerName, item.value("playerName", string()));
        sequence.eventCount = item.value("eventCount", 0);
        sequences.push_back(sequence);
    }
}

void LoadPlaybackTimelineFile(const std::string& demoPath) {
    PlaybackTimeline timeline = {};
    string timelinePath = demoPath + ".timeline.json";
    std::ifstream file(timelinePath);
    if (!file.good()) {
        Log("Timeline file not found at %s", timelinePath.c_str());
        SetPlaybackDemoChecksum("");
        SetPlaybackTimeline(timeline);
        return;
    }

    string checksum;
    try {
        json data = json::parse(file);
        checksum = data.value("checksum", string());
        for (auto& round : data.value("rounds", json::array())) {
            TimelineRound timelineRound = {};
            timelineRound.startTick = round.value("startTick", 0);
            timelineRound.freezeTimeEndTick = round.value("freezeTimeEndTick", 0);
            timelineRound.endTick = round.value("endTick", 0);
            timelineRound.winnerTeam = round.value("winnerSide", 0);
            timelineRound.endReason = round.value("endReason", 0);
            ReadTimelineRoundTeam(round.value("teamA", json::object()), timelineRound.teamA);
            ReadTimelineRoundTeam(round.value("teamB", json::object()), timelineRound.teamB);
            timeline.rounds.push_back(timelineRound);
        }
        for (auto& kill : data.value("kills", json::array())) {
            TimelineKill timelineKill = {};
            timelineKill.tick = kill.value("tick", 0);
            timelineKill.killerTeam = kill.value("killerSide", 0);
            timelineKill.victimTeam = kill.value("victimSide", 0);
            timelineKill.killerSteamId = strtoull(kill.value("killerSteamId", string()).c_str(), NULL, 10);
            timelineKill.victimSteamId = strtoull(kill.value("victimSteamId", string()).c_str(), NULL, 10);
            CopyUtf8Truncated(timelineKill.killerName, kill.value("killerName", string()));
            CopyUtf8Truncated(timelineKill.victimName, kill.value("victimName", string()));
            CopyUtf8Truncated(timelineKill.weaponName, kill.value("weaponName", string()));
            timelineKill.isHeadshot = kill.value("isHeadshot", false);
            timelineKill.isWallbang = kill.value("penetratedObjects", 0) > 0;
            timeline.kills.push_back(timelineKill);
        }
        for (auto& bombPlant : data.value("bombPlants", json::array())) {
            TimelineBombPlant timelineBombPlant = {};
            timelineBombPlant.tick = bombPlant.value("tick", 0);
            string site = bombPlant.value("site", string());
            timelineBombPlant.site = site.empty() ? '?' : site[0];
            timelineBombPlant.planterSteamId = strtoull(bombPlant.value("planterSteamId", string()).c_str(), NULL, 10);
            timeline.bombPlants.push_back(timelineBombPlant);
        }
        for (auto& bombDefuse : data.value("bombDefuses", json::array())) {
            TimelineBombDefuse timelineBombDefuse = {};
            timelineBombDefuse.tick = bombDefuse.value("tick", 0);
            string site = bombDefuse.value("site", string());
            timelineBombDefuse.site = site.empty() ? '?' : site[0];
            timelineBombDefuse.defuserSteamId =
                strtoull(bombDefuse.value("defuserSteamId", string()).c_str(), NULL, 10);
            timeline.bombDefuses.push_back(timelineBombDefuse);
        }
        for (auto& bombExplosion : data.value("bombExplosions", json::array())) {
            TimelineBombExplosion timelineBombExplosion = {};
            timelineBombExplosion.tick = bombExplosion.value("tick", 0);
            string site = bombExplosion.value("site", string());
            timelineBombExplosion.site = site.empty() ? '?' : site[0];
            timeline.bombExplosions.push_back(timelineBombExplosion);
        }
        timeline.roundDurationSeconds = data.value("roundDurationSeconds", 0);
        ReadTimelineSequences(data.value("highlights", json::array()), timeline.highlights);
        ReadTimelineSequences(data.value("lowlights", json::array()), timeline.lowlights);
        Log("Timeline loaded: %zu rounds of %d seconds, %zu kills, %zu bomb plants, %zu bomb defuses, %zu bomb "
            "explosions, %zu highlights, %zu lowlights",
            timeline.rounds.size(), timeline.roundDurationSeconds, timeline.kills.size(), timeline.bombPlants.size(),
            timeline.bombDefuses.size(), timeline.bombExplosions.size(), timeline.highlights.size(),
            timeline.lowlights.size());
    } catch (const std::exception& exception) {
        Log("Timeline file %s can't be read: %s", timelinePath.c_str(), exception.what());
        timeline = {};
        checksum.clear();
    }

    SetPlaybackDemoChecksum(checksum);
    SetPlaybackTimeline(timeline);
}
