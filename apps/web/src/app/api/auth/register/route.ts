import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { hashPassword, createSessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, fullName, organizationName } = body;

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: "Email, password, and full name are required." },
        { status: 400 }
      );
    }

    if (typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const orgName = (organizationName && organizationName.trim()) || `${fullName.trim()}'s Workspace`;
    
    // Generate clean slug from org name
    const baseSlug = orgName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "workspace";
    const uniqueSuffix = Math.random().toString(36).substring(2, 6);
    const orgSlug = `${baseSlug}-${uniqueSuffix}`;

    // Execute atomic user & org creation transaction
    const result = await db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: normalizedEmail,
          passwordHash,
          fullName: fullName.trim(),
        },
      });

      const organization = await tx.organization.create({
        data: {
          name: orgName,
          slug: orgSlug,
        },
      });

      await tx.member.create({
        data: {
          userId: user.id,
          organizationId: organization.id,
          role: "OWNER",
        },
      });

      await tx.subscription.create({
        data: {
          organizationId: organization.id,
          stripeCustomerId: `cus_trial_${uniqueSuffix}`,
          plan: "FREE",
          status: "ACTIVE",
          concurrencyLimit: 1,
          monthlyTestMinutesQuota: 300,
        },
      });

      return { user, organization };
    });

    // Create session token & set HTTP-only cookie
    const token = await createSessionToken({
      userId: result.user.id,
      email: result.user.email,
      activeOrgId: result.organization.id,
    });

    const cookieStore = cookies();
    cookieStore.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return NextResponse.json(
      {
        user: {
          id: result.user.id,
          email: result.user.email,
          fullName: result.user.fullName,
        },
        organization: {
          id: result.organization.id,
          name: result.organization.name,
          slug: result.organization.slug,
          role: "OWNER",
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error occurred during registration." },
      { status: 500 }
    );
  }
}
