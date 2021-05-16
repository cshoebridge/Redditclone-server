import { Updoot } from "../entities/Updoot";
import { isAuth } from "../middleware/isAuth";
import { UpdootDirection } from "../typeorm-types/enums";
import { MyContext } from "src/types";
import { Arg, Ctx, Int, Mutation, UseMiddleware, Resolver } from "type-graphql";
import { Entity, getConnection } from "typeorm";
import { BoolWithMessageResponse } from "../typeorm-types/object-types";

@Entity()
@Resolver(Updoot)
export class UpdootResolver {
	@Mutation(() => BoolWithMessageResponse)
	@UseMiddleware(isAuth)
	async vote(
		@Arg("postId", () => Int) postId: number,
		@Arg("direction", () => UpdootDirection) direction: UpdootDirection,
		@Ctx() { req }: MyContext
	): Promise<BoolWithMessageResponse> {
		const { userId: authorId } = req.session;

		const updoot = await Updoot.findOne({
			where: { postId, authorId: authorId },
		});

		// user hasn't updooted yet
		if (!updoot) {
			await getConnection().transaction(async (tm) => {
				tm.query(
					`
					INSERT INTO updoot ("authorId", "postId", value)
					values(${authorId}, ${postId}, ${direction});
			
					UPDATE post
					SET points = points + ${direction}
					WHERE "id" = ${postId};
					`
				);
			});

			return {
				success: true,
				message: "user's first updoot on this post logged",
			};
		}
		// flip updoot direction
		else if (updoot.value !== direction) {
			await getConnection().transaction(async (tm) => {
				tm.query(
					`
					UPDATE updoot
					SET value = ${direction}
					WHERE "postId" = ${postId} and "authorId" = ${authorId};

					UPDATE post
					SET points = points + ${direction * 2}
					WHERE "id" = ${postId};
					`
				);
			});

			return {
				success: true,
				message: "user's updoot value changed",
			};
		} else {
			return {
				success: false,
				message:
					"this user is currently updooting in this direction already",
			};
		}
	}
}
