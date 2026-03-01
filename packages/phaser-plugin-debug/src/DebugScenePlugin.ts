import debug from "debug";
import { DebugPlugin } from "./DebugPlugin";

export class DebugScenePlugin extends Phaser.Plugins.ScenePlugin {
  protected debugInstance?: debug.Debugger;

  /** The global debug instance. */
  get log() {
    if (!this.debugInstance) {
      throw new Error("DebugScenePlugin not yet initialized");
    }

    return this.debugInstance;
  }

  /** @inheritdoc */
  override boot(): void {
    super.boot();

    const sceneKey = this.systems!.settings.key;
    const namespace = sceneKey ? `scene:${sceneKey}` : "scene";

    // find the global DebugPlugin and extends from that
    for (const globalPlugin of this.pluginManager.plugins) {
      if (globalPlugin.plugin instanceof DebugPlugin) {
        this.debugInstance = globalPlugin.plugin.log.extend(namespace);
        break;
      }
    }

    if (!this.debugInstance) {
      // if still not instantiated, we will create a new one
      this.debugInstance = debug(namespace);
    }

    this.debugInstance.enabled = false;

    this.systems!.events.on(Phaser.Scenes.Events.START, () => {
      if (this.debugInstance) {
        this.debugInstance.enabled = true;
      }
    });

    this.systems!.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      if (this.debugInstance) {
        this.debugInstance.enabled = false;
      }
    });

    this.systems!.events.on(Phaser.Scenes.Events.DESTROY, () => {
      if (this.debugInstance) {
        this.debugInstance.enabled = false;
        delete this.debugInstance;
      }
    });
  }
}

/** @deprecated Use `DebugScenePlugin` instead */
export const SceneDebugPlugin = DebugScenePlugin;
