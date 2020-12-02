import { MyContext } from "src/types";
import { isAuth } from '../utils/middleware/isAuth'
import { Arg, Ctx, Field, FieldResolver, InputType, Int, Mutation, ObjectType, Query, Resolver, Root, UseMiddleware } from "type-graphql";
import { Post } from "./entities/Post";
import { getConnection } from "typeorm";
import { User } from "./entities/User";
import { Updoot } from "./entities/Updoot";

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
    @Mutation(() => Boolean)
    @UseMiddleware(isAuth)
    async vote(
        @Arg('postId', () => Int) postId: number,
        @Arg('value', () => Int) value: number,
        @Ctx() { req }: MyContext
    ) {
        const { userId } = req.session;

        const isUpdoot = value !== -1;
        const realValue = isUpdoot ? 1 : -1

        const updoot = await Updoot.findOne({ where: { postId, userId } })

        if (updoot && updoot.value !== realValue) {
            //user has voted
            //changing their vote as well
            await getConnection().transaction(async (tm) => {
                await tm.query(`
                update updoot
                set value = $1
                where "postId" = $2 and "userId" = $3
                `, [realValue, postId, userId]);

                await tm.query(`
                update post
                set points = points + $1
                where id = $2
                `, [2 * realValue, postId])
            })
        } else if (!updoot) {
            //has never voted
            await getConnection().transaction(async (tm) => {
                await tm.query(
                    `
                insert into updoot ("userId", "postId", value)
                values($1, $2, $3)
                `, [userId, postId, realValue]);
                await tm.query(
                    `
                update post
                set points = points = $1
                where id =$2
                `)
                //transaction manager
            })
        }
    }

    @FieldResolver(() => String)
    textSnippet(
        @Root() root: Post
    ) {
        return root.text.slice(0, 50);
    }



    @Query(() => PaginatedPosts)
    async posts(
        @Arg("limit", () => Int) limit: number,
        @Arg("cursor", () => String, { nullable: true }) cursor: string | null
    ): Promise<PaginatedPosts> {
        // 20 -> 21
        const realLimit = Math.min(50, limit);
        const reaLimitPlusOne = realLimit + 1;

        const replacements: any[] = [reaLimitPlusOne];

        if (cursor) {
            replacements.push(new Date(parseInt(cursor)));
        }

        const posts = await getConnection().query(
            `
          select p.*, 
          json_build_object(
              'id', u.id,
              'email', u.email,
              'username', u.username
              ) creator 
          from post p
          inner join public.user u on u.id = p."creatorId"
          ${cursor ? `where p."createdAt" < $2` : ""}
          order by p."createdAt" DESC
          limit $1
          `,
            replacements
        );
        // const qb = getConnection()
        //   .getRepository(Post)
        //   .createQueryBuilder("p")
        //   .innerJoinAndSelect("p.creator", "u", 'u.id = p."creatorId"')
        //   .orderBy('p."createdAt"', "DESC")
        //   .take(reaLimitPlusOne);

        // if (cursor) {
        //   qb.where('p."createdAt" < :cursor', {
        //     cursor: new Date(parseInt(cursor)),
        //   });
        // }

        // const posts = await qb.getMany();
        // console.log("posts: ", posts);

        return {
            posts: posts.slice(0, realLimit),
            hasMore: posts.length === reaLimitPlusOne,
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