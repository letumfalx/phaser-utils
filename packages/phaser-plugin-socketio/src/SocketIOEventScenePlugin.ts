import { EventBridge } from "./EventBridge";
import { SocketIOPlugin } from "./SocketIOPlugin";
import type {
  EventMap,
  GenericEventHandler,
  MappedSocketEvents,
} from "./types";

/**
 * A Phaser scene plugin that provides automatic management of Socket.IO event
 * listeners within a scene. It ensures that all event handlers registered
 * through the plugin are automatically cleaned up when the scene shuts down,
 * preventing memory leaks and duplicate listeners on scene restarts. The plugin
 * delegates all socket operations to the global `SocketIOPlugin` instance, so
 * all scenes share the same socket connection, but each scene can independently
 * manage its own event listeners.
 *
 * Use this plugin when you want scene-specific socket event handling with
 * automatic cleanup, while maintaining a single global socket connection for
 * your game.
 */
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

  /**
   * The current status of the socket connection.
   *
   * - `disconnected`: Not connected to the server.
   * - `connecting`: Connecting to the server, or waiting for connection to be
   *   established.
   * - `connected`: Connected to the server and ready to listen/emit events.
   *
   * @throws When the plugin is not yet initialized
   */
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

  /**
   * @inheritdoc
   * @internal
   */
  override boot(): void {
    super.boot();

    const plugin = this.pluginManager.plugins.find(
      ({ plugin }) => plugin instanceof SocketIOPlugin
    )?.plugin as undefined | SocketIOPlugin<TListenEvents, TEmitEvents>;
    if (!plugin) {
      throw new Error("global SocketIOPlugin not found");
    }
    this._global = plugin;

    this._bridge = new EventBridge();

    this.systems!.events.on(Phaser.Scenes.Events.START, () => {
      this._bridge?.init(this.global.instance, { status: this.global.status });
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

  /**
   * Connects the shared global Socket.IO socket to the server.
   *
   * This method delegates to the global SocketIOPlugin's `connect()` method,
   * ensuring that the single shared socket connection is established. Calling
   * this from any scene is safe; it will not create duplicate connections.
   */
  connect(): this {
    this.instance.connect();

    return this;
  }

  /**
   * Disconnects the shared global Socket.IO socket from the server.
   *
   * This method delegates to the global SocketIOPlugin's `disconnect()` method,
   * ensuring that the single shared socket connection is properly closed.
   * Calling this from any scene is safe; it will not cause errors if already
   * disconnected.
   */
  disconnect(): this {
    this.instance.disconnect();

    return this;
  }

  /**
   * Emits a custom event to the socket.
   *
   * @param eventName The name of the event to emit
   * @param args The data to emit with the event
   */
  emit<TEventKey extends keyof TEmitEvents & string>(
    eventName: TEventKey,
    ...args: Parameters<TEmitEvents[TEventKey]>
  ): this {
    this.instance.emit(eventName, ...args);
    return this;
  }

  /**
   * Registers a handler for a built-in socket event. Built-in events are
   * prefixed with `socket:` (see [Manager
   * Events](https://socket.io/docs/v4/client-api/#events) and [Socket
   * Events](https://socket.io/docs/v4/client-api/#events-1)).
   *
   * Plugin custom Socket events:
   *
   * | Status                    | Signature                                                                                                                 |
   * | :------------------------ | :------------------------------------------------------------------------------------------------------------------------ |
   * | **socket:status_changed** | `(newStatus: "disconnected"\|"connecting"\|"connected", prevStatus: "disconnected"\| "connecting"\| "connected") => void` |
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
   * Registers a handler for a custom socket event. Use the event name directly
   * (no prefix required). The handler will be called whenever the event is
   * received.
   *
   * @param event The event to register on
   * @param handler The handler to register
   */
  on(event: string, handler: GenericEventHandler): this {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.bridge.on(event as any, handler);

    return this;
  }

  /**
   * Registers a one-time handler for a built-in socket event (prefixed with
   * `socket:`). The handler is automatically removed after it is triggered
   * once.
   *
   * @param event The event to register on
   * @param handler The handler to register
   */
  once<TEventKey extends keyof MappedSocketEvents>(
    event: TEventKey,
    handler: MappedSocketEvents[TEventKey]
  ): this;
  /**
   * Registers a one-time handler for a custom socket event. The handler is
   * automatically removed after it is triggered once.
   *
   * @param event The event to register on
   * @param handler The handler to register
   */
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
   * Removes a handler for a built-in socket event. If only the event name is
   * provided, all handlers for that event are removed. Works for handlers
   * registered with both `on` and `once`.
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
   * Removes a handler for a custom socket event. If only the event name is
   * provided, all handlers for that event are removed. Works for handlers
   * registered with both `on` and `once`.
   *
   * @param event The event to where to remove listener from
   * @param handler The handler to remove, removes all handler of the event if
   *   not given
   */
  off<TEventKey extends keyof TListenEvents>(
    event: TEventKey,
    handler?: undefined | TListenEvents[TEventKey]
  ): this;
  /**
   * Removes all event handlers for all events, both built-in and custom,
   * regardless of how they were registered.
   */
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
