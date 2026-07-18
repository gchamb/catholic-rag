import { Elysia } from "elysia";
import { staticPlugin } from "@elysia/static"
import { fileURLToPath } from "node:url";
import path from "node:path";
import { readFile } from "node:fs/promises";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDist = path.resolve(__dirname,
  "../../../../client/dist");
const indexHtml = path.join(clientDist, "index.html");

const staticRoute = new Elysia()
  .use(await staticPlugin({
    assets: clientDist,
    prefix: "/",
    alwaysStatic: true,
  })).get("*", async (): Promise<Response> => {
    const html = await readFile(indexHtml, "utf-8");
    return new Response(html, {
      headers: { "Content-Type": "text/html" },
    });
  });

export default staticRoute;
