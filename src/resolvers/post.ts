import { Post } from "./../entities/Post";
import { MyContext } from "./../types";
import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";

@Resolver()
export class PostResolver {
	@Query(() => [Post])
	posts(@Ctx() { em }: MyContext): Promise<Post[]> {
		return em.find(Post, {});
	}

	@Query(() => Post, { nullable: true })
	post(
		@Arg("id") id: number,
		@Ctx() { em }: MyContext
	): Promise<Post | null> {
		return em.findOne(Post, id);
	}

	@Mutation(() => Post)
	async createPost(
		@Arg("title") title: string,
		@Ctx() { em }: MyContext
	): Promise<Post> {
		const post = em.create(Post, { title });
		await em.persistAndFlush(post);
		return post;
	}

	@Mutation(() => Post, { nullable: true })
	async updatePost(
		@Arg("id") id: number,
		@Arg("title") title: string,
		@Ctx() { em }: MyContext
	): Promise<Post | null> {
		const post = await em.findOne(Post, id);
		if (!post) {
			return null;
		}
		if (title) {
			post.title = title;
			await em.persistAndFlush(post);
		}
		return post;
	}

	@Mutation(() => String)
	async deletePost(
		@Arg("id") id: number,
		@Ctx() { em }: MyContext
	): Promise<string> {
		try {
			await em.nativeDelete(Post, { id });
			return `successfully deleted post id ${id}`;
		} catch {
			return `failed to delete post id ${id}`;
		}
	}
}
