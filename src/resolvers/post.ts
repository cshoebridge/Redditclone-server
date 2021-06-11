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
import { Updoot } from "./../entities/Updoot";

@Resolver(Post)
export class PostResolver {
	@FieldResolver(() => String)
	textSnippet(@Root() root: Post) {
		return root.text.slice(0, Math.min(100, root.text.length)) + "...";
	}

	@Query(() => PostPagination)
	async posts(
		@Arg("limit", () => Int) limit: number,
		@Arg("cursor", () => String, { nullable: true }) cursor: string,
		@Ctx() { req }: MyContext
	): Promise<PostPagination> {
		const realLimit = Math.min(limit, 50);
		const realLimitPlusOne = realLimit + 1;
		const fetchedPosts = await getConnection().query(
			`
			SELECT p.*, 
			json_build_object(
				'id', u.id, 
				'username', u.username, 
				'email', u.email,
				'createdAt', u."createdAt",
				'updatedAt', u."updatedAt") 
			author,
			${
				req.session.userId
					? `(select value from updoot where "authorId" = ${req.session.userId} and "postId" = p.id) "voteStatus"`
					: 'null as "voteStatus"'
			} 
			FROM post p
			INNER JOIN public.user u ON u.id = p."authorId"
			${cursor ? `WHERE p."createdAt" < TO_TIMESTAMP(${cursor})` : ""}
			ORDER BY p."createdAt" DESC
			LIMIT ${realLimitPlusOne}
		`
		);

		const allFetched = fetchedPosts.length < realLimitPlusOne;

		return {
			posts: fetchedPosts.splice(0, realLimit),
			allFetched,
		};
	}

	@Query(() => Post, { nullable: true })
	async post(
		@Arg("id") id: number,
		@Ctx() { req }: MyContext
	): Promise<Post | undefined> {
		const post = await getConnection().query(
			`SELECT p.*,
			json_build_object(
				'id', u.id, 
				'username', u.username, 
				'email', u.email,
				'createdAt', u."createdAt",
				'updatedAt', u."updatedAt") 
			author,
			${
				req.session.userId
					? `(SELECT value FROM updoot WHERE "authorId" = ${req.session.userId} AND "postId" = p.id) "voteStatus"`
					: 'null as "voteStatus"'
			} 
			FROM post p
			INNER JOIN public.user u on u.id = p."authorId"
			WHERE p.id = ${id}
			`
		);
		return post[0];
		//return Post.findOne(id, { relations: ["author"] });
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

	@Mutation(() => PostResponse, { nullable: true })
	@UseMiddleware(isAuth)
	async updatePost(
		@Arg("id") id: number,
		@Arg("input") input: PostInput,
		@Ctx() { req }: MyContext
	): Promise<PostResponse> {
		const invalidFields = validatePost({
			text: input.text,
			title: input.title,
		});
		if (invalidFields.length != 0) {
			return { errors: invalidFields };
		}

		const result = await getConnection()
			.createQueryBuilder()
			.update(Post)
			.set({ title: input.title, text: input.text })
			.where('id = :id and "authorId" = :aid', {
				id: id,
				aid: req.session.userId,
			})
			.returning("*")
			.execute();

		return {
			post: result.raw[0],
		};
	}

	@Mutation(() => String)
	@UseMiddleware(isAuth)
	async deletePost(
		@Arg("id", () => Int) id: number,
		@Ctx() { req }: MyContext
	): Promise<string> {
		const postToDelete = await Post.findOne(id);
		if (postToDelete?.authorId !== req.session.userId) {
			return `fail: unauthorised to delete post id ${id}: not your post`;
		} else {
			try {
				await Updoot.delete({ postId: id });
				await Post.delete(id);
				return `success: successfully deleted post id ${id}`;
			} catch {
				return `fail: failed to delete post id ${id}`;
			}
		}
	}
}
