# @letumfalx/phaser-plugin-debug

A [Phaser](https://phaser.io/) plugin that integrates the [debug](https://www.npmjs.com/package/debug) utility into your game instance.

## Installation

```sh
# npm
npm install phaser debug @letumfalx/phaser-plugin-debug

# yarn
yarn add phaser debug @letumfalx/phaser-plugin-debug

# bun
bun add phaser debug @letumfalx/phaser-plugin-debug
```

## Usage

### Global Level

Use `DebugPlugin` to create a global `debug.Debugger` instance:

```ts
import { DebugPlugin } from "@letumfalx/phaser-plugin-debug";
import debug from "debug";
import Phaser from "phaser";

new Phaser.Game({
  plugins: {
    global: [
      {
        key: "DebugPlugin",
        plugin: DebugPlugin,
        data: {
          // Pass a namespace string to create a debug.Debugger instance
          namespace: "namespace",
          // Or pass an existing debug.Debugger instance
          namespace: debug("namespace"),
        },
        mapping: "debug",
      },
    ],
  },
  scene: [MainScene],
});
```

In your scene:

```ts
class MainScene extends Phaser.Scene {
  constructor() {
    super("MainScene");
  }

  create() {
    this.debug.log("this is the main scene");
    const sceneLogger = this.debug.log.extend(this.scene.key);
  }
}
```

To enable TypeScript support, add this declaration:

```ts
// global.d.ts
import { DebugPlugin } from "@letumfalx/phaser-plugin-debug";

declare module "phaser" {
  interface Scene {
    debug: DebugPlugin;
  }
}
```

### Scene Level

Use `SceneDebugPlugin` for scene-specific instances. It automatically extends the global `DebugPlugin` with the namespace `scene:${sceneKey}`, or creates a new one if unavailable:

```ts
import { SceneDebugPlugin } from "@letumfalx/phaser-plugin-debug";
import Phaser from "phaser";

new Phaser.Game({
  plugins: {
    scene: [
      {
        key: "SceneDebugPlugin",
        plugin: SceneDebugPlugin,
        mapping: "debug",
      },
    ],
  },
  scene: [MainScene],
});
```

**Note:** When using both plugins with `mapping`, map them to different keys to avoid conflicts.

## License

MIT
