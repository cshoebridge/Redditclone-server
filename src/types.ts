import { EntityManager, IDatabaseDriver, Connection } from "@mikro-orm/core";
import { Response } from "express";
import { Session } from "express-session";
import Mail from "nodemailer/lib/mailer";

export type MyContext = {
	em: EntityManager<any> & EntityManager<IDatabaseDriver<Connection>>;
	req: any & { session: Session };
	res: Response;
	mailer: Mail
};
