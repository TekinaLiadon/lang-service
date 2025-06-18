import {Elysia} from "elysia";
import router from "./router";
import {swagger} from "@elysiajs/swagger";
import {routerList} from "../02-routes/index.js";
import pool from "../04-shared/workerPool";

const startServe = async () => {
    await routerList();
    const app = new Elysia({
        serve: {
            idleTimeout: 100,
        }
    })
        //.use(redis)
        .use(router)
        //.use(jwt)
        .onError(({error, set}) => {
            set.status = error?.code || 500;
            return {
                message: error?.message || error.toString(),
            };
        })
        .use(
            swagger({
                path: "/api",
                documentation: {
                    info: {
                        title: "Lang service Documentation",
                        version: "1.0.0",
                    },
                    tags: [{name: "Docs", description: "Эндпоинты для авторизации"}],
                },
            })
        )
        .listen(3005);
    console.log(
        `🦊 Lang-service is running at ${app.server?.hostname}:${app.server?.port}`
    );
};

pool()

startServe();





