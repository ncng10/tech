import { Connection, EntityManager, IDatabaseDriver } from "@mikro-orm/core";
import { Request, Response } from 'express';
import { SessionData } from "express-session";
import { Session } from "inspector";
import { Redis } from "ioredis";
export type MyContext = {
    req: Request & { session: Session & Partial<SessionData> & { userId?: number } };
    res: Response;
    em: EntityManager<any> & EntityManager<IDatabaseDriver<Connection>>
    redis: Redis;
}