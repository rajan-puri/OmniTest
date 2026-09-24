import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: { orgId: string } }
) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { orgId } = params;

  // Authorization check: User must be member of this organization
  const membership = await db.member.findUnique({
    where: {
      organizationId_userId: {
        organizationId: orgId,
        userId: user.id,
      },
    },
  });

  if (!membership) {
    return NextResponse.json({ error: "Organization not found or access denied." }, { status: 403 });
  }

  const projects = await db.project.findMany({
    where: { organizationId: orgId },
    include: {
      _count: {
        select: {
          testSuites: true,
          testRuns: true,
        },
      },
      testRuns: {
        take: 1,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          status: true,
          startedAt: true,
          durationMs: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({
    projects: projects.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      repositoryUrl: p.repositoryUrl,
      defaultBranch: p.defaultBranch,
      baseUrl: p.baseUrl,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      suiteCount: p._count.testSuites,
      runCount: p._count.testRuns,
      lastRun: p.testRuns[0] || null,
    })),
  });
}

export async function POST(
  request: Request,
  { params }: { params: { orgId: string } }
) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { orgId } = params;

  const membership = await db.member.findUnique({
    where: {
      organizationId_userId: {
        organizationId: orgId,
        userId: user.id,
      },
    },
  });

  if (!membership || (membership.role !== "OWNER" && membership.role !== "ADMIN")) {
    return NextResponse.json(
      { error: "Insufficient permissions. Admin or Owner role required to create projects." },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { name, description, repositoryUrl, baseUrl, defaultBranch } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Project name is required." }, { status: 400 });
    }

    const cleanName = name.trim();
    const baseSlug = cleanName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "project";
    
    // Check if slug already exists in this org
    let slug = baseSlug;
    const existing = await db.project.findUnique({
      where: {
        organizationId_slug: {
          organizationId: orgId,
          slug: baseSlug,
        },
      },
    });

    if (existing) {
      slug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;
    }

    const project = await db.project.create({
      data: {
        organizationId: orgId,
        name: cleanName,
        slug,
        description: description?.trim() || null,
        repositoryUrl: repositoryUrl?.trim() || null,
        baseUrl: baseUrl?.trim() || null,
        defaultBranch: defaultBranch?.trim() || "main",
      },
    });

    return NextResponse.json(
      {
        project: {
          id: project.id,
          name: project.name,
          slug: project.slug,
          description: project.description,
          repositoryUrl: project.repositoryUrl,
          defaultBranch: project.defaultBranch,
          baseUrl: project.baseUrl,
          createdAt: project.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create project error:", error);
    return NextResponse.json(
      { error: "Failed to create project." },
      { status: 500 }
    );
  }
}
