#include "websocket.h"

#include <atomic>
#include <chrono>
#include <cstdlib>
#include <easywsclient.hpp>
#include <mutex>
#include <string>
#include <thread>
#include <vector>

#include "log.h"

using easywsclient::WebSocket;
using nlohmann::json;
using std::string;

// Owned by the connection thread but also used from the game thread. Every access to ws and every call on it must hold
// wsMutex: easywsclient shares its rx/tx buffers between poll and send without locking, and the connection thread
// deletes the client whenever the socket closes.
static std::mutex wsMutex;
static WebSocket::pointer ws = NULL;
static std::thread* wsConnectionThread = NULL;
static std::atomic<bool> stopRequested{false};
static WebSocketMessageHandler messageHandler = NULL;

// Must be kept in sync with DEFAULT_WEB_SOCKET_SERVER_PORT in src/server/port.ts.
constexpr int DEFAULT_WEB_SOCKET_SERVER_PORT = 4574;

static int GetWebSocketServerPort() {
    const char* portValue = getenv("CSDM_WS_PORT");
    if (portValue != NULL) {
        int port = atoi(portValue);
        if (port > 0) {
            return port;
        }
    }

    return DEFAULT_WEB_SOCKET_SERVER_PORT;
}

// Runs one connection until it closes or a stop is requested. Returns false when the connection couldn't be opened.
static bool ConnectToWebsocketServer() {
    int port = GetWebSocketServerPort();
    string url = "ws://localhost:" + std::to_string(port) + "?process=game";
    Log("Connecting to WebSocket server on port %d...", port);
    // Connecting blocks, so it happens outside the lock and the client is published once connected.
    WebSocket::pointer client = WebSocket::from_url(url);
    if (client == NULL) {
        Log("Failed to connect to WebSocket server.");
        return false;
    }

    {
        std::lock_guard<std::mutex> lock(wsMutex);
        ws = client;
    }
    Log("Connected to WebSocket server.");

    std::vector<string> messages;
    while (!stopRequested) {
        {
            std::lock_guard<std::mutex> lock(wsMutex);
            if (ws->getReadyState() == WebSocket::CLOSED) {
                break;
            }
            ws->poll();
            ws->dispatch([&messages](const string& message) { messages.push_back(message); });
        }

        // Messages are handled outside the lock: the handler replies through SendMsg, which takes it.
        for (const string& message : messages) {
            messageHandler(message);
        }
        messages.clear();

        // poll() above is non-blocking, so the wait happens here, outside the lock: blocking inside it would stall the
        // game thread in SendMsg for the whole timeout.
        std::this_thread::sleep_for(std::chrono::milliseconds(5));
    }

    Log("Disconnected from WebSocket server.");
    {
        std::lock_guard<std::mutex> lock(wsMutex);
        delete ws;
        ws = NULL;
    }

    return true;
}

static void ConnectToWebsocketServerLoop() {
    while (!stopRequested) {
        bool connected = ConnectToWebsocketServer();
        if (!connected && !stopRequested) {
            Log("Retrying in 2s...");
            std::this_thread::sleep_for(std::chrono::milliseconds(2000));
        }
    }
}

bool IsWebSocketConnected() {
    std::lock_guard<std::mutex> lock(wsMutex);
    return ws != NULL;
}

void SendMsg(const json& message) {
    std::lock_guard<std::mutex> lock(wsMutex);
    if (ws != NULL) {
        ws->send(message.dump());
    } else {
        Log("Cannot send message, WebSocket not connected");
    }
}

void SendStatusOk() {
    json msg;
    msg["name"] = "status";
    msg["payload"] = "ok";
    SendMsg(msg);
}

void StartWebSocketConnection(WebSocketMessageHandler onMessage) {
    messageHandler = onMessage;
    wsConnectionThread = new std::thread(ConnectToWebsocketServerLoop);
}

void StopWebSocketConnection() {
    stopRequested = true;

    {
        std::lock_guard<std::mutex> lock(wsMutex);
        if (ws != NULL) {
            ws->close();
        }
    }

    if (wsConnectionThread != NULL) {
        wsConnectionThread->join();
        delete wsConnectionThread;
        wsConnectionThread = NULL;
    }
}
