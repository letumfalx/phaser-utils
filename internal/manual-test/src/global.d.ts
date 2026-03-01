import type {
  DebugPlugin,
  SceneDebugPlugin,
} from "@letumfalx/phaser-plugin-debug";

declare module "phaser" {
  interface Scene {
    debug: SceneDebugPlugin;
    globalDebug: DebugPlugin;
  }
}
