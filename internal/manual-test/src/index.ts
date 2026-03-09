import { withSocketIO } from "@letumfalx/bun-serve-socketio";
import HOME_PAGE from "./index.html";
import { logFn } from "./server/logger";
import type { CustomClientEmitEvents, CustomServerEmitEvents } from "./types";

const server = Bun.serve(
  withSocketIO<CustomClientEmitEvents, CustomServerEmitEvents>({
    register(socket) {
      logFn(`Connected: ${socket.id}`);

      socket.on("sent_to_server", (first, second, third) => {
        logFn(`Received ${socket.id}: sent_to_server`);
        socket.emit("sent_to_client", second, third, first);
      });

      socket.on("disconnect", () => {
        logFn(`Disconnected: ${socket.id}`);
      });
    },
  })({
    fetch: () => new Response(null, { status: 404 }),
    routes: {
      "/": HOME_PAGE,
    },
  })
);

logFn(`Listening at ${server.url}`);
