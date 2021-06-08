import { UpdootDirection } from "../typeorm-types/enums";
import { Field, ObjectType } from "type-graphql";
import { BaseEntity, Column, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import { Post } from "./Post";
import { User } from "./User";

@ObjectType()
@Entity()
export class Updoot extends BaseEntity {
	@Field(() => UpdootDirection)
	@Column({ type: "int" })
	value: UpdootDirection;

	@Field()
	@PrimaryColumn()
	authorId!: number;

	@Field(() => User)
	@ManyToOne(() => User)
	author: User;

	@Field()
	@PrimaryColumn()
	postId!: number;

	@Field(() => Post)
	@ManyToOne(
		() => Post 
		/*{ onDelete: "CASCADE" } 
		alternative way to have updoots of a post be deleted along with the post*/
	)
	post: Post;
}
