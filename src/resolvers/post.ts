import { Post } from "./../entities/Post";
import {
	Arg,
	Ctx,
	FieldResolver,
	Int,
	Mutation,
	Query,
	Resolver,
	Root,
	UseMiddleware,
} from "type-graphql";
import { MyContext } from "src/types";
import { isAuth } from "../middleware/isAuth";
import { PostInput } from "../typeorm-types/input-types";
import { PostPagination, PostResponse } from "../typeorm-types/object-types";
import { validatePost } from "../utils/validatePost";
import { getConnection } from "typeorm";

@Resolver(Post)
export class PostResolver {
	@FieldResolver(() => String)
	textSnippet(@Root() root: Post) {
		return root.text.slice(0, Math.min(100, root.text.length)) + "...";
	}

	@Query(() => PostPagination)
	async posts(
		@Arg("limit", () => Int) limit: number,
		@Arg("cursor", () => String, { nullable: true }) cursor: string
	): Promise<PostPagination> {
		const realLimit = Math.min(limit, 50);
		const realLimitPlusOne = realLimit + 1;
		const queryBuilder = getConnection()
			.getRepository(Post)
			.createQueryBuilder("post")
			.orderBy('"createdAt"', "DESC")
			.take(realLimitPlusOne);
		if (cursor) {
			queryBuilder.where('"createdAt" < :cursor', {
				cursor: new Date(parseInt(cursor)),
			});
		}

		const fetchedPosts = await queryBuilder.getMany();
		const allFetched = (fetchedPosts.length < realLimitPlusOne);
		
		return {
			posts: fetchedPosts.splice(0, realLimit),
			allFetched,
		};
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
