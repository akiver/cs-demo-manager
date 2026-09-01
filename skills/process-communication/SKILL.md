---
name: process-communication
description: Use when you need to communicate between two processes — renderer, server, main, or Counter-Strike — whether adding a new message, handler, push event, or IPC channel.
user-invocable: false
---

## Overview

The app runs three OS processes. All heavy logic lives in the **WebSocket server** process — a **detached daemon** shared by the GUI and the CLI (attach-or-spawn via the `daemon.json` discovery file in the app folder; it idle-exits when no clients are connected and no background work is running). The **renderer** (React UI), the **Electron main** process and the **CLI** connect to it as WebSocket clients. The Counter-Strike plugin connects as another client when the game is running.

```
Electron main process  ←IPC→  Renderer process (UI)    Counter-Strike    CLI
         ↕                            ↕                       ↕           ↕
         └──────────→  WebSocket server process (daemon)  ←───┴───────────┘
```

### Process responsibilities

| Process         | Entry                        | Purpose                                                                                                               |
| --------------- | ---------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `electron-main` | `src/electron-main/main.ts`  | Window management, tray, auto-updater, IPC registration                                                               |
| `server`        | `src/server/start-server.ts` | WebSocket hub daemon; dispatches messages to typed handlers; runs background tasks (analyses, downloads, video queue) |
| `renderer`      | `src/ui/renderer.tsx`        | React UI; communicates exclusively via WebSocket client (`src/ui/web-socket-client.ts`)                               |
| `preload`       | `src/preload/preload.ts`     | Bridges Node.js APIs to renderer via `contextBridge` (file I/O, settings, IPC for OS-level dialogs)                   |
| `cli`           | `src/cli/cli.ts`             | Standalone CLI; attaches to the running daemon or spawns one (`src/node/daemon/attach-or-spawn-daemon.ts`)            |

Every WebSocket message is a JSON object `{ name, payload?, uuid? }`. The server dispatches incoming messages to typed handler functions and replies with `SharedServerMessageName.Reply` or `SharedServerMessageName.ReplyError`. All message-name enums and shared message types live in `src/server/messages/`.

---

## 1. Renderer → Server (request/response)

This is the most common pattern: the UI asks the server to do something and waits for a result.

### Files to touch

| File                                                               | What to add                                                          |
| ------------------------------------------------------------------ | -------------------------------------------------------------------- |
| `src/server/messages/renderer-client-message-name.ts`              | New enum entry for the outgoing message name                         |
| `src/server/messages/server-push-message-name.ts`                  | Payload/response types if the server also pushes back asynchronously |
| `src/server/handlers/renderer-process/<feature>/<name>-handler.ts` | Handler function                                                     |
| `src/server/handlers/renderer-handlers-mapping.ts`                 | Register the handler                                                 |

### Steps

**1. Add the message name**

```ts
// src/server/messages/renderer-client-message-name.ts
export const RendererClientMessageName = {
  // …existing entries…
  MyNewAction: 'my-new-action',
} as const;
```

**2. Write the handler**

```ts
// src/server/handlers/renderer-process/<feature>/my-new-action-handler.ts
import { handleError } from '../../handle-error';

export type MyNewActionPayload = { id: number };

export async function myNewActionHandler(payload: MyNewActionPayload) {
  try {
    const result = await doSomething(payload.id);
    return result; // returned value is sent back as the Reply payload
  } catch (error) {
    handleError(error, 'Error in myNewActionHandler');
  }
}
```

`handleError()` always throws (`never` return type) — don't add a `return` after it, and don't add a `logger.error` before it (it already logs unknown errors). Errors should be `ErrorCode` numeric values (from `src/common/error-code.ts`) or plain strings — the server wraps them in a `ReplyError` message automatically.

For **long-running handlers that communicate entirely via push events** (no return value), skip `handleError()` and handle errors manually so you can send an error push event:

```ts
export async function longTaskHandler(payload: LongTaskPayload) {
  try {
    for (const [i, item] of payload.items.entries()) {
      server.sendPushMessage({
        name: ServerPushMessageName.LongTaskProgress,
        payload: { count: i + 1, totalCount: payload.items.length },
      });
      await processItem(item);
    }
    server.sendPushMessage({ name: ServerPushMessageName.LongTaskSuccess });
  } catch (error) {
    logger.error('Error during long task');
    logger.error(error);
    server.sendPushMessage({ name: ServerPushMessageName.LongTaskError });
  }
}
```

**3. Register the handler**

