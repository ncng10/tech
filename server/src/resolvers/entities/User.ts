import { ObjectType, Field } from "type-graphql";
import { BaseEntity, Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Post } from "./Post";

@ObjectType()
@Entity()
export class User extends BaseEntity {
    @Field()
    @PrimaryGeneratedColumn()
    id!: number;

    @Field(() => String)
    @CreateDateColumn()
    createdAt = Date();

    @Field()
    @Column({ unique: true })
    email!: string;

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt = Date();

    @Field()
    @Column({ unique: true })
    username!: string;

    //removed @Field() Column to not expose to schema
    @Column()
    password!: string;

    @OneToMany(() => Post, (post) => post.creator)
    posts: Post[];
}