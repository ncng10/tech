import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import { COOKIE_NAME, __prod__ } from "./constants";
import microConfig from "./mikro-orm.config";
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import redis from 'redis';
import session from 'express-session';
import connectRedis from 'connect-redis';
import cors from 'cors'
import { sendEmail } from "./utils/sendEmail";
import { User } from "./resolvers/entities/User";
require("dotenv").config({ path: 'src/utils/.env' });
const main = async () => {
    sendEmail('bob@bob.com', 'hello there');
    const orm = await MikroORM.init(microConfig);
    await orm.getMigrator().up();

    const app = express();

    const RedisStore = connectRedis(session)
    const redisClient = redis.createClient()
    app.use(cors(
        {
            origin: 'http://localhost:3000',
            credentials: true,
        }
    ))
    app.use(
        session({
            name: COOKIE_NAME,
            store: new RedisStore({
                client: redisClient,
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
    )

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver, UserResolver],
            validate: false,
        }),
        context: ({ req, res }) => ({ em: orm.em, req, res })
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