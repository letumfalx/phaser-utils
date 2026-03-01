import type { EventMap } from "@letumfalx/phaser-plugin-socketio";
import { Server as Engine } from "@socket.io/bun-engine";
import { Server, type Socket } from "socket.io";

export function withSocketIOServer<
  TListenEvents extends EventMap = EventMap,
  TEmitEvents extends EventMap = EventMap,
>(options: {
  register:
    | Record<string, (socket: Socket<TListenEvents, TEmitEvents>) => void>
    | Map<string | RegExp, (socket: Socket<TListenEvents, TEmitEvents>) => void>
    | ((socket: Socket<TListenEvents, TEmitEvents>) => void);
  socketIOOptions?: ConstructorParameters<typeof Engine>[0];
}) {
  const { register, socketIOOptions = {} } = options;

  return function (
    serveOptions: Bun.Serve.Options<unknown>
  ): Bun.Serve.Options<unknown> {
    const io = new Server<TListenEvents, TEmitEvents>();

    let path = socketIOOptions.path ?? "/socket.io/";
    if (!path.startsWith("/")) path = `/${path}`;
    if (!path.endsWith("/")) path = `${path}/`;

    const engine = new Engine({
      maxHttpBufferSize: 1024,
      ...socketIOOptions,
      path,
    });

    io.bind(engine);

    if (typeof register === "function") {
      io.on("connection", register);
    } else {
      const list =
        register instanceof Map ? register.entries() : Object.entries(register);

      for (const [namespace, registerFn] of list) {
        io.of(namespace).on("connection", registerFn);
      }
    }

    const { fetch: ioFetch, ...ioHandlers } = engine.handler();

    return {
      ...serveOptions,
      ...ioHandlers,
      fetch: async (request, server) => {
        const url = new URL(request.url);

        if (url.pathname.startsWith(path)) {
          return ioFetch(request, server);
        }

        if (serveOptions.fetch) {
          return serveOptions.fetch.call(server, request, server);
        }

        return new Response("", { status: 404 });
      },
    } as Bun.Serve.Options<unknown>;
  };
}
