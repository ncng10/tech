import { ObjectType, Field } from "type-graphql";
import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

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
}