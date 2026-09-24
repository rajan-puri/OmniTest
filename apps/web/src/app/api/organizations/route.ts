import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const organizations = await db.organization.findMany({
    where: {
      members: {
        some: {
          userId: user.id,
        },
      },
    },
    include: {
      members: {
        where: { userId: user.id },
        select: { role: true },
      },
      _count: {
        select: {
          projects: true,
          members: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    organizations: organizations.map((org) => ({
      id: org.id,
      name: org.name,
      slug: org.slug,
      logoUrl: org.logoUrl,
      role: org.members[0]?.role || "MEMBER",
      projectCount: org._count.projects,
      memberCount: org._count.members,
      createdAt: org.createdAt,
    })),
  });
}

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Organization name is required." }, { status: 400 });
    }

    const cleanName = name.trim();
    const baseSlug = cleanName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "org";
    const uniqueSuffix = Math.random().toString(36).substring(2, 6);
    const slug = `${baseSlug}-${uniqueSuffix}`;

    const organization = await db.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          name: cleanName,
          slug,
        },
      });

      await tx.member.create({
        data: {
          userId: user.id,
          organizationId: org.id,
          role: "OWNER",
        },
      });

      await tx.subscription.create({
        data: {
          organizationId: org.id,
          stripeCustomerId: `cus_trial_${uniqueSuffix}`,
          plan: "FREE",
          status: "ACTIVE",
          concurrencyLimit: 1,
          monthlyTestMinutesQuota: 300,
        },
      });

      return org;
    });

    return NextResponse.json(
      {
        organization: {
          id: organization.id,
          name: organization.name,
          slug: organization.slug,
          role: "OWNER",
          createdAt: organization.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create organization error:", error);
    return NextResponse.json(
      { error: "Failed to create organization." },
      { status: 500 }
    );
  }
}
