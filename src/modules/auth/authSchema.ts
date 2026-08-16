import { z } from "zod";

// The signup contract validates the user profile payload before we create a new account or hash credentials.
export const signupSchema = z.object({
    body: z.object({
        name: z.string().min(2).max(100),
        email: z.email(),
        password: z.string().min(8).max(72),
        role: z.enum(["CREATOR", "EVENTEE"]),
    }),
});

// Login expects the user's primary credentials so the app can verify the password and issue tokens.
export const loginSchema = z.object({
    body: z.object({
        email: z.email(),
        password: z.string().min(1),
    }),
});

// Refresh tokens are exchanged for a new access token without requiring the user to log in again.
export const refreshSchema = z.object({
    body: z.object({
        refreshToken: z.string().min(1),
    }),
});

export type SignupInput = z.infer<typeof signupSchema>["body"];
export type LoginInput = z.infer<typeof loginSchema>["body"];