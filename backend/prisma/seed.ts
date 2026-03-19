import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { AccessLevel } from "../generated/prisma/enums";
import { auth } from "../src/lib/auth";

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const ADMIN_EMAIL = "admin@noteshare.com";
const ADMIN_PASSWORD = "admin123";
const ADMIN_NAME = "Admin";

async function main() {
  // --- Departments ---
  const ece = await prisma.department.upsert({
    where: { code: "ECE" },
    update: {},
    create: {
      code: "ECE",
      name: "Electrical & Computer Engineering",
    },
  });

  // --- Courses ---
  const ece1762 = await prisma.course.upsert({
    where: { courseCode: "ECE1762" },
    update: {},
    create: {
      departmentId: ece.id,
      courseCode: "ECE1762",
      title: "Software Design",
    },
  });

  // --- Admin user via BetterAuth (has a real password) ---
  let adminUser = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
  if (!adminUser) {
    const ctx = await auth.api.signUpEmail({
      body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD, name: ADMIN_NAME },
    });
    adminUser = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
  }
  if (adminUser && !adminUser.isAdmin) {
    await prisma.user.update({
      where: { id: adminUser.id },
      data: { isAdmin: true, displayName: ADMIN_NAME },
    });
  }

  // --- Seed file ---
  if (adminUser) {
    const files = await prisma.fileItem.findMany({
      where: { courseId: ece1762.id, title: "ece1762note1" },
      take: 1,
    });
    let file = files[0] ?? null;

    if (!file) {
      file = await prisma.fileItem.create({
        data: {
          courseId: ece1762.id,
          ownerId: adminUser.id,
          title: "ece1762note1",
          fileUrl: "Binary%20Search%20Trees.pdf",
        },
      });
    }

    await prisma.fileAccess.createMany({
      data: [{ fileId: file.id, userId: adminUser.id, accessLevel: AccessLevel.OWNER }],
      skipDuplicates: true,
    });
  }

  console.log("Seed complete.");
  console.log(`Admin account: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });