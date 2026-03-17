import { error } from "node:console";
import { Prisma } from "../generated/prisma/client";
import { prisma } from "./lib/prisma";
import type {Course, Department, FileItem, RegisterUserInput, LoginUserInput, CreateAnnotationInput, CreateFileInput} from "./types";
import department from "./routes/department";
import bcrypt from 'bcrypt';
import { create } from "node:domain";

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
  async createUser(user: RegisterUserInput) {
    const hashedPassword = await bcrypt.hash(user.password, 10);

    return prisma.user.create({
      data: {
        email: user.email,
        displayName: user.displayName,
        passwordHash: hashedPassword
      }
    })
  },

  // User Login
  async loginUser(input: LoginUserInput) {
    const user = await prisma.user.findUnique({
      where: { email: input.email }
    });

    if (!user) {
      throw new Error("Invalid email or password");
    }

    const passwordMatched = await bcrypt.compare(String(input.password), user.passwordHash);

    if (!passwordMatched) {
      throw new Error("Invalid email or password");
    }

    return user;
  },

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
  async create_file(file: CreateFileInput){
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
  },

  // -------------------------
  // Annotations
  // -------------------------

  async getFileAnnotations(fileId: number) {
    const where: Prisma.AnnotationWhereInput = {
      fileId: fileId,
    };
    const annotations = prisma.annotation.findMany({
      where,
      orderBy: { id: "asc" },
    })

    return annotations;
  },

  async createAnnotation(annotation: CreateAnnotationInput) {
    return prisma.annotation.create(
        {
          data:{
            fileId: annotation.fileId,
            authorId: annotation.authorId,
            parentId: annotation.parentId,
            anchorJson: annotation.anchorJson,
            body: annotation.body
          }
        }
    )
  },

  async deleteAnnotation(id: number){
    return prisma.annotation.delete(
        {
          where: {
            id: id
          }
        }
    )
  },


};
