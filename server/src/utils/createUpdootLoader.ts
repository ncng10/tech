import DataLoader from "dataloader"
import { Updoot } from "../resolvers/entities/Updoot";
import { User } from '../resolvers/entities/User'

export const createUpdootLoader = () =>
    new DataLoader<{ postId: number, userId: number | undefined }, Updoot | null>
        (async (keys) => {
            const updoots = await Updoot.findByIds(keys as any);
            const updootIdsToUpdoot: Record<string, Updoot> = {};
            updoots.forEach((updoot) => {
                updootIdsToUpdoot[`${updoot.userId} | ${updoot.postId}`] = updoot;
            });

            return keys.map((key) => updootIdsToUpdoot[`${key.userId} | ${key.postId}`])
        });