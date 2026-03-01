import HOME_PAGE from "./index.html";
import { logFn } from "./server/logger";

const server = Bun.serve({
  routes: {
    "/": HOME_PAGE,
  },
});

logFn(`Listening at ${server.url}`);
