import { MyContext } from "src/types";
import { Arg, Ctx, Field, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import { User } from "./entities/User";
import argon2 from 'argon2';
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from "../constants"
import { UsernamePasswordInput } from "./UsernamePasswordInput";
import { validateRegister } from "../utils/validateRegister"
import { sendEmail } from "../utils/sendEmail";
import { v4 } from 'uuid';
import { getConnection } from "typeorm";
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

@Resolver()
export class UserResolver {
    //change password
    @Mutation(() => UserResponse)
    async changePassword(
        @Arg('token') token: string,
        @Arg('newPassword') newPassword: string,
        @Ctx() { redis, req }: MyContext
    ): Promise<UserResponse> {
        if (newPassword.length <= 2) {
            return {
                errors: [
                    {
                        field: "newPassword",
                        message: "length must be greater than 2",
                    },
                ],
            };
        }

        const key = FORGET_PASSWORD_PREFIX + token;
        const userId = await redis.get(key);
        if (!userId) {
            return {
                errors: [
                    {
                        field: "token",
                        message: "token expired",
                    },
                ],
            };
        }

        const userIdNum = parseInt(userId)
        const user = await User.findOne(userIdNum);

        if (!user) {
            return {
                errors: [
                    {
                        field: "token",
                        message: "user no longer exists",
                    },
                ],
            };
        }

        await User.update({ id: userIdNum }, {
            password: await argon2.hash(newPassword),
        })

        //login user after password is changed
        req.session.userId = user.id;
        await redis.del(key);
        return { user };

    }

    //forgot password email
    @Mutation(() => Boolean)
    async forgotPassword(
        @Arg('email') email: string,
        @Ctx() { redis }: MyContext
    ) {
        const user = await User.findOne({ where: { email } }) //use this syntax to search for something that is not a primary key
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
    me(@Ctx() { req }: MyContext) {
        if (!req.session.userId) {
            return null //you are not logged in
        }
        User.findOne(req.session.userId);
    };

    //register
    @Mutation(() => UserResponse)
    async register(
        @Arg('options') options: UsernamePasswordInput,
        @Ctx() { req }: MyContext
    ): Promise<UserResponse> {
        const errors = validateRegister(options);
        if (errors) {
            return { errors };
        }
        const hashedPassword = await argon2.hash(options.password)
        let user;
        try {
            const result = await getConnection()
                .createQueryBuilder()
                .insert()
                .into(User)
                .values(
                    {
                        username: options.username,
                        email: options.email,
                        password: hashedPassword,
                    }
                )
                .returning("*")
                .execute();
            user = result.raw[0]
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
        @Ctx() { req }: MyContext
    ): Promise<UserResponse> {
        const user = await User.findOne(
            userNameOrEmail.includes("@")
                ? { where: { email: userNameOrEmail } }
                : { where: { username: userNameOrEmail } }
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