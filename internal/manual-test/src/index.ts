import HOME_PAGE from "./index.html";
import { logFn } from "./server/logger";
import { withSocketIOServer } from "./server/withSocketIOServer";
import type { CustomClientEmitEvents, CustomServerEmitEvents } from "./types";

const server = Bun.serve(
  withSocketIOServer<CustomClientEmitEvents, CustomServerEmitEvents>({
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
    routes: {
      "/": HOME_PAGE,
    },
  })
);

logFn(`Listening at ${server.url}`);
