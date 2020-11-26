import { __prod__ } from "./constants";
import { MikroORM } from "@mikro-orm/core";
import path from "path";
import { Post } from "./resolvers/entities/Post";
import { User } from "./resolvers/entities/User";
require("dotenv").config({ path: 'src/utils/.env' })
export default {
    migrations: {
        path: path.join(__dirname, "./migrations"),
        pattern: /^[\w-]+\d+\.[tj]s$/,
    },
    entities: [Post, User],
    dbName: 'newtechdb',
    user: 'postgres',
    password: process.env.DB_PASSWORD,
    type: 'postgresql',
    debug: !__prod__,
} as Parameters<typeof MikroORM.init>[0];

