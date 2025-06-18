import { Elysia } from "elysia";
import { list } from "../02-routes/index.js";
import options from "../03-entities/options.js";

const router = new Elysia({ prefix: "/api" })
  .group("/docs", (app) =>
    app
      .get("/front", (all) => list.docs.front.default(all), options.docsFront)

  )

export default router;
