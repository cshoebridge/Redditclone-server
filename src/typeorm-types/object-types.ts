import { Post } from "../entities/Post";
import { User } from "../entities/User";
import { ObjectType, Field } from "type-graphql";

@ObjectType()
export class FieldError {
	@Field()
	message: string;
}
@ObjectType()
export class PostFieldError extends FieldError {
	@Field(() => String)
	field: "title" | "text";

}

@ObjectType()
export class PostResponse {
	@Field(() => [PostFieldError], { nullable: true })
	errors?: PostFieldError[];

	@Field(() => Post, { nullable: true })
	post?: Post;
}

@ObjectType()
export class UserFieldError extends FieldError {
	@Field(() => String, { nullable: true })
	field?: "username" | "password" | "email";

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