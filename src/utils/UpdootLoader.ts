import DataLoader from "dataloader";
import { Updoot } from "../entities/Updoot";

export const createUpdootLoader = () =>
	new DataLoader<{ postId: number; authorId: number }, Updoot | null>(
		async (keys) => {
			const updoots = await Updoot.findByIds(keys as any);
			const updootIdsToUpdoot: Record<string, Updoot> = {};
			updoots.forEach((updoot) => {
				updootIdsToUpdoot[`${updoot.authorId}|${updoot.postId}`] =
					updoot;
			});

			return keys.map(
				(key) => updootIdsToUpdoot[`${key.authorId}|${key.postId}`]
			);
		}
	);
