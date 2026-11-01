#pragma once

const char* GetPluginLogPath();

void LogToFile(const char* message);

void DeleteLogFile();

void Log(const char* message, ...);

// Logs the message, shows it in an error dialog and exits the game.
void PluginError(const char* message, ...);
