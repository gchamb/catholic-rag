import { Elysia } from "elysia";
import { node } from "@elysia/node"
import documentRoutes from "./modules/document/routes.js";
import staticRoute from "./modules/static/routes.js";

function main() {
  const app = new Elysia({
    adapter: node(),
  })
    .use(staticRoute)
    .group("/api", (app) =>
      app.use(documentRoutes)
    )
    .listen(3000, () => console.log("catholic-rag service is running."));
  return app;
}

main()
