import { RegisterInput } from "src/typeorm-types/input-types";
import { UserFieldError } from "src/typeorm-types/object-types";

export const validateRegister = ({email, username, password}: RegisterInput): UserFieldError[] => {
    const errors: UserFieldError[] = [];
    if (!email || !email.includes("@")) {
        errors.push({ field: "email", message: "invalid email" })
    }
    if (username.length <= 2) {
        errors.push({ field: "username", message: "username too short" })
    }
    if (username.includes("@")) {
        errors.push({field: "username", message: "cannot include '@'"})
    }
    if (password.length <= 3) {
        errors.push({ field: "password", message: "password too weak" })
    }
    return errors;
}