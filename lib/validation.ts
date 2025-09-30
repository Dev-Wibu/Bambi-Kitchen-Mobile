import { z } from "zod";

// Login validation schema
export const loginFormSchema = z.object({
  mail: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Register validation schema
export const registerFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name must be at most 50 characters"),
    mail: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Type definitions for the validated forms
export type LoginFormSchemaType = z.infer<typeof loginFormSchema>;
export type RegisterFormSchemaType = z.infer<typeof registerFormSchema>;
