import { RegisterInput } from "src/typeorm-types/input-types";
import { UserFieldError } from "src/typeorm-types/object-types";

export const validateRegister = (options: RegisterInput): UserFieldError[] => {
    const errors: UserFieldError[] = [];
    if (!options.email || !options.email.includes("@")) {
        errors.push({ field: "email", message: "invalid email" })
    }
    if (options.username.length <= 2) {
        errors.push({ field: "username", message: "username too short" })
    }
    if (options.username.includes("@")) {
        errors.push({field: "username", message: "cannot include '@'"})
    }
    if (options.password.length <= 3) {
        errors.push({ field: "password", message: "password too weak" })
    }
    return errors;
}