```ts
// src/server/handlers/renderer-handlers-mapping.ts
import { myNewActionHandler } from './renderer-process/<feature>/my-new-action-handler';

export const rendererHandlers: RendererMessageHandlers = {
  // …existing entries…
  [RendererClientMessageName.MyNewAction]: myNewActionHandler,
};
```

**4. Call it from the UI**

```ts
// anywhere inside src/ui/
import { useWebSocketClient } from 'csdm/ui/web-socket/use-web-socket-client';
import { RendererClientMessageName } from 'csdm/server/messages/renderer-client-message-name';

const client = useWebSocketClient();
const result = await client.send({
  name: RendererClientMessageName.MyNewAction,
  payload: { id: 42 },
});
```

---

## 2. Server → Renderer/CLI (server push / event)

Use this when the server needs to push an update without a prior request (e.g. progress events, background task completion). Push messages fan out to the renderer **and** all connected CLI clients — this is how CLI-initiated work shows up live in the UI and vice versa.

### Files to touch

| File                                              | What to add                                |
| ------------------------------------------------- | ------------------------------------------ |
| `src/server/messages/server-push-message-name.ts` | New enum entry + payload type              |
| handler or background task                        | Call `server.sendPushMessage(…)`           |
| UI component / hook                               | Subscribe with `client.on(name, listener)` |

### Steps

**1. Declare the push message**

```ts
// src/server/messages/server-push-message-name.ts
export const ServerPushMessageName = {
  // …existing entries…
  MyProgressUpdate: 'my-progress-update',
} as const;

export interface ServerPushMessagePayload extends SharedServerMessagePayload {
  // …existing entries…
  [ServerPushMessageName.MyProgressUpdate]: { percent: number };
}
```

**2. Push from the server**

```ts
import { server } from 'csdm/server/server';
import { ServerPushMessageName } from 'csdm/server/messages/server-push-message-name';

server.sendPushMessage({
  name: ServerPushMessageName.MyProgressUpdate,
  payload: { percent: 50 },
});
```

**3. Listen in the UI**

```ts
import { useWebSocketClient } from 'csdm/ui/web-socket/use-web-socket-client';
import { ServerPushMessageName } from 'csdm/server/messages/server-push-message-name';
import { useEffect } from 'react';

function MyComponent() {
  const client = useWebSocketClient();

  useEffect(() => {
    const onProgress = ({ percent }: { percent: number }) => {
      console.log(percent);
    };
    client.on(ServerPushMessageName.MyProgressUpdate, onProgress);
    return () => {
      client.off(ServerPushMessageName.MyProgressUpdate, onProgress);
    };
  }, [client]);
}
```

The CLI subscribes the same way through its own client (`src/cli/web-socket/cli-web-socket-client.ts`).

---

## 3. Main process → WS server (request/response)

The Electron main process uses the same WebSocket pattern but through a different client and handler mapping.

### Files to touch

| File                                                 | What to add                      |
| ---------------------------------------------------- | -------------------------------- |
| `src/server/messages/main-client-message-name.ts`    | New enum entry                   |
| `src/server/messages/main-server-message-name.ts`    | Payload/response types if needed |
| `src/server/handlers/main-process/<name>-handler.ts` | Handler function                 |
| `src/server/handlers/main-handlers-mapping.ts`       | Register the handler             |

### Steps

The pattern mirrors section 1. The main process sends messages via its WebSocket client created in `src/electron-main/web-socket/create-web-socket-client.ts`:

```ts
// src/electron-main/some-file.ts
import { MainClientMessageName } from 'csdm/server/messages/main-client-message-name';

// fire-and-forget
await client.send({ name: MainClientMessageName.MyAction });

// or wait for a typed reply
const result: boolean = await client.send({ name: MainClientMessageName.MyActionWithReply });
```

---

## 4. WS server → Main process (server push)

### Files to touch

| File                                              | What to add                               |
| ------------------------------------------------- | ----------------------------------------- |
| `src/server/messages/main-server-message-name.ts` | New enum entry + payload type             |
| handler or background task                        | Call `server.sendMessageToMainProcess(…)` |
| `src/electron-main/web-socket/…`                  | Listen via `client.on(name, listener)`    |

### Steps

**1. Declare the push message** (mirrors section 2, step 1, but in `main-server-message-name.ts`)

**2. Push from the server**

```ts
import { server } from 'csdm/server/server';
import { MainServerMessageName } from 'csdm/server/messages/main-server-message-name';

server.sendMessageToMainProcess({
  name: MainServerMessageName.MyEvent,
  payload: { data: 'value' },
});
```

