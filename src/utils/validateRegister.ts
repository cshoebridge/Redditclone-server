import { FieldError, RegisterInput } from "src/resolvers/user";

export const validateRegister = (options: RegisterInput): FieldError[] => {
    const errors: FieldError[] = [];
    if (!options.email || !options.email.includes("@")) {
        errors.push({ field: "email", message: "invalid email" })
    }
    if (options.username.length <= 2) {
        errors.push({ field: "username", message: "username too short" })
    }
    if (options.password.length <= 3) {
        errors.push({ field: "password", message: "password too weak" })
    }
    return errors;
}