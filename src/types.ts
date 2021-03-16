import { EntityManager, IDatabaseDriver, Connection } from "@mikro-orm/core";
import { Session } from "express-session";

export type MyContext = {
	em: EntityManager<any> & EntityManager<IDatabaseDriver<Connection>>;
	req: any & { session: Session };
	res: any;
};