**3. Listen in the main process**

```ts
client.on(MainServerMessageName.MyEvent, ({ data }) => {
  // handle event
});
```

---

## 5. Main process ↔ Renderer (Electron IPC)

Use Electron IPC only for OS-level interactions that don't need the server: native dialogs, window state, tray, system startup. For everything else, prefer the WebSocket path.

### Files to touch

| File                                                   | What to add                         |
| ------------------------------------------------------ | ----------------------------------- |
| `src/common/ipc-channel.ts`                            | New channel string constant         |
| `src/electron-main/register-main-process-listeners.ts` | `ipcMain.handle(IPCChannel.Foo, …)` |
| `types/window-preload.d.ts`                            | Method signature in `PreloadApi`    |
| `src/preload/preload.ts`                               | Implementation in the `api` object  |
| `src/ui/`                                              | Call via `window.csdm.myMethod()`   |

### Steps

**1. Add the channel constant**

```ts
// src/common/ipc-channel.ts
export const IPCChannel = {
  // …existing entries…
  MyAction: 'my-action',
};
```

**2. Register the handler in main**

```ts
// src/electron-main/register-main-process-listeners.ts
ipcMain.handle(IPCChannel.MyAction, async (event, arg: string) => {
  return doSomething(arg);
});
```

**3. Declare the type in the preload API**

```ts
// types/window-preload.d.ts  (inside the PreloadApi interface)
myAction: (arg: string) => Promise<string>;
```

**4. Expose through the preload**

```ts
// src/preload/preload.ts  (inside the api object)
myAction: (arg: string): Promise<string> => ipcRenderer.invoke(IPCChannel.MyAction, arg),
```

**5. Call from the UI**

```ts
const result = await window.csdm.myAction('hello');
```

---

## 6. CLI → Server (request/response)

The CLI has its own small handler mapping — do **not** expose renderer handlers to the CLI.

### Files to touch

| File                                                | What to add          |
| --------------------------------------------------- | -------------------- |
| `src/server/messages/cli-client-message-name.ts`    | New enum entry       |
| `src/server/handlers/cli-process/<name>-handler.ts` | Handler function     |
| `src/server/handlers/cli-handlers-mapping.ts`       | Register the handler |

### Steps

The pattern mirrors section 1. In a command (subclass of `src/cli/commands/command.ts`), get a connected client with `this.connectToDaemon()` — it attaches to the running daemon or spawns one:

```ts
// src/cli/commands/my-command.ts
import { CliClientMessageName } from 'csdm/server/messages/cli-client-message-name';

const client = await this.connectToDaemon();
const result = await client.send({ name: CliClientMessageName.MyAction, payload: { id: 42 } });
// client.send() has a timeout (default 3s, per-call override via { timeoutMs } as second argument)
client.on(ServerPushMessageName.MyProgressUpdate, onProgress); // push events also reach the CLI (section 2)
client.close(); // the daemon idle-exits once no clients remain and no work is running
```

---

## 7. WS server ↔ Counter-Strike

The game connects to the WS server when it starts through a C++ "plugin" (`cs2-server-plugin/` and `csgo-server-plugin/`). Communication is bidirectional: the plugin sends events to the server, and the server can send commands back to the game.

### Listen for Counter-Strike events (WS server side)

New event names go in `src/server/messages/game-client-message-name.ts`.

```ts
import { server } from 'csdm/server/server';
import { GameClientMessageName } from 'csdm/server/messages/game-client-message-name';

server.addGameMessageListener(GameClientMessageName.SomeEvent, (payload) => {
  // handle event
});

// Remove all listeners for a given event name:
server.removeGameEventListeners(GameClientMessageName.SomeEvent);
```

### Send a message to Counter-Strike and wait for a response

New command names go in `src/server/messages/game-server-message-name.ts`.

Use the `sendMessageToGame` helper from `src/server/counter-strike.ts`. It checks that the game is connected, registers the response listener, sends the message, waits a few seconds for a reply, cleans up the listener, and throws `CounterStrikeNotConnected` or `CounterStrikeNoResponse` on failure.

```ts
import { sendMessageToGame } from 'csdm/server/counter-strike';
import { GameServerMessageName } from 'csdm/server/messages/game-server-message-name';
import { GameClientMessageName } from 'csdm/server/messages/game-client-message-name';

await sendMessageToGame({
  message: { name: GameServerMessageName.SomeCommand, payload: { value: 1 } },
  responseMessageName: GameClientMessageName.SomeResponse,
  onResponse: (payload) => {
    // handle response
  },
});
```
