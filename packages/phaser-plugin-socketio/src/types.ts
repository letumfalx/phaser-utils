import type { DisconnectDescription, Socket } from "socket.io-client";

export type SocketStatus = "disconnected" | "connected" | "connecting";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type GenericEventHandler = (...args: any[]) => any;

export type EventMap = {
  [key: string]: GenericEventHandler;
};

export type SocketIOReservedEvents = {
  connect: () => void;
  connect_error: (error: Error) => void;
  disconnect: (reason: Socket.DisconnectReason, description?: unknown) => void;
};

export type SocketIOManagerReservedEvents = {
  open: () => void;
  error: (err: Error) => void;
  ping: () => void;
  packet: (packet: unknown) => void;
  close: (reason: string, description?: DisconnectDescription) => void;
  reconnect_failed: () => void;
  reconnect_attempt: (attempt: number) => void;
  reconnect_error: (err: Error) => void;
  reconnect: (attempt: number) => void;
};

export type SocketIOPluginEvents = {
  status_changed: (nextStatus: SocketStatus, prevStatus: SocketStatus) => void;
};

export type SocketEvents = SocketIOReservedEvents &
  SocketIOManagerReservedEvents &
  SocketIOPluginEvents;

export type MappedSocketEvents = {
  [Key in keyof SocketEvents as `socket:${Key}`]: SocketEvents[Key];
};
