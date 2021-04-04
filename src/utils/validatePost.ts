import { PostInput } from "src/typeorm-types/input-types";
import { PostFieldError } from "src/typeorm-types/object-types";

export const validatePost = ({ title, text }: PostInput) => {
	const errors: PostFieldError[] = [];
	if (title.length < 3) {
		errors.push({
			field: "title",
			message: "Title must be at minimum 3 characters long",
		});
	}
	if (title.length > 50) {
		errors.push({
			field: "title",
			message: "Title must be a most 50 characters long",
		});
	}
	if (text.length < 20) {
		errors.push({
			field: "text",
			message: "Post must be at minimum 20 characters long",
		});
	}
	if (text.length > 200) {
		errors.push({
			field: "text",
			message: "Post must be at most 200 characters long",
		});
	}
    return errors;
};
