---
name: process-communication
description: Use when you need to communicate between two processes — renderer, server, main, or Counter-Strike — whether adding a new message, handler, push event, or IPC channel.
user-invocable: false
---

## Overview

The app runs three OS processes. All heavy logic lives in the **WebSocket server** process. The **renderer** (React UI) and the **Electron main** process both connect to it as WebSocket clients. The Counter-Strike plugin connects as a fourth client when the game is running.

```
Electron main process  ←IPC→  Renderer process (UI)    Counter-Strike
         ↕                            ↕                       ↕
         └──────────→  WebSocket server process  ←────────────┘
```

### Process responsibilities

| Process         | Entry                       | Purpose                                                                                                        |
| --------------- | --------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `electron-main` | `src/electron-main/main.ts` | Window management, tray, auto-updater, IPC registration                                                        |
| `server`        | `src/server/server.ts`      | WebSocket hub; dispatches messages to typed handlers; runs background tasks (analyses, downloads, video queue) |
| `renderer`      | `src/ui/renderer.tsx`       | React UI; communicates exclusively via WebSocket client (`src/ui/web-socket-client.ts`)                        |
| `preload`       | `src/preload/preload.ts`    | Bridges Node.js APIs to renderer via `contextBridge` (file I/O, settings, IPC for OS-level dialogs)            |
| `cli`           | `src/cli/cli.ts`            | Standalone CLI; connects to the running WS server or starts its own                                            |

Every WebSocket message is a JSON object `{ name, payload?, uuid? }`. The server dispatches incoming messages to typed handler functions and replies with `SharedServerMessageName.Reply` or `SharedServerMessageName.ReplyError`.

---

## 1. Renderer → Server (request/response)

This is the most common pattern: the UI asks the server to do something and waits for a result.

### Files to touch

| File                                                               | What to add                                                          |
| ------------------------------------------------------------------ | -------------------------------------------------------------------- |
| `src/server/renderer-client-message-name.ts`                       | New enum entry for the outgoing message name                         |
| `src/server/renderer-server-message-name.ts`                       | Payload/response types if the server also pushes back asynchronously |
| `src/server/handlers/renderer-process/<feature>/<name>-handler.ts` | Handler function                                                     |
| `src/server/handlers/renderer-handlers-mapping.ts`                 | Register the handler                                                 |

### Steps

**1. Add the message name**

```ts
// src/server/renderer-client-message-name.ts
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
      server.sendMessageToRendererProcess({
        name: RendererServerMessageName.LongTaskProgress,
        payload: { count: i + 1, totalCount: payload.items.length },
      });
      await processItem(item);
    }
    server.sendMessageToRendererProcess({ name: RendererServerMessageName.LongTaskSuccess });
  } catch (error) {
    logger.error('Error during long task');
    logger.error(error);
    server.sendMessageToRendererProcess({ name: RendererServerMessageName.LongTaskError });
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
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';

const client = useWebSocketClient();
const result = await client.send({
  name: RendererClientMessageName.MyNewAction,
  payload: { id: 42 },
});
```

---

## 2. Server → Renderer (server push / event)

Use this when the server needs to push an update to the UI without a prior request (e.g. progress events, background task completion).

### Files to touch

| File                                         | What to add                                   |
| -------------------------------------------- | --------------------------------------------- |
| `src/server/renderer-server-message-name.ts` | New enum entry + payload type                 |
| handler or background task                   | Call `server.sendMessageToRendererProcess(…)` |
| UI component / hook                          | Subscribe with `client.on(name, listener)`    |

### Steps

**1. Declare the push message**

```ts
// src/server/renderer-server-message-name.ts
export const RendererServerMessageName = {
  // …existing entries…
  MyProgressUpdate: 'my-progress-update',
} as const;

export type RendererServerMessagePayload = {
  // …existing entries…
  [RendererServerMessageName.MyProgressUpdate]: { percent: number };
};
```

**2. Push from the server**

