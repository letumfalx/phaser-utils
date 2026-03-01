import { EventBridge } from "./EventBridge";
import { SocketIOPlugin } from "./SocketIOPlugin";
import type {
  EventMap,
  GenericEventHandler,
  MappedSocketEvents,
} from "./types";

export class SocketIOEventScenePlugin<
  TListenEvents extends EventMap = EventMap,
  TEmitEvents extends EventMap = EventMap,
>
  extends Phaser.Plugins.ScenePlugin
{
  /** The event bridge for the socket to this plugin. */
  protected _bridge?: EventBridge<TListenEvents>;

  /** The global SocketIOPlugin. */
  protected _global?: SocketIOPlugin<TListenEvents, TEmitEvents>;

  /** The global SocketIO socket instance. */
  get instance() {
    return this.global.instance;
  }

  /** The current status of the socket. */
  get status() {
    return this.bridge.status;
  }

  /** The event bridge for the socket to this plugin. */
  protected get bridge() {
    if (!this._bridge) {
      throw new Error("SocketIOEventScenePlugin not initialized");
    }

    return this._bridge;
  }

  /** The global SocketIOPlugin. */
  protected get global() {
    if (!this._global) {
      throw new Error("SocketIOEventScenePlugin not initialized");
    }

    return this._global;
  }

  /** @inheritdoc */
  override boot(): void {
    super.boot();

    const plugin = this.pluginManager.plugins.find(
      ({ plugin }) => plugin instanceof SocketIOPlugin
    )?.plugin as undefined | SocketIOPlugin<TListenEvents, TEmitEvents>;
    if (!plugin) {
      throw new Error("global SocketIOPlugin not found");
    }
    this._global = plugin;

    this._bridge = new EventBridge(plugin.instance);

    this.systems!.events.on(Phaser.Scenes.Events.START, () => {
      this._bridge?.init();
    });

    this.systems!.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      this._bridge?.destroy();
    });

    this.systems!.events.on(Phaser.Scenes.Events.DESTROY, () => {
      if (this._bridge) {
        this._bridge.destroy();
        delete this._bridge;
      }

      delete this._global;
    });
  }

  /** Connects the socket to the server. */
  connect(): this {
    this.instance.connect();

    return this;
  }

  /** Disconnects the socket to the server. */
  disconnect(): this {
    this.instance.disconnect();

    return this;
  }

  /**
   * Emit the event to the socket.
   *
   * @param eventName The name of the event to emit
   * @param args The data to emit with
   */
  emit<TEventKey extends keyof TEmitEvents & string>(
    eventName: TEventKey,
    ...args: Parameters<TEmitEvents[TEventKey]>
  ): this {
    this.instance.emit(eventName, ...args);
    return this;
  }

  /**
   * Listen to an event.
   *
   * @param event The event to register on
   * @param handler The handler to register
   */
  on<TEventKey extends keyof MappedSocketEvents>(
    event: TEventKey,
    handler: MappedSocketEvents[TEventKey]
  ): this;
  /**
   * Listen to an event.
   *
   * @param event The event to register on
   * @param handler The handler to register
   */
  on<TEventKey extends keyof TListenEvents>(
    event: TEventKey,
    handler: TListenEvents[TEventKey]
  ): this;
  /**
   * Listen to an event.
   *
   * @param event The event to register on
   * @param handler The handler to register
   */
  on(event: string, handler: GenericEventHandler): this {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.bridge.on(event as any, handler);

    return this;
  }

  once<TEventKey extends keyof MappedSocketEvents>(
    event: TEventKey,
    handler: MappedSocketEvents[TEventKey]
  ): this;
  once<TEventKey extends keyof TListenEvents>(
    event: TEventKey,
    handler: TListenEvents[TEventKey]
  ): this;
  once(event: string, handler: GenericEventHandler): this {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.bridge.once(event as any, handler);

    return this;
  }

  /**
   * Removes the listener/s from an event.
   *
   * @param event The event to where to remove listener from
   * @param handler The handler to remove, removes all handler of the event if
   *   not given
   */
  off<TEventKey extends keyof MappedSocketEvents>(
    event: TEventKey,
    handler?: undefined | MappedSocketEvents[TEventKey]
  ): this;
  /**
   * Removes the listener/s from an event.
   *
   * @param event The event to where to remove listener from
   * @param handler The handler to remove, removes all handler of the event if
   *   not given
   */
  off<TEventKey extends keyof TListenEvents>(
    event: TEventKey,
    handler?: undefined | TListenEvents[TEventKey]
  ): this;
  /** Removes all the listeners. */
  off(): this;
  off(
    event?: undefined | string,
    handler?: undefined | GenericEventHandler
  ): this {
    if (typeof event === "undefined") {
      this.bridge.off();
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.bridge.off(event as any, handler);
    }

    return this;
  }
}
