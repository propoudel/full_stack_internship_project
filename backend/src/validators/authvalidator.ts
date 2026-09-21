import {z} from "zod";

// creating schema for /auth/register

export const registerSchema = z.object({
name:z.string().min(3, "Name must be at least 3 characters long"),
email:z.email("Invalid email address"),
phone:z.string().min(10, "Phone number must be at least 10 characters long").max(15, "Phone number must be at most 15 characters long"),
password:z.string().min(6, "Password must be at least 6 characters long").max(100, "Password must be at most 100 characters long"),
});


// Schema for login

export const loginSchema = z.object({
    email:z.email("Invalid email address"),
    password:z.string().min(6, "Password must be at least 6 characters long").max(100, "Password must be at most 100 characters long"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;