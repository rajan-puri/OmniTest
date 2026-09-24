import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = params;

  const project = await db.project.findUnique({
    where: { id: projectId },
    include: {
      organization: {
        include: {
          members: {
            where: { userId: user.id },
            select: { role: true },
          },
        },
      },
      testSuites: {
        include: {
          _count: {
            select: { tests: true },
          },
        },
      },
      testRuns: {
        take: 10,
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!project || project.organization.members.length === 0) {
    return NextResponse.json({ error: "Project not found or access denied." }, { status: 404 });
  }

  const userRole = project.organization.members[0].role;

  return NextResponse.json({
    project: {
      id: project.id,
      organizationId: project.organizationId,
      organizationName: project.organization.name,
      name: project.name,
      slug: project.slug,
      description: project.description,
      repositoryUrl: project.repositoryUrl,
      defaultBranch: project.defaultBranch,
      baseUrl: project.baseUrl,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      userRole,
      testSuites: project.testSuites.map((s) => ({
        id: s.id,
        name: s.name,
        description: s.description,
        testCount: s._count.tests,
      })),
      recentRuns: project.testRuns,
    },
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = params;

  const project = await db.project.findUnique({
    where: { id: projectId },
    include: {
      organization: {
        include: {
          members: {
            where: { userId: user.id },
            select: { role: true },
          },
        },
      },
    },
  });

  if (!project || project.organization.members.length === 0) {
    return NextResponse.json({ error: "Project not found or access denied." }, { status: 404 });
  }

  const userRole = project.organization.members[0].role;
  if (userRole !== "OWNER" && userRole !== "ADMIN") {
    return NextResponse.json(
      { error: "Insufficient permissions. Admin or Owner role required to edit project." },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { name, description, repositoryUrl, baseUrl, defaultBranch } = body;

    const updated = await db.project.update({
      where: { id: projectId },
      data: {
        ...(name && { name: name.trim() }),
        ...(description !== undefined && { description: description ? description.trim() : null }),
        ...(repositoryUrl !== undefined && { repositoryUrl: repositoryUrl ? repositoryUrl.trim() : null }),
        ...(baseUrl !== undefined && { baseUrl: baseUrl ? baseUrl.trim() : null }),
        ...(defaultBranch && { defaultBranch: defaultBranch.trim() }),
      },
    });

    return NextResponse.json({ project: updated });
  } catch (error) {
    console.error("Update project error:", error);
    return NextResponse.json({ error: "Failed to update project." }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = params;

  const project = await db.project.findUnique({
    where: { id: projectId },
    include: {
      organization: {
        include: {
          members: {
            where: { userId: user.id },
            select: { role: true },
          },
        },
      },
    },
  });

  if (!project || project.organization.members.length === 0) {
    return NextResponse.json({ error: "Project not found or access denied." }, { status: 404 });
  }

  const userRole = project.organization.members[0].role;
  if (userRole !== "OWNER" && userRole !== "ADMIN") {
    return NextResponse.json(
      { error: "Insufficient permissions. Admin or Owner role required to delete project." },
      { status: 403 }
    );
  }

  try {
    await db.project.delete({
      where: { id: projectId },
    });

    return NextResponse.json({ success: true, message: "Project deleted successfully" });
  } catch (error) {
    console.error("Delete project error:", error);
    return NextResponse.json({ error: "Failed to delete project." }, { status: 500 });
  }
}
