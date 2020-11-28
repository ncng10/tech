import { MyContext } from "src/types";
import { isAuth } from '../utils/middleware/isAuth'
import { Arg, Ctx, Field, FieldResolver, InputType, Int, Mutation, ObjectType, Query, Resolver, Root, UseMiddleware } from "type-graphql";
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


@ObjectType()
class PaginatedPosts {
    @Field(() => [Post])
    posts: Post[];
    @Field()
    hasMore: boolean;
}


@Resolver(Post)
export class PostResolver {

    @FieldResolver(() => String)
    textSnippet(
        @Root() root: Post
    ) {
        return root.text.slice(0, 50);
    }



    @Query(() => PaginatedPosts)
    async posts(
        @Arg('limit', () => Int) limit: number,
        @Arg('cursor', () => String, { nullable: true }) cursor: string | null //gets posts up until a certain point
    ): Promise<PaginatedPosts> {
        const realLimit = Math.min(50, limit) //max capped at 50.
        const realLimitPlusOne = realLimit + 1;  // tries to fetch an extra post to see if we have reached the max amount of posts
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

        const posts = await qb.getMany()

        return {
            posts: posts.slice(0, realLimitPlusOne),
            hasMore: posts.length === realLimitPlusOne, //if we get 21 items in the fetch, there are more items, if we get less than 21 in the fetch there are no more items
        };
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