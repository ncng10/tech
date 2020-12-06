import "reflect-metadata";
import 'dotenv-safe/config';
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
import path from "path";
import { createUserLoader } from "./utils/createUserLoader";
import { createUpdootLoader } from "./utils/createUpdootLoader";
import { Post } from "./entities/Post";
import { User } from "./entities/User";
import { Updoot } from "./entities/Updoot";

const main = async () => {
    const connection = await createConnection({
        type: 'postgres',
        url: process.env.DATABASE_URL,
        logging: true,
        migrations: [path.join(__dirname, "./migrations/*")],
        // synchronize: true,
        entities: [Post, User, Updoot],
    });



    const app = express();

    const RedisStore = connectRedis(session)
    const redis = new Redis(process.env.REDIS_URL);
    app.set("trust proxy", 1);
    app.use(cors(
        {
            credentials: true,
            origin: __prod__ ? "https://ncong.app" : "http://localhost:3000"
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
                secure: __prod__,  //cookie only works in https
                domain: __prod__ ? ".ncong.app" : undefined,
            },
            saveUninitialized: false,
            secret: process.env.REDIS_SECRET,
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

    app.listen(parseInt(process.env.PORT), () => {
        console.log('server started on port 5001')
    });
};

main().catch((err) => {
    console.log(err)
});



console.log("hi")