import "phaser";

import { DebugPlugin, DebugScenePlugin } from "@letumfalx/phaser-plugin-debug";
import {
  SocketIOEventScenePlugin,
  SocketIOPlugin,
} from "@letumfalx/phaser-plugin-socketio";
import { SCENE_LIST } from "./scenes";

new Phaser.Game({
  height: 600,
  parent: "game",
  plugins: {
    global: [
      {
        data: {
          namespace: "game",
        } satisfies Extract<
          Parameters<DebugPlugin["init"]>[0],
          Record<never, never>
        >,
        key: "DebugPlugin",
        mapping: "globalDebug",
        plugin: DebugPlugin,
      },
      {
        data: {
          autoConnect: false,
          reconnection: true,
          reconnectionAttempts: 3,
          reconnectionDelay: 5_000,
        } satisfies Extract<
          Parameters<SocketIOPlugin["init"]>[0],
          { namespace?: undefined | string }
        >,
        key: "SocketIOPlugin",
        mapping: "globalSocket",
        plugin: SocketIOPlugin,
      },
    ],
    scene: [
      {
        key: "DebugScenePlugin",
        mapping: "debug",
        plugin: DebugScenePlugin,
      },
      {
        key: "SocketIOEventScenePlugin",
        mapping: "socket",
        plugin: SocketIOEventScenePlugin,
      },
    ],
  },
  scale: {
    autoCenter: Phaser.Scale.CENTER_BOTH,
    mode: Phaser.Scale.FIT,
  },
  scene: SCENE_LIST,
  type: Phaser.AUTO,
  width: 800,
});
