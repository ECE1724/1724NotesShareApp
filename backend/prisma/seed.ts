// prisma/seed.ts
import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { AccessLevel } from "../generated/prisma/enums"
const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const ece = await prisma.department.upsert({
    where: { code: "ECE" },
    update: {},
    create: {
      code: "ECE",
      name: "Electrical & Computer Engineering",
    },
  });

  const ece1762 = await prisma.course.create({
    data: {
      departmentId: ece.id,
      courseCode: "ECE1762",
      title: "Software Design",
    },
  });

  const alice = await prisma.user.create({
    data: {
      email: "alice@example.com",
      displayName: "Alice",
      passwordHash: "password",
      isAdmin: true,
    },
  });

  const file = await prisma.fileItem.create({
    data: {
      courseId: ece1762.id,
      ownerId: alice.id,
      title: "ece1762note1",
      fileUrl: "Binary%20Search%20Trees.pdf",
    },
  });

  await prisma.fileAccess.create({
    data: {
      fileId: file.id,
      userId: alice.id,
      accessLevel: AccessLevel.OWNER,
    },
  });


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