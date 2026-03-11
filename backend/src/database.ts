import { error } from "node:console";
import { Prisma } from "../generated/prisma/client";
import { prisma } from "./lib/prisma";
import type {Course, Department, FileItem} from "./types";
import department from "./routes/department";

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

    const where: Prisma.UserWhereInput = {};
    
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

  //Create a new file
  async create_file(file: FileItem){
    return prisma.fileItem.create(
        {
          data:{
            courseId: file.courseId,
            ownerId: file.ownerId,
            title: file.title,
            fileUrl: file.fileUrl
          }
        }
    )
  },

  async delete_file(id: number){
    return prisma.fileItem.delete(
        {
          where: {
            id: id
          }
        }
    )
  },

  // Get All files under a single course
  async getCourseFiles(id: number) {
    const where: Prisma.FileItemWhereInput = {
      courseId: id,
    };

    const [files, total] = await prisma.$transaction([
      prisma.fileItem.findMany({
        where,
        orderBy: { id: "asc" },
      }),
      prisma.fileItem.count({
        where,
      }),
    ]);

    return { files, total };
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

  // -------------------------
  // Courses
  // -------------------------

  // Create Course

  // Get All courses under a single department
  async getDepartmentCourses(id: number) {
    const where: Prisma.CourseWhereInput = {
      departmentId: id,
    };

    const [courses, total] = await prisma.$transaction([
      prisma.course.findMany({
        where,
        orderBy: { id: "asc" },
      }),
      prisma.course.count({
        where,
      }),
    ]);

    return { courses, total };
  },

  // Get course by id
  async getCourseById(id: number) {

    const file =  await prisma.course.findUnique({
      where: {
        id: id,
      },
    })
    return file;
  },

  async createCourse(courseData: Course) {

    return prisma.course.create({
      data: {
        departmentId: courseData.departmentId,
        courseCode: courseData.courseCode,
        title: courseData.title
      }
    })
  },




// -------------------------
  // Department
  // -------------------------

  // Get all department
  async getAllDepartments() {

    const where: Prisma.DepartmentWhereInput = {};

    const [departments, total] = await prisma.$transaction([
      prisma.department.findMany({
        where,
        orderBy: { id: "asc" },
      }),
      prisma.department.count({
        where,
      }),
    ]);

    return { departments, total};
  },

  // Get department by id
  async getDepartmentById(id: number) {

    const file =  await prisma.department.findUnique({
      where: {
        id: id,
      },
    })
    return file;
  },

  async createDepartment(depatmentData: Department) {

    return prisma.department.create({
      data: {
        code: depatmentData.code,
        name: depatmentData.name
      }
    })
  }

};
