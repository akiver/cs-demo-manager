#pragma once

#include <nlohmann/json.hpp>
#include <string>

// Called on the connection thread for every message received from the server.
using WebSocketMessageHandler = void (*)(const std::string& message);

// Starts the background connection thread, passing every message received to the given handler.
void StartWebSocketConnection(WebSocketMessageHandler onMessage);

// Closes the connection and joins the thread.
void StopWebSocketConnection();

// Sends a JSON message to the server when connected.
void SendMsg(const nlohmann::json& message);

// Sends an acknowledgement to the server.
void SendStatusOk();

// True while the connection to the server is established.
bool IsWebSocketConnected();
