import EventEmitter from "eventemitter3";
import type { Socket } from "socket.io-client";
import {
  SOCKET_IO_MANAGER_RESERVED_EVENT_NAMES,
  SOCKET_IO_RESERVED_EVENT_NAMES,
  SOCKET_STATUS_CHECK_EVENT_NAMES,
} from "./helpers";
import type {
  EventMap,
  GenericEventHandler,
  MappedSocketEvents,
  SocketEvents,
  SocketStatus,
} from "./types";

export class EventBridge<TListenEvents extends EventMap = EventMap> {
  /** The internal event manager. */
  protected readonly events = new EventEmitter();

  /** The previous status before a change. */
  protected prevStatus: SocketStatus;

  /**
   * The list of functions used to deregister listened events on the socket or
   * its internal manager.
   */
  protected deregisterFunctions: (() => unknown)[] = [];

  constructor(protected readonly socket: Socket<TListenEvents, EventMap>) {
    this.prevStatus = this.status;
  }

  /** The current connection status. */
  get status(): SocketStatus {
    if (this.socket) {
      switch (this.socket.io.engine?.readyState) {
        case "opening":
          return "connecting";
        case "open":
          return this.socket.connected ? "connected" : "connecting";
      }
    }

    return "disconnected";
  }

  /** Destroy/resets this instance. */
  destroy(): void {
    this.deregisterFunctions.forEach((fn) => fn());
    this.deregisterFunctions = [];
    this.events.removeAllListeners();
  }

  /** Initialize the bridge. This will register the event listeners to socket. */
  init(): void {
    this.prevStatus = this.status;

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
  protected createBridgeFunctions<Key extends keyof SocketEvents>(
    eventName: Key
  ) {
    const emittedEventName = `socket:${eventName}` as const;
    const shouldCheckStatus =
      SOCKET_STATUS_CHECK_EVENT_NAMES.includes(eventName);

    const handler = (
      ...args: Parameters<MappedSocketEvents[typeof emittedEventName]>
    ) => {
      if (shouldCheckStatus) this.checkStatusUpdate();
      this.events.emit(emittedEventName, ...args);
    };

    return handler;
  }

  /**
   * Checks the current socket status, and update necessary trackers. This will
   * emit a `socket:status_changed` event when status changes.
   */
  protected checkStatusUpdate = () => {
    const current = this.status;
    const prev = this.prevStatus;

    if (current !== prev) {
      this.prevStatus = current;
      this.events.emit("socket:status_changed", current, prev);
    }
  };
}
