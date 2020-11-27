import { MyContext } from "src/types";
import { Arg, Ctx, Field, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import { User } from "./entities/User";
import argon2 from 'argon2';
import { EntityManager } from '@mikro-orm/postgresql'
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from "../constants"
import { UsernamePasswordInput } from "./UsernamePasswordInput";
import { validateRegister } from "../utils/validateRegister"
import { sendEmail } from "../utils/sendEmail";
import { v4 } from 'uuid';
//error in a specific field
@ObjectType()
class FieldError {
    @Field()
    field: string;
    @Field()
    message: string;
}

//user returned if it works propery, or an error to be return if it faisl
@ObjectType()
class UserResponse {
    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[]

    @Field(() => User, { nullable: true })
    user?: User
}

//register
@Resolver()
export class UserResolver {

    //forgot password email
    @Mutation(() => Boolean)
    async forgotPassword(
        @Arg('email') email: string,
        @Ctx() { em, redis }: MyContext
    ) {
        const user = await em.findOne(User, { email })
        if (!user) {
            //email not in database, returns true as to not
            //tell the person it doesnt exist for security
            return true;
        }
        const token = v4();

        await redis.set(
            FORGET_PASSWORD_PREFIX + token,
            user.id,
            'ex',
            1000 * 60 * 60 * 24 * 3); //3 days
        await sendEmail(
            email,
            `<a href="http://localhost:3000/change-password/${token}">Reset password</a>`
        )

        return true;
    };

    //get user info of the currently logged in user
    @Query(() => User, { nullable: true })
    async me(
        @Ctx() { req, em }: MyContext
    ) {
        if (!req.session.userId) {
            return null //you are not logged in
        }
        const user = await em.findOne(User, { id: req.session.userId })
        return user
    };

    //register
    @Mutation(() => UserResponse)
    async register(
        @Arg('options') options: UsernamePasswordInput,
        @Ctx() { em, req }: MyContext
    ): Promise<UserResponse> {
        const errors = validateRegister(options);
        if (errors) {
            return { errors };
        }
        const hashedPassword = await argon2.hash(options.password)
        let user;
        try {
            const result = await (em as EntityManager)
                .createQueryBuilder(User)
                .getKnexQuery().insert({
                    username: options.username,
                    email: options.email,
                    password: hashedPassword,
                    created_at: new Date(),
                    updated_at: new Date(),
                }).returning("*");
            user = result[0];
        } catch (err) {
            if (err.code === '23505' || err.detail.includes("already exists")) {
                //duplicate username errors
                return {
                    errors: [{
                        field: 'username',
                        message: 'username has already been taken',
                    }],
                }
            }
            console.log('message:', err.message)
        }
        //log user in when registering 
        //store user id session
        //set cookie on user
        req.session.userId = user.id;
        return { user };
    }

    //login
    @Mutation(() => UserResponse)
    async login(
        @Arg('userNameOrEmail') userNameOrEmail: string,
        @Arg('password') password: string,
        @Ctx() { em, req }: MyContext
    ): Promise<UserResponse> {
        const user = await em.findOne(
            User,
            userNameOrEmail.includes("@")
                ? { email: userNameOrEmail }
                : { username: userNameOrEmail }
        );
        if (!user) {
            return {
                errors: [{
                    field: "userNameOrEmail",
                    message: "Username does not exist",
                }],
            };
        }
        const valid = await argon2.verify(user.password, password);
        if (!valid) {
            return {
                errors: [
                    {
                        field: "password",
                        message: "Invalid Login",
                    },
                ],
            };
        }

        req.session.userId = user.id;

        return {
            user
        };
    }

    @Mutation(() => Boolean)
    logout(
        @Ctx() { req, res }: MyContext
    ) {
        //removes session from redis
        //removes cookie
        return new Promise((resolve) => req.session.destroy(err => {
            res.clearCookie(COOKIE_NAME);
            if (err) {
                console.log(err);
                resolve(false);
                return
            }
            resolve(true);
        }));
    }
}