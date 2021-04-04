import { Post } from "../entities/Post";
import { User } from "../entities/User";
import { ObjectType, Field } from "type-graphql";

@ObjectType()
export class PostFieldError {
	@Field(() => String, { nullable: true })
	field?: "title" | "text";
	@Field()
	message: string;
}

@ObjectType()
export class PostResponse {
	@Field(() => PostFieldError, { nullable: true })
	errors?: PostFieldError[];

	@Field(() => Post, { nullable: true })
	post?: Post;
}

@ObjectType()
export class UserFieldError {
	@Field(() => String, { nullable: true })
	field?: "username" | "password" | "email";
	@Field()
	message: string;
}

@ObjectType()
export class UserResponse {
	@Field(() => [UserFieldError], { nullable: true })
	errors?: UserFieldError[];

	@Field(() => User, { nullable: true })
	user?: User;
}

@ObjectType()
export class BoolWithMessageResponse {
	@Field(() => Boolean)
	success: boolean;

	@Field(() => String)
	message: string;
}

@ObjectType()
export class ChangePasswordResponse extends BoolWithMessageResponse {
	@Field(() => String, { nullable: true })
	field?: string;
}