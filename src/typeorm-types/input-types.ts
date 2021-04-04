import { InputType, Field } from "type-graphql";

@InputType()
export class PostInput {
	@Field()
	title: string;

	@Field()
	text: string;
}

@InputType()
export class UsernamePasswordInput {
	@Field()
	username!: string;

	@Field()
	password!: string;
}

@InputType()
export class RegisterInput extends UsernamePasswordInput {
	@Field()
	email!: string;
}