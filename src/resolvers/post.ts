import { Post } from "./../entities/Post";
import { Arg, Mutation, Query, Resolver } from "type-graphql";

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
	async createPost(@Arg("title") title: string): Promise<Post> {
		return Post.create({ title }).save();
	}

	@Mutation(() => Post, { nullable: true })
	async updatePost(
		@Arg("id") id: number,
		@Arg("title") title: string
	): Promise<Post | undefined> {
		await Post.update({id}, {title});
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
