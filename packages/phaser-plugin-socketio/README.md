# @letumfalx/phaser-plugin-socketio

A [Phaser](https://phaser.io/) plugin for seamless [Socket.IO](https://socket.io/) client integration in your game. Manage socket connections and events globally or per scene, with full TypeScript support.

---

## Features

- **Global Socket Management:** Centralize your Socket.IO connection for your entire game.
- **Scene-Level Event Handling:** Register and clean up event listeners automatically per scene.
- **TypeScript Support:** Strongly typed events for better intellisense and safety.
- **Flexible API:** Use with custom or default Socket.IO instances and options.

---

## Installation

```sh
# npm
npm install phaser socket.io-client eventemitter3 @letumfalx/phaser-plugin-socketio

# yarn
yarn add phaser socket.io-client eventemitter3 @letumfalx/phaser-plugin-socketio

# bun
bun add phaser socket.io-client eventemitter3 @letumfalx/phaser-plugin-socketio
```

---

## Usage

### 1. Global Plugin

Register the `SocketIOPlugin` as a global plugin to manage your socket connection:

```ts
import Phaser from "phaser";
import { SocketIOPlugin } from "@letumfalx/phaser-plugin-socketio";
import io from "socket.io-client";

new Phaser.Game({
  plugins: {
    global: [
      {
        key: "SocketIOPlugin",
        plugin: SocketIOPlugin,
        mapping: "socket",
        // Pass Socket.IO options or an initialized Socket instance
        data: {
          autoConnect: false,
          namespace: "game",
        },
        // OR
        // data: io("game", { autoConnect: false }),
      },
    ],
  },
});
```

#### Example Scene Usage

```ts
class MainScene extends Phaser.Scene {
  create() {
    this.add
      .text(0, 0, "Connect")
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => this.socket.connect());

    this.add
      .text(0, 30, "Disconnect")
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => this.socket.disconnect());

    this.add
      .text(0, 60, "Send Event")
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => this.socket.emit("event_name", "event_value"));

    this.socket.on("received_event", (...args: unknown[]) => {
      console.log(args);
    });
  }
}
```

> **Note:** When using the global plugin, manually clean up event listeners to avoid duplicates if the scene restarts. For automatic cleanup, use the scene plugin below.

---

### 2. Scene Plugin

Register `SocketIOEventScenePlugin` as a scene plugin for automatic event listener cleanup on scene shutdown:

```ts
import Phaser from "phaser";
import {
  SocketIOPlugin,
  SocketIOEventScenePlugin,
} from "@letumfalx/phaser-plugin-socketio";

new Phaser.Game({
  plugins: {
    global: [
      {
        key: "SocketIOPlugin",
        plugin: SocketIOPlugin,
        mapping: "globalSocket", // Avoid name collision
      },
    ],
    scene: [
      {
        key: "SocketIOEventScenePlugin",
        plugin: SocketIOEventScenePlugin,
        mapping: "socket",
      },
    ],
  },
});
```

> **Note:** The global plugin is required; the scene plugin uses its socket instance.

Both plugins share the same API for emitting and listening to events.

---

### 3. TypeScript Integration

Add type declarations for strong typing and intellisense:

```ts
// global.d.ts
import {
  SocketIOPlugin,
  SocketIOEventScenePlugin,
} from "@letumfalx/phaser-plugin-socketio";

type ReceivedEvents = {
  test_receive: (first: number) => void;
};

type EmittedEvents = {
  test_send: (first: string) => void;
};

declare module "phaser" {
  interface Scene {
    globalSocket: SocketIOPlugin<ReceivedEvents, EmittedEvents>;
    socket: SocketIOEventScenePlugin<ReceivedEvents, EmittedEvents>;
  }
}
```

You can pass your own event maps for better type safety.

---

## SocketIOPlugin

A Phaser plugin that manages a [Socket.IO](https://socket.io/) client connection, providing a typed interface for emitting and listening to both built-in and custom socket events.

### Type Parameters

- `TListenEvents extends EventMap = EventMap`: The map of custom events that the plugin can listen to.
- `TEmitEvents extends EventMap = EventMap`: The map of custom events that the plugin can emit.

### Properties

#### `instance: Socket`

The reference to the `socket.io-client`'s `Socket` instance managed by this plugin.

> **Throws:** When the plugin is not yet initialized.

---

#### `status: "disconnected" | "connecting" | "connected"`

The current status of the socket connection.

- `disconnected`: Not connected to the server.
- `connecting`: Connecting to the server, or waiting for connection to be established.
- `connected`: Connected to the server and ready to listen/emit events.

> **Throws:** When the plugin is not yet initialized.

---

### Methods

#### `connect(): this`

Connects the socket to the server by calling the internal `Socket`'s `connect` method.

---

#### `disconnect(): this`

Disconnects the socket from the server by calling the internal `Socket`'s `disconnect` method.

---

#### `emit<TEventKey extends keyof TEmitEvents & string>(eventName: TEventKey, ...args: Parameters<TEmitEvents[TEventKey]>): this`

Emits a custom event to the socket.

- `eventName`: The name of the event to emit.
- `args`: The data to emit with the event.

---

#### `on<TEventKey extends keyof MappedSocketEvents>(event: TEventKey, handler: MappedSocketEvents[TEventKey]): this`

Registers a handler for a built-in socket event. Built-in events are prefixed with `socket:` (see [Manager Events](https://socket.io/docs/v4/client-api/#events) and [Socket Events](https://socket.io/docs/v4/client-api/#events-1)).

**Plugin custom socket events:**

| Status                    | Signature                                                                                                                 |
| :------------------------ | :------------------------------------------------------------------------------------------------------------------------ |
| **socket:status_changed** | `(newStatus: "disconnected"\|"connecting"\|"connected", prevStatus: "disconnected"\| "connecting"\| "connected") => void` |

#### `on<TEventKey extends keyof TListenEvents & string>(eventName: TEventKey, handler: TListenEvents[TEventKey]): this`

Registers a handler for a custom socket event. Use the event name directly (no prefix required). The handler will be called whenever the event is received.

---

#### `once<TEventKey extends keyof MappedSocketEvents>(event: TEventKey, handler: MappedSocketEvents[TEventKey]): this`

Registers a one-time handler for a built-in socket event (prefixed with `socket:`). The handler is automatically removed after it is triggered once.

#### `once<TEventKey extends keyof TListenEvents & string>(eventName: TEventKey, handler: TListenEvents[TEventKey]): this`

Registers a one-time handler for a custom socket event. The handler is automatically removed after it is triggered once.

---

#### `off<TEventKey extends keyof MappedSocketEvents>(event: TEventKey, handler?: MappedSocketEvents[TEventKey]): this`

Removes a handler for a built-in socket event. If only the event name is provided, all handlers for that event are removed. Works for handlers registered with both `on` and `once`.

#### `off<TEventKey extends keyof TListenEvents>(event: TEventKey, handler?: TListenEvents[TEventKey]): this`

Removes a handler for a custom socket event. If only the event name is provided, all handlers for that event are removed. Works for handlers registered with both `on` and `once`.

#### `off(): this`

Removes all event handlers for all events, both built-in and custom, regardless of how they were registered.

---

## SocketIOEventScenePlugin

A Phaser scene plugin that provides automatic management of Socket.IO event listeners within a scene. It ensures that all event handlers registered through the plugin are automatically cleaned up when the scene shuts down, preventing memory leaks and duplicate listeners on scene restarts. The plugin delegates all socket operations to the global `SocketIOPlugin` instance, so all scenes share the same socket connection, but each scene can independently manage its own event listeners.

Use this plugin when you want scene-specific socket event handling with automatic cleanup, while maintaining a single global socket connection for your game.

### Type Parameters

- `TListenEvents extends EventMap = EventMap`: The map of custom events that the plugin can listen to.
- `TEmitEvents extends EventMap = EventMap`: The map of custom events that the plugin can emit.

### Properties & Methods

The `SocketIOEventScenePlugin` exposes the same API as the global `SocketIOPlugin`, including all properties and methods for managing socket events. The `instance` property references the global socket instance, ensuring all scenes share the same connection.

> **Note:** The event manager for the global and scene plugins are independent. Removing event handlers with `off` on the global plugin does not affect handlers registered via the scene plugin, and vice versa. This allows for automatic cleanup of scene-specific handlers when a scene shuts down, without interfering with global event listeners.

---

## Contributing

Contributions, issues, and feature requests are welcome! Feel free to open an issue or submit a pull request.

---

## Related

- [Phaser](https://phaser.io/)
- [Socket.IO](https://socket.io/)
- [eventemitter3](https://github.com/primus/eventemitter3)

---

## License

MIT
