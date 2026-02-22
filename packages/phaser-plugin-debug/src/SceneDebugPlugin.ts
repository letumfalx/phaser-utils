import debug from "debug";
import { DebugPlugin } from "./DebugPlugin";

export class SceneDebugPlugin extends Phaser.Plugins.ScenePlugin {
  protected debugInstance?: debug.Debugger;

  /** The global debug instance. */
  get log() {
    if (!this.debugInstance) {
      throw new Error("SceneDebugPlugin not yet initialized");
    }

    return this.debugInstance;
  }

  /** @inheritdoc */
  override boot(): void {
    super.boot();

    const sceneKey = this.systems?.settings.key;

    // find the global DebugPlugin
    for (const globalPlugin of this.pluginManager.plugins) {
      if (globalPlugin.plugin instanceof DebugPlugin) {
        this.debugInstance = globalPlugin.plugin.log.extend(
          sceneKey ? `scene:${sceneKey}` : "scene"
        );
        break;
      }
    }

    if (!this.debugInstance) {
      // if still not initialized
      this.debugInstance = debug(sceneKey ? `scene:${sceneKey}` : "scene");
    }

    const cleanUp = () => {
      if (this.debugInstance) {
        this.debugInstance.destroy();
        delete this.debugInstance;
      }
    };

    this.systems?.events.on("shutdown", cleanUp);
    this.systems?.events.on("destroy", cleanUp);
  }
}
