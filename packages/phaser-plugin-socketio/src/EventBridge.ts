import EventEmitter from "eventemitter3";
import type { Socket } from "socket.io-client";
import {
  SOCKET_IO_MANAGER_RESERVED_EVENT_NAMES,
  SOCKET_IO_RESERVED_EVENT_NAMES,
} from "./helpers";
import type {
  EventMap,
  GenericEventHandler,
  MappedSocketEvents,
  SocketEvents,
  SocketStatus,
} from "./types";

type EventBridgeInitOptions = {
  /**
   * The initial status of this event bridge.
   *
   * @default "disconnected"
   */
  status?: undefined | SocketStatus;
};

export class EventBridge<TListenEvents extends EventMap = EventMap> {
  /** The internal event manager. */
  protected readonly events = new EventEmitter();

  /** The socket where we will bridge received events from. */
  protected _socket?: Socket<TListenEvents, EventMap>;

  /** The current connection status. */
  protected _status?: SocketStatus;

  /**
   * The list of functions used to deregister listened events on the socket or
   * its internal manager.
   */
  protected deregisterFunctions: (() => unknown)[] = [];

  /** The function used to deregister the listener used to track status. */
  protected statusTrackerDeregisterFunction?: () => void;

  /** The socket where we will bridge received events from. */
  protected get socket(): Socket<TListenEvents, EventMap> {
    if (!this._socket) {
      throw new Error("EventBridge not yet initialized");
    }

    return this._socket;
  }

  /** The current connection status. */
  get status() {
    if (!this._status) {
      throw new Error("EventBridge not yet initialized");
    }
    return this._status;
  }

  /** Destroy/resets this instance. */
  destroy(): void {
    this.statusTrackerDeregisterFunction?.();
    delete this.statusTrackerDeregisterFunction;

    this.deregisterFunctions.forEach((fn) => fn());
    this.deregisterFunctions = [];
    this.events.removeAllListeners();

    delete this._status;
    delete this._socket;
  }

  /** Initialize the bridge. This will register the event listeners to socket. */
  init(
    socket: Socket<TListenEvents, EventMap>,
    options: EventBridgeInitOptions = {}
  ): void {
    const { status = "disconnected" } = options;

    this._status = status;
    this._socket = socket;

    this.statusTrackerDeregisterFunction = this.registerStatusTracker(socket);

    SOCKET_IO_MANAGER_RESERVED_EVENT_NAMES.forEach((eventName) => {
      const handler = this.createBridgeFunctions(eventName);
      this.socket.io.on(eventName, handler);
      this.deregisterFunctions.push(() =>
        this.socket.io.off(eventName, handler)
      );
    });

    SOCKET_IO_RESERVED_EVENT_NAMES.forEach((eventName) => {
      const handler = this.createBridgeFunctions(eventName);
      this.socket.on(eventName, handler);
      this.deregisterFunctions.push(() => this.socket.off(eventName, handler));
    });

    const catchAllHandler = (
      event: keyof TListenEvents & string,
      ...args: unknown[]
    ) => {
      this.events.emit(event, ...args);
    };
    this.socket.onAny(catchAllHandler);
    this.deregisterFunctions.push(() => this.socket.offAny(catchAllHandler));
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
    this.events.on(event, handler);

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
    this.events.once(event, handler);

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
      this.events.removeAllListeners();
    } else {
      this.events.off(event, handler);
    }

    return this;
  }

  /**
   * Create the handler function to register to the socket.
   *
   * @param eventName The event name
   */
  protected createBridgeFunctions<TEventName extends keyof SocketEvents>(
    eventName: TEventName
  ) {
    const emittedEventName = `socket:${eventName}` as const;

    const handler = (
      ...args: Parameters<MappedSocketEvents[typeof emittedEventName]>
    ) => {
      this.events.emit(emittedEventName, ...args);
    };

    return handler;
  }

  /**
   * Registers event handler to the socket that will be used to track the status
   * of the socket.
   *
   * @param socket The socket to track status from
   * @returns The cleanup function
   */
  protected registerStatusTracker(
    socket: Socket<TListenEvents, EventMap>
  ): () => void {
    // connecting statuses
    const connectingHandler = () => this.setStatus("connecting");
    socket.io.on("open", connectingHandler);
    socket.io.on("reconnect_attempt", connectingHandler);

    // connected statuses
    const connectedHandler = () => this.setStatus("connected");
    socket.on("connect", connectedHandler);
    socket.io.on("reconnect", connectedHandler);

    // disconnect reason based
    const disconnectReasonBasedHandler = (reason: Socket.DisconnectReason) =>
      this.setStatus(
        reason === "io client disconnect" || reason === "io server disconnect"
          ? "disconnected"
          : "connecting"
      );
    socket.on("disconnect", disconnectReasonBasedHandler);

    // active based
    const activeBasedHandler = () =>
      this.setStatus(socket.active ? "connecting" : "disconnected");
    socket.on("connect_error", activeBasedHandler);
    socket.io.on("error", activeBasedHandler);

    // disconnected statuses
    const disconnectHandler = () => this.setStatus("disconnected");
    socket.io.on("reconnect_failed", disconnectHandler);

    return () => {
      // connecting statuses
      socket.io.off("open", connectingHandler);
      socket.io.off("reconnect_attempt", connectingHandler);

      // connected handler
      socket.off("connect", connectedHandler);
      socket.io.off("reconnect", connectedHandler);

      // disconnect reason based
      socket.off("disconnect", disconnectReasonBasedHandler);

      // active based
      socket.off("connect_error", activeBasedHandler);
      socket.io.off("error", activeBasedHandler);

      // disconnected statuses
      socket.io.off("reconnect_failed", disconnectHandler);
    };
  }

  /**
   * Sets the status. This will trigger a `status_changed` event if status
   * changed while setting.
   *
   * @param value The value to set
   */
  protected setStatus(value: SocketStatus): this {
    const prev = this._status;

    if (prev !== value) {
      this._status = value;
      this.events.emit("socket:status_changed", value, prev);
    }

    return this;
  }
}
