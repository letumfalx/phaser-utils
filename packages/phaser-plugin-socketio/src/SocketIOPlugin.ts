import { io, Socket } from "socket.io-client";
import { EventBridge } from "./EventBridge";
import type {
  EventMap,
  GenericEventHandler,
  MappedSocketEvents,
} from "./types";

type SocketIOOptions = Exclude<Parameters<typeof io>[1], undefined>;

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

  /** The socket instance. */
  get instance() {
    if (!this._instance) {
      throw new Error("SocketIOPlugin not initialized");
    }

    return this._instance;
  }

  /** The current status of the socket. */
  get status() {
    return this.bridge.status;
  }

  /** @inheritdoc */
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

  /** @inheritdoc */
  override init(
    data?:
      | undefined
      | null
      | (SocketIOOptions & { namespace?: undefined | string })
      | Socket
  ): void {
    super.init(data);

    const socket = (this._instance = createSocket(data));
    (this._bridge = new EventBridge(socket)).init();
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

/** Resolves the socket instance based on the given data. */
function createSocket(data?: Parameters<SocketIOPlugin["init"]>[0]) {
  if (!data) return io();
  if (data instanceof Socket) return data;

  const { namespace, ...ioOptions } = data;

  return namespace ? io(namespace, ioOptions) : io(ioOptions);
}
