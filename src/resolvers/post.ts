import { Post } from "./../entities/Post";
import {
	Arg,
	Ctx,
	Mutation,
	Query,
	Resolver,
	UseMiddleware,
} from "type-graphql";
import { MyContext } from "src/types";
import { isAuth } from "../middleware/isAuth";
import { PostInput } from "../typeorm-types/input-types";
import { PostResponse } from "../typeorm-types/object-types";



@Resolver()
export class PostResolver {
	@Query(() => [Post])
	posts(): Promise<Post[]> {
		return Post.find();
	}

	@Query(() => Post, { nullable: true })
	post(@Arg("id") id: number): Promise<Post | undefined> {
		return Post.findOne(id);
	}

	@Mutation(() => Post)
	@UseMiddleware(isAuth)
	async createPost(
		@Arg("input") { title, text }: PostInput,
		@Ctx() { req }: MyContext
	): Promise<PostResponse> {
		if (title.length <= 3) {
			return { errors: [{ field: "title", message: "Title too short" }] };
		}
		if (text.length <= 20) {
			return {
				errors: [
					{
						field: "text",
						message: "Post must be at minimum 20 characters long",
					},
				],
			};
		}
		if (text.length >= 200) {
			return {
				errors: [
					{
						field: "text",
						message: "Post must be at most 200 characters long",
					},
				],
			};
		}
		return {
			post: await Post.create({
				title,
				text,
				authorId: req.session.userId,
			}).save(),
		};
	}

	@Mutation(() => Post, { nullable: true })
	async updatePost(
		@Arg("id") id: number,
		@Arg("input") input: PostInput
	): Promise<Post | undefined> {
		await Post.update({ id }, { title: input.title, text: input.text });
		return await Post.findOne(id);
	}

	@Mutation(() => String)
	async deletePost(@Arg("id") id: number): Promise<string> {
		try {
			await Post.delete(id);
			return `successfully deleted post id ${id}`;
		} catch {
			return `failed to delete post id ${id}`;
		}
	}
}
