import { io, Socket } from "socket.io-client";
import { EventBridge } from "./EventBridge";
import type {
  EventMap,
  GenericEventHandler,
  MappedSocketEvents,
} from "./types";

type SocketIOOptions = Exclude<Parameters<typeof io>[1], undefined>;

/**
 * A Phaser plugin that manages a [Socket.IO](https://socket.io/) client
 * connection, providing a typed interface for emitting and listening to both
 * built-in and custom socket events.
 */
export class SocketIOPlugin<
  TListenEvents extends EventMap = EventMap,
  TEmitEvents extends EventMap = EventMap,
>
  extends Phaser.Plugins.BasePlugin
{
  /** The event bridge for the socket to this plugin. */
  protected _bridge?: EventBridge<TListenEvents>;

  /** The socket we are managing. */
  protected _instance?: Socket<TListenEvents, TEmitEvents>;

  /** The event bridge for the socket to this plugin. */
  protected get bridge() {
    if (!this._bridge) {
      throw new Error("SocketIOPlugin not initialized");
    }

    return this._bridge;
  }

  /**
   * The reference to the `socket.io-client`'s `Socket` instance managed by this
   * plugin.
   *
   * @throws When this plugin is not yet initialized
   */
  get instance() {
    if (!this._instance) {
      throw new Error("SocketIOPlugin not initialized");
    }

    return this._instance;
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

  /**
   * @inheritdoc
   * @internal
   */
  override init(
    data?:
      | undefined
      | null
      | (SocketIOOptions & { namespace?: undefined | string })
      | Socket
  ): void {
    super.init(data);

    const socket = (this._instance = createSocket(data));
    (this._bridge = new EventBridge()).init(socket);
  }

  /**
   * @inheritdoc
   * @internal
   */
  override destroy(): void {
    if (this._bridge) {
      this._bridge.destroy();
      delete this._bridge;
    }

    if (this._instance) {
      this._instance.off();
      this._instance.offAny();
      this._instance.offAny();
      this._instance.removeAllListeners();
      this._instance.disconnect();

      delete this._instance;
    }

    super.destroy();
  }

  /**
   * Connects the socket to the server by calling the internal `Socket`'s
   * `connect` method.
   */
  connect(): this {
    this.instance.connect();
    return this;
  }

  /**
   * Disconnects the socket from the server by calling the internal `Socket`'s
   * `disconnect` method.
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
   * Registers a handler for a custom socket event. Use the event name directly
   * (no prefix required). The handler will be called whenever the event is
   * received.
   *
   * @param event The event to register on
   * @param handler The handler to register
   */
  on<TEventKey extends keyof TListenEvents>(
    event: TEventKey,
    handler: TListenEvents[TEventKey]
  ): this;
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

/** Resolves the socket instance based on the given data. */
function createSocket(data?: Parameters<SocketIOPlugin["init"]>[0]) {
  if (!data) return io();
  if (data instanceof Socket) return data;

  const { namespace, ...ioOptions } = data;

  return namespace ? io(namespace, ioOptions) : io(ioOptions);
}
