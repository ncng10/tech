import "reflect-metadata";
import { COOKIE_NAME, __prod__ } from "./constants";
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import Redis from 'ioredis';
import session from 'express-session';
import connectRedis from 'connect-redis';
import cors from 'cors';
import { createConnection } from "typeorm";
import { Post } from "./resolvers/entities/Post";
import { User } from "./resolvers/entities/User";
require("dotenv").config({ path: 'src/utils/.env' });
import path from "path";
import { Updoot } from "./resolvers/entities/Updoot";
import { createUserLoader } from "./utils/createUserLoader";
import { createUpdootLoader } from "./utils/createUpdootLoader";

const main = async () => {
    const connection = await createConnection({
        type: 'postgres',
        database: 'techtest2',
        username: 'postgres',
        password: process.env.DB_PASSWORD,
        logging: true,
        migrations: [path.join(__dirname, "./migrations/*")],
        synchronize: true,
        entities: [Post, User, Updoot],
    });

    await connection.runMigrations();

    // await Post.delete({})

    const app = express();

    const RedisStore = connectRedis(session)
    const redis = new Redis();
    app.use(cors(
        {
            origin: 'http://localhost:3000',
            credentials: true,
        }
    ));

    app.use(
        session({
            name: COOKIE_NAME,
            store: new RedisStore({
                client: redis,
                disableTouch: true,
            }),
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 365 * 10, //10 years
                httpOnly: true,
                sameSite: 'lax', //csrf protection
                secure: __prod__  //cookie only works in https
            },
            saveUninitialized: false,
            secret: process.env.REDIS_SECRET || 'sfgkjsfnjlsvm',
            resave: false,
        })
    );

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver, UserResolver],
            validate: false,
        }),
        context: ({ req, res }) => ({ req, res, redis, userLoader: createUserLoader(), updootLoader: createUpdootLoader(), })
    });

    apolloServer.applyMiddleware({ app, cors: { origin: false } });

    app.listen(5001, () => {
        console.log('server started on port 5001')
    });
};

main().catch((err) => {
    console.log(err)
});



console.log("hi")