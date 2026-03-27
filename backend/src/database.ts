import { error } from "node:console";
import { Prisma } from "../generated/prisma/client";
import { prisma } from "./lib/prisma";
import type {
  Course,
  Department,
  FileItem,
  RegisterUserInput,
  LoginUserInput,
  CreateAnnotationInput,
  CreateFileInput,
  FileAccess
} from "./types";
import department from "./routes/department";
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

  // Get user by id (string because better auth)
  async getUserById(id: string) {
    const user =  await prisma.user.findUnique({
      where: {
        id: id,
      },
    })
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
        include: {
          owner: {
            select: { name: true, displayName: true }
          }
        }
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
        include: {
          _count: {
            select: {
              files: true,
            },
          },
        },
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

  async deleteCourse(id: number) {
    return prisma.course.delete({ where: { id } });
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

  async deleteDepartment(id: number) {
    return prisma.department.delete({ where: { id } });
  },

  // -------------------------
  // Annotations
  // -------------------------
  // get single annotation by id
  async getAnnotationById(id: number) {
    const annotation =  await prisma.annotation.findUnique({
      where: {
        id: id,
      },
      include: {
        author: {
          select: {
            displayName: true,
            email: true,
          },
        }
      }
    })
    return annotation;
  },

  // Get all annotations of a file
  async getFileAnnotations(fileId: number) {
    const where: Prisma.AnnotationWhereInput = {
      fileId: fileId,
    };
    const annotations = prisma.annotation.findMany({
      where,
      orderBy: { id: "asc" },
      include: {
        author: {
          select: { name: true, displayName: true }
        }
      }
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
          },
          include: {
            author: {
              select: { name: true, displayName: true }
            }
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

  async get_all_file_access(){
    return prisma.fileAccess.findMany()
  },

  async getFileAccessForUser(fileId: number, userId: string) {
    return prisma.fileAccess.findUnique({
      where: { fileId_userId: { fileId, userId } },
    });
  },

  async getFileAccessByFile(fileId: number) {
    return prisma.fileAccess.findMany({
      where: { fileId },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
  },

  async deleteFileAccess(fileId: number, userId: string) {
    return prisma.fileAccess.delete({
      where: { fileId_userId: { fileId, userId } },
    });
  },

  async create_or_update_file_access(file_access: FileAccess){
    const all_file_access = await db.get_all_file_access()
    let exist = false
    for (let i = 0; i < all_file_access.length; i++){
      if (all_file_access[i].fileId === file_access.fileId && all_file_access[i].userId === file_access.userId){
        exist = true
        break
      }
    }
    if (exist){
      return prisma.fileAccess.update({
        where: {
          fileId_userId: {
            fileId: file_access.fileId,
            userId: file_access.userId
          }
        },
        data: {
          accessLevel: file_access.accessLevel
        }
      });
    }
    else{
      return prisma.fileAccess.create(
          {
            data: {
              fileId: file_access.fileId,
              userId: file_access.userId,
              accessLevel: file_access.accessLevel
            }
          }
      )
    }

  }


};
