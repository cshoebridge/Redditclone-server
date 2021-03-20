import { User } from "../entities/User";
import { MyContext } from "src/types";
import {
	Arg,
	Ctx,
	Field,
	InputType,
	Mutation,
	ObjectType,
	Query,
	Resolver,
} from "type-graphql";
import argon2 from "argon2";

@InputType()
class UsernamePasswordInput {
	@Field()
	username!: string;

	@Field()
	password!: string;
}

@ObjectType()
class FieldError {
	@Field(() => String, { nullable: true })
	field?: "username" | "password";
	@Field()
	message: string;
}

@ObjectType()
class UserResponse {
	@Field(() => [FieldError], { nullable: true })
	errors?: FieldError[];

	@Field(() => User, { nullable: true })
	user?: User;
}

@Resolver()
export class UserResolver {
	@Query(() => UserResponse)
	async me(@Ctx() { req, em }: MyContext): Promise<UserResponse> {
		if (!req.session.userId) {
			return {
				errors: [{ message: "no user logged in" }],
			};
		}

		const user = await em.findOne(User, req.session.userId);
		return user
			? { user: user }
			: { errors: [{ message: "error fetching user" }] };
	}

	@Mutation(() => UserResponse)
	async register(
		@Arg("options") options: UsernamePasswordInput,
		@Ctx() { em, req }: MyContext
	): Promise<UserResponse> {
		if (options.username.length <= 2) {
			return {
				errors: [{ field: "username", message: "username too short" }],
			};
		}
		if (options.password.length <= 3) {
			return {
				errors: [{ field: "password", message: "password too weak" }],
			};
		}

		try {
			const hashedPassword = await argon2.hash(options.password);
			const user = em.create(User, {
				username: options.username,
				password: hashedPassword,
			});

			await em.persistAndFlush(user);

			req.session.userId = user.id; //set cookie

			return {
				user: user,
			};
		} catch (err) {
			// user already registered
			if (err.code === "23505" || err.detail.includes("already exists")) {
				return {
					errors: [
						{
							field: "username",
							message: "user with this username already exists",
						},
					],
				};
			}
			return {
				errors: [{ field: "username", message: "unable to register" }],
			};
		}
	}

	@Mutation(() => UserResponse)
	async login(
		@Arg("options") options: UsernamePasswordInput,
		@Ctx() { em, req }: MyContext
	): Promise<UserResponse> {
		const requestedUser = await em.findOne(User, {
			username: options.username,
		});
		if (!requestedUser?.id) {
			return {
				errors: [{ field: "username", message: "error logging in" }],
			};
		}
		const passwordIsValid = await argon2.verify(
			requestedUser.password,
			options.password
		);
		if (!passwordIsValid) {
			return {
				errors: [{ field: "username", message: "error logging in" }],
			};
		}

		req.session.userId = requestedUser.id;

		return {
			user: requestedUser,
		};
	}
}
