import DataLoader from "dataloader";
import { User } from "../entities/User";

export const createUserLoader = () =>
	new DataLoader<number, User>(async (uids) => {
		const users = await User.findByIds(uids as number[]);
		const userIdToUser: Record<number, User> = {};
		users.forEach((u) => {
			userIdToUser[u.id] = u;
		});

		return uids.map((uid) => userIdToUser[uid]);
	});
