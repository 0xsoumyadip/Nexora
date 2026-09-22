import { z } from "zod";

export const userSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be atleast 2 characteres")
    .max(20, "Name must be within 20 characters"),

  email: z.string().trim().email("Please enter a valid email"),
  userName: z
    .string()
    .trim()
    .min(2, "Username must be atleast 2 characters")
    .max(20, "Username must be within 20 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores",
    ),

  password: z
    .string()
    .min(6, "Password must be atleast 6 characters."),
  image: z.string().optional(),
});

export const documentSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Document name is required.")
    .max(10, "Document name must be with in 10 characters"),

  authorId: z.string().uuid("Invalid id."),

  lastEditedById: z.string().uuid("Invalid id.").optional(),
});
