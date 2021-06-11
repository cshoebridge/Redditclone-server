import DataLoader from "dataloader";
import { Response } from "express";
import { Session } from "express-session";
import { Redis } from "ioredis";
import Mail from "nodemailer/lib/mailer";
import { Updoot } from "./entities/Updoot";
import { User } from "./entities/User";

export type MyContext = {
	req: any & { session: Session };
	res: Response;
	mailer: Mail
	redisClient: Redis
	userLoader: DataLoader<number, User>
	updootLoader: DataLoader<{postId: number, authorId: number}, Updoot | null>
};
