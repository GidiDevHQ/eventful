import bcrypt from "bcrypt";
import { prisma } from "@/config/prisma";
import { AppError } from "@/utils/AppError";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../utils/jwt";
import { LoginInput, SignupInput } from "./authSchema";

const SALT_ROUND = 12;

// Centralize token creation so signup/login/refresh all return the same payload shape.
function buildTokens(user: { id: string; role: "CREATOR" | "EVENTEE" }) {
    const payload = { sub: user.id, role: user.role };

    return {
        accessToken: signAccessToken(payload),
        refreshToken: signRefreshToken(payload),
    };

}

export async function signup(input: SignupInput) {
    // Prevent duplicate accounts before creating a new user record.
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) {
        throw new AppError("An account with this email already exists", 409);
    }

    // Hash the password before persistence to keep user credentials out of the database in plain text.
    const hashed = await bcrypt.hash(input.password, SALT_ROUND);

    const user = await prisma.user.create({
        data: {
            name: input.name,
            email: input.email,
            password: hashed,
            role: input.role,
        },
        // Only return the safe public fields; the password hash should never be exposed to clients.
        select: { id: true, name: true, email: true, role: true },
    });

    return { user, ...buildTokens(user) };
}

export async function login(input: LoginInput) {
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    if (!user) {
        throw new AppError("Invalid email or password", 401);
    }

    const isValid = await bcrypt.compare(input.password, user.password);
    if  (!isValid) {
        throw new AppError("Invalid email or password", 401)
    }

    const { password: _password, ...safeUser } = user;

    return { user: safeUser, ...buildTokens(user) }
}

export async function refresh(refreshToken: string) {
    let payload;
    try {
        payload = verifyRefreshToken(refreshToken);
    } catch {
        throw new AppError("Invalid or expired refresh token", 401);
    }

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) {
        throw new AppError("User no longer exists", 401)
    }

    return buildTokens(user)
}
