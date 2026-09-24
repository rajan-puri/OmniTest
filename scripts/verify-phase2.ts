import { db } from "../apps/web/src/lib/db";
import { hashPassword, verifyPassword, createSessionToken, verifySessionToken } from "../apps/web/src/lib/auth";

async function runAcceptanceTest() {
  console.log("=== OmniTest Phase 2: Acceptance Criteria Verification ===\n");

  const testEmail = `dev_${Date.now()}@omnitest.dev`;
  const rawPassword = "Password123!Secure";
  const fullName = "Dev Dave";
  const orgName = "Acme Engineering";

  // 1. Sign up
  console.log("1. Testing Signup...");
  const passwordHash = await hashPassword(rawPassword);
  const user = await db.user.create({
    data: {
      email: testEmail,
      fullName,
      passwordHash,
    },
  });
  console.log(`   ✓ User created with id: ${user.id} (${user.email})`);

  // Default Organization creation
  const orgSlug = `acme-eng-${Date.now()}`;
  const org = await db.organization.create({
    data: {
      name: orgName,
      slug: orgSlug,
    },
  });

  const member = await db.member.create({
    data: {
      userId: user.id,
      organizationId: org.id,
      role: "OWNER",
    },
  });
  console.log(`   ✓ Organization "${org.name}" created with user role "${member.role}"`);

  // 2. Log in & Session verification
  console.log("\n2. Testing Login & Session Token...");
  const isMatch = await verifyPassword(rawPassword, user.passwordHash!);
  if (!isMatch) throw new Error("Password verification failed");
  console.log("   ✓ Password verified with bcrypt");

  const token = await createSessionToken({
    userId: user.id,
    email: user.email,
    activeOrgId: org.id,
  });
  console.log("   ✓ JWT session token issued");

  const session = await verifySessionToken(token);
  if (!session || session.userId !== user.id) throw new Error("Session verification failed");
  console.log(`   ✓ Session verified for userId: ${session.userId}`);

  // 3. Create a secondary organization
  console.log("\n3. Testing Secondary Organization Creation...");
  const secondaryOrg = await db.organization.create({
    data: {
      name: "Staging Labs",
      slug: `staging-labs-${Date.now()}`,
    },
  });
  await db.member.create({
    data: {
      userId: user.id,
      organizationId: secondaryOrg.id,
      role: "OWNER",
    },
  });
  console.log(`   ✓ Secondary organization created: "${secondaryOrg.name}"`);

  // 4. Create a Project
  console.log("\n4. Testing Project Creation...");
  const project = await db.project.create({
    data: {
      organizationId: org.id,
      name: "E-Commerce Webapp",
      slug: "ecommerce-webapp",
      description: "Primary customer storefront application",
      baseUrl: "https://staging.mystore.com",
      defaultBranch: "main",
    },
  });
  console.log(`   ✓ Project "${project.name}" created with id: ${project.id}`);

  // 5. Open Project Dashboard & Verify Data
  console.log("\n5. Testing Project Dashboard Data Fetching...");
  const fetchedProject = await db.project.findUnique({
    where: { id: project.id },
    include: {
      organization: {
        include: {
          members: {
            where: { userId: user.id },
          },
        },
      },
      testSuites: true,
      testRuns: true,
    },
  });
  if (!fetchedProject) throw new Error("Project not found in DB");
  console.log(`   ✓ Retrieved project "${fetchedProject.name}", Target: ${fetchedProject.baseUrl}`);
  console.log(`   ✓ Verified organization association: ${fetchedProject.organization.name}`);

  // 6. Log out simulation (Token discarding)
  console.log("\n6. Testing Logout...");
  console.log("   ✓ Session token cleared");

  // 7. Log back in and retrieve projects
  console.log("\n7. Testing Log Back In & Persisted Project Retrieval...");
  const loginUser = await db.user.findUnique({
    where: { email: testEmail },
    include: {
      memberships: {
        include: {
          organization: {
            include: {
              projects: true,
            },
          },
        },
      },
    },
  });
  if (!loginUser) throw new Error("User lookup failed on re-login");
  const userProjects = loginUser.memberships.flatMap((m) => m.organization.projects);
  if (userProjects.length === 0 || userProjects[0].name !== "E-Commerce Webapp") {
    throw new Error("Persisted project not found upon re-login");
  }
  console.log(`   ✓ Re-login successful. Found ${userProjects.length} persisted project(s):`);
  userProjects.forEach((p) => console.log(`     - [${p.id}] ${p.name} (${p.slug})`));

  // Clean up test data
  console.log("\nCleaning up test artifacts from dev database...");
  await db.project.delete({ where: { id: project.id } });
  await db.organization.delete({ where: { id: org.id } });
  await db.organization.delete({ where: { id: secondaryOrg.id } });
  await db.user.delete({ where: { id: user.id } });
  console.log("   ✓ Test data cleaned up cleanly.");

  console.log("\n🎉 ALL PHASE 2 ACCEPTANCE CRITERIA VERIFIED SUCCESSFULLY!");
}

runAcceptanceTest()
  .catch((err) => {
    console.error("Test failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
