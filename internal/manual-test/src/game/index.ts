import "phaser";

import { DebugPlugin, DebugScenePlugin } from "@letumfalx/phaser-plugin-debug";
import { SCENE_LIST } from "./scenes";

new Phaser.Game({
  height: 600,
  parent: "game",
  plugins: {
    global: [
      {
        data: {
          namespace: "game",
        },
        key: "DebugPlugin",
        mapping: "globalDebug",
        plugin: DebugPlugin,
      },
    ],
    scene: [
      {
        key: "DebugScenePlugin",
        mapping: "debug",
        plugin: DebugScenePlugin,
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
