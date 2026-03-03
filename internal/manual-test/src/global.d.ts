import type {
  DebugPlugin,
  DebugScenePlugin,
} from "@letumfalx/phaser-plugin-debug";
import type {
  SocketIOEventScenePlugin,
  SocketIOPlugin,
} from "@letumfalx/phaser-plugin-socketio";
import type { CustomClientEmitEvents, CustomServerEmitEvents } from "./types";

declare module "phaser" {
  interface Scene {
    debug: DebugScenePlugin;
    globalDebug: DebugPlugin;

    socket: SocketIOEventScenePlugin<
      CustomServerEmitEvents,
      CustomClientEmitEvents
    >;
    globalSocket: SocketIOPlugin<
      CustomServerEmitEvents,
      CustomClientEmitEvents
    >;
  }
}
