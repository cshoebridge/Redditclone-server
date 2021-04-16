import { Updoot } from "../entities/Updoot";
import { isAuth } from "../middleware/isAuth";
import { UpdootDirection } from "../typeorm-types/enums";
import { MyContext } from "src/types";
import { Arg, Ctx, Int, Mutation, UseMiddleware, Resolver } from "type-graphql";
import { Entity, getConnection } from "typeorm";

@Entity()
@Resolver(Updoot)
export class UpdootResolver {
	@Mutation(() => Boolean)
	@UseMiddleware(isAuth)
	async vote(
		@Arg("postId", () => Int) postId: number,
		@Arg("direction", () => UpdootDirection) direction: UpdootDirection,
		@Ctx() { req }: MyContext
	): Promise<boolean> {
		const { userId } = req.session;
		await Updoot.insert({
			authorId: userId,
			postId,
			value: direction,
		});
		await getConnection().query(
			`
        UPDATE post
        SET points = points + $1
        WHERE id = $2
        `,
			[direction, postId]
		);
		return true;
	}
}
