import { error } from "node:console";
import { Prisma } from "../generated/prisma/client";
import { prisma } from "./lib/prisma";

// -------------------------
// Helper: Prisma "record not found" detection (provided)
// -------------------------
function isPrismaRecordNotFound(e: unknown): boolean {
  // Prisma throws a known request error with code "P2025" when an update/delete
  // targets a record that does not exist.
  return (
    typeof e === "object" &&
    e !== null &&
    "code" in e &&
    (e as { code?: string }).code === "P2025"
  );
}

export const db = {
  // -------------------------
  // Users
  // -------------------------

  // Create Users

  // Get all users
  async getAllUsers() {

    // TODO: build a Prisma.AuthorWhereInput object
    const where: Prisma.UserWhereInput = {};
    
    // TODO: transaction with findMany + count
    // const [authors, total] = await prisma.$transaction([]);
    const [users, total] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        orderBy: { id: "asc" },
      }),
      prisma.user.count({
        where,
      }),
    ]);

    return { users, total};
  },



  // -------------------------
  // Files
  // -------------------------

  // Create Users

  // Get All files
  async getAllFiles() {

    // TODO: build a Prisma.AuthorWhereInput object
    const where: Prisma.FileItemWhereInput = {};
    
    const [files, total] = await prisma.$transaction([
      prisma.fileItem.findMany({
        where,
        orderBy: { id: "asc" },
      }),
      prisma.fileItem.count({
        where,
      }),
    ]);

    return { files, total};
  },

  // Get file by id
  async getFileById(id: number) {
    // Hint: use await prisma.paper.findUnique()
    const file =  await prisma.fileItem.findUnique({
      where: {
        id: id,
      },
    })
    return file;
  },
};
