import { z } from "zod";

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, "At least 3 characters")
    .max(50, "At most 50 characters")
    .regex(/^[A-Za-z0-9_]+$/, "Letters, numbers and _ only"),
  email: z.email("Enter a valid email"),
  password: z
    .string()
    .min(6, "At least 6 characters")
    .max(72, "At most 72 characters"),
});

export type RegisterForm = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export type LoginForm = z.infer<typeof loginSchema>;
