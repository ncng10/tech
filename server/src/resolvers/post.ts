import { MyContext } from "src/types";
import { isAuth } from '../utils/middleware/isAuth'
import { Arg, Ctx, Field, InputType, Mutation, Query, Resolver, UseMiddleware } from "type-graphql";
import { Post } from "./entities/Post";
import { getConnection } from "typeorm";

//crud functions

@InputType()
class PostInput {
    @Field()
    title: string;
    @Field()
    text: string;
}

@Resolver()
export class PostResolver {
    @Query(() => [Post])
    async posts(
        @Arg('limit') limit: number,
        @Arg('cursor', () => String, { nullable: true }) cursor: string | null //gets posts up until a certain point
    ): Promise<Post[]> {
        const realLimit = Math.min(50, limit); //max capped at 50
        const qb = getConnection()
            .getRepository(Post)
            .createQueryBuilder("p")
            .orderBy('"createdAt"', "DESC") //double quotes to keep A capitalized //sorts by newest first
            .take(realLimit)

        if (cursor) {
            //if we have cursor
            //from position of cursor
            //how many items after that positions
            qb.where('"createdAt" < :cursor', {
                cursor: new Date(parseInt(cursor)),
            });
        }
        return qb.getMany();
    }

    @Query(() => Post, { nullable: true })
    post(@Arg('id') id: number): Promise<Post | undefined> {
        return Post.findOne(id);
    }

    @Mutation(() => Post)
    @UseMiddleware(isAuth)
    async createPost(
        @Arg("input") input: PostInput,
        @Ctx() { req }: MyContext
    ): Promise<Post> {
        return Post.create({
            ...input,
            creatorId: req.session.userId,
        }).save();
    }

    @Mutation(() => Post, { nullable: true })
    async updatePost(
        @Arg("id") id: number,
        @Arg("title", () => String, { nullable: true }) title: string,
    ): Promise<Post | null> {
        const post = await Post.findOne(id); //or {where:{id}} used if id isnt the primary key
        if (!post) {
            return null
        }
        if (typeof title !== 'undefined') {
            post.title = title;
            Post.update({ id }, { title });
        }
        return post;
    }

    @Mutation(() => Boolean)
    async deletePost(@Arg("id") id: number): Promise<boolean> {
        await Post.delete(id);
        return true
    }
}