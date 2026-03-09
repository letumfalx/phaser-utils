import type {
  SocketIOManagerReservedEvents,
  SocketIOPluginEvents,
  SocketIOReservedEvents,
} from "./types";

export const SOCKET_IO_MANAGER_RESERVED_EVENT_NAMES: (keyof SocketIOManagerReservedEvents)[] =
  [
    "open",
    "error",
    "ping",
    "packet",
    "close",
    "reconnect_failed",
    "reconnect_attempt",
    "reconnect_error",
    "reconnect",
  ];

export const SOCKET_IO_RESERVED_EVENT_NAMES: (keyof SocketIOReservedEvents)[] =
  ["connect", "connect_error", "disconnect"];

export const SOCKET_PLUGIN_RESERVED_EVENT_NAMES: (keyof SocketIOPluginEvents)[] =
  ["status_changed"];
