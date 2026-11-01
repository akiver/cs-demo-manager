#include "gameinfo.h"

#include <cstdio>
#include <fstream>
#include <string>

#include "log.h"
#include "plugin.h"

using std::string;

void RestoreGameinfoFile() {
    string gameInfoPath = gameDirectory + "/csgo/gameinfo.gi";
    string gameInfoBackupPath = gameDirectory + "/csgo/gameinfo.gi.backup";

    std::ifstream backupFile(gameInfoBackupPath);
    if (!backupFile.good()) {
        Log("gameinfo.gi backup file doesn't exist");
        return;
    }

    std::ofstream destination(gameInfoPath);
    destination << backupFile.rdbuf();

    backupFile.close();
    destination.close();

    int result = remove(gameInfoBackupPath.c_str());
    if (result == 0) {
        Log("Backup file deleted successfully");
    } else {
        Log("Error deleting backup file");
    }
}
