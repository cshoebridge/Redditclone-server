import { Response } from "express";
import { Session } from "express-session";
import { Redis } from "ioredis";
import Mail from "nodemailer/lib/mailer";

export type MyContext = {
	req: any & { session: Session };
	res: Response;
	mailer: Mail
	redisClient: Redis
};
