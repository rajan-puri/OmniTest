import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { db } from "./db";

const JWT_SECRET = process.env.JWT_SECRET || "dev-omnitest-jwt-secret-key-32-chars-long";
const secretKey = new TextEncoder().encode(JWT_SECRET);
export const SESSION_COOKIE_NAME = "omnitest_session";

export interface SessionPayload {
  userId: string;
  email: string;
  activeOrgId?: string;
  exp?: number;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey);
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function getCurrentSession(): Promise<SessionPayload | null> {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
  if (!sessionCookie?.value) return null;
  return verifySessionToken(sessionCookie.value);
}

export async function getAuthenticatedUser() {
  const session = await getCurrentSession();
  if (!session?.userId) return null;

  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      fullName: true,
      avatarUrl: true,
      createdAt: true,
      memberships: {
        include: {
          organization: true,
        },
      },
    },
  });

  if (!user) return null;

  // Active organization resolution
  const activeOrg =
    user.memberships.find((m) => m.organizationId === session.activeOrgId)?.organization ||
    user.memberships[0]?.organization ||
    null;

  const currentRole =
    user.memberships.find((m) => m.organizationId === activeOrg?.id)?.role || "MEMBER";

  return {
    ...user,
    activeOrg,
    role: currentRole,
  };
}
