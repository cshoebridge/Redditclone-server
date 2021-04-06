import { Post } from "./../entities/Post";
import {
	Arg,
	Ctx,
	Int,
	Mutation,
	Query,
	Resolver,
	UseMiddleware,
} from "type-graphql";
import { MyContext } from "src/types";
import { isAuth } from "../middleware/isAuth";
import { PostInput } from "../typeorm-types/input-types";
import { PostResponse } from "../typeorm-types/object-types";
import { validatePost } from "../utils/validatePost";
import { getConnection } from "typeorm";

@Resolver()
export class PostResolver {
	@Query(() => [Post])
	posts(
		@Arg("limit", () => Int) limit: number,
		@Arg("cursor", () => String, { nullable: true }) cursor: string
	): Promise<Post[]> {
		const realLimit = Math.min(limit, 50);
		const queryBuilder = getConnection()
			.getRepository(Post)
			.createQueryBuilder("post")
			.orderBy('"createdAt"', "DESC")
			.take(realLimit)
		if (cursor) {
			queryBuilder.where('"createdAt" < :cursor', { cursor: new Date(parseInt(cursor)) })

		}

		return queryBuilder.getMany();
	}

	@Query(() => Post, { nullable: true })
	post(@Arg("id") id: number): Promise<Post | undefined> {
		return Post.findOne(id);
	}

	@Mutation(() => PostResponse)
	@UseMiddleware(isAuth)
	async createPost(
		@Arg("input") { title, text }: PostInput,
		@Ctx() { req }: MyContext
	): Promise<PostResponse> {
		const invalidFields = validatePost({ title, text });
		if (invalidFields.length != 0) {
			return {
				errors: invalidFields,
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
