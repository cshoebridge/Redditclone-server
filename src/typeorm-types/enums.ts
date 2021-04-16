import { registerEnumType } from "type-graphql";

export enum UpdootDirection {
	UP=1,
	DOWN=-1,
}

registerEnumType(UpdootDirection, {
	name: "UpdootDirection",
	description: "UP or DOWN",
});
