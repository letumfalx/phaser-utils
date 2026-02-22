import debug from "debug";

export class DebugPlugin extends Phaser.Plugins.BasePlugin {
  protected debugInstance?: debug.Debugger;

  /** The global debug instance. */
  get log() {
    if (!this.debugInstance) {
      throw new Error("DebugPlugin not yet initialized");
    }

    return this.debugInstance;
  }

  /** @inheritdoc */
  override init(
    data?:
      | undefined
      | null
      | { namespace?: undefined | null | string | debug.Debugger }
  ): void {
    super.init(data);
    const namespace = data?.namespace ?? "app";

    this.debugInstance =
      typeof namespace === "function" ? namespace : debug(namespace);
  }

  /** @inheritdoc */
  override destroy(): void {
    super.destroy();

    if (this.debugInstance) {
      this.debugInstance.destroy();
      delete this.debugInstance;
    }
  }
}