```ts
import { server } from 'csdm/server/server';
import { RendererServerMessageName } from 'csdm/server/renderer-server-message-name';

server.sendMessageToRendererProcess({
  name: RendererServerMessageName.MyProgressUpdate,
  payload: { percent: 50 },
});
```

**3. Listen in the UI**

```ts
import { useWebSocketClient } from 'csdm/ui/web-socket/use-web-socket-client';
import { RendererServerMessageName } from 'csdm/server/renderer-server-message-name';
import { useEffect } from 'react';

function MyComponent() {
  const client = useWebSocketClient();

  useEffect(() => {
    const onProgress = ({ percent }: { percent: number }) => {
      console.log(percent);
    };
    client.on(RendererServerMessageName.MyProgressUpdate, onProgress);
    return () => {
      client.off(RendererServerMessageName.MyProgressUpdate, onProgress);
    };
  }, [client]);
}
```

---

## 3. Main process → WS server (request/response)

The Electron main process uses the same WebSocket pattern but through a different client and handler mapping.

### Files to touch

| File                                                 | What to add                      |
| ---------------------------------------------------- | -------------------------------- |
| `src/server/main-client-message-name.ts`             | New enum entry                   |
| `src/server/main-server-message-name.ts`             | Payload/response types if needed |
| `src/server/handlers/main-process/<name>-handler.ts` | Handler function                 |
| `src/server/handlers/main-handlers-mapping.ts`       | Register the handler             |

### Steps

The pattern mirrors section 1. The main process sends messages via its WebSocket client created in `src/electron-main/web-socket/create-web-socket-client.ts`:

```ts
// src/electron-main/some-file.ts
import { MainClientMessageName } from 'csdm/server/main-client-message-name';

// fire-and-forget
await client.send({ name: MainClientMessageName.MyAction });

// or wait for a typed reply
const result: boolean = await client.send({ name: MainClientMessageName.MyActionWithReply });
```

---

## 4. WS server → Main process (server push)

### Files to touch

| File                                     | What to add                               |
| ---------------------------------------- | ----------------------------------------- |
| `src/server/main-server-message-name.ts` | New enum entry + payload type             |
| handler or background task               | Call `server.sendMessageToMainProcess(…)` |
| `src/electron-main/web-socket/…`         | Listen via `client.on(name, listener)`    |

### Steps

**1. Declare the push message** (mirrors section 2, step 1, but in `main-server-message-name.ts`)

**2. Push from the server**

```ts
import { server } from 'csdm/server/server';
import { MainServerMessageName } from 'csdm/server/main-server-message-name';

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

## 6. WS server ↔ Counter-Strike

The game connects to the WS server when it starts through a C++ "plugin" (`cs2-server-plugin/` and `csgo-server-plugin/`). Communication is bidirectional: the plugin sends events to the server, and the server can send commands back to the game.

### Listen for Counter-Strike events (WS server side)

New event names go in `src/server/game-client-message-name.ts`.

```ts
import { server } from 'csdm/server/server';
import { GameClientMessageName } from 'csdm/server/game-client-message-name';

server.addGameMessageListener(GameClientMessageName.SomeEvent, (payload) => {
  // handle event
});

// Remove all listeners for a given event name:
server.removeGameEventListeners(GameClientMessageName.SomeEvent);
```

### Send a message to Counter-Strike and wait for a response

New command names go in `src/server/game-server-message-name.ts`.

Use the `sendMessageToGame` helper from `src/server/counter-strike.ts`. It checks that the game is connected, registers the response listener, sends the message, waits a few seconds for a reply, cleans up the listener, and throws `CounterStrikeNotConnected` or `CounterStrikeNoResponse` on failure.

```ts
import { sendMessageToGame } from 'csdm/server/counter-strike';
import { GameServerMessageName } from 'csdm/server/game-server-message-name';
import { GameClientMessageName } from 'csdm/server/game-client-message-name';

await sendMessageToGame({
  message: { name: GameServerMessageName.SomeCommand, payload: { value: 1 } },
  responseMessageName: GameClientMessageName.SomeResponse,
  onResponse: (payload) => {
    // handle response
  },
});
```
