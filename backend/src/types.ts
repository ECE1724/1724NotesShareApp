// Centralized custom types used across routes, middleware, and database layer.
import { Prisma } from "../generated/prisma/client";

export enum AccessLevel {
  OWNER = "OWNER",
  COLLABORATOR = "COLLABORATOR",
  VIEWER = "VIEWER",
}

export interface User {
  id: string;
  email: string;
  displayName: string | null;
  isAdmin: boolean;
}

export interface Department {
  id: number;
  code: string;
  name: string;
}

export interface Course {
  id: number;
  departmentId: number;
  courseCode: string;
  title: string;
}

export interface FileItem {
  id: number;
  courseId: number;
  ownerId: string;
  title: string;
  fileUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FileAccess {
  fileId: number;
  userId: string;
  accessLevel: AccessLevel;
}

export interface Annotation {
  id: number;
  fileId: number;
  authorId: string;
  parentId: number | null;
  anchorJson: Prisma.InputJsonValue;
  body: string;
  createdAt: Date;
  updatedAt: Date;
}

// Request types

export interface RegisterUserInput {
  email: string;
  displayName: string;
  password: string;
}

export interface LoginUserInput {
  email: string;
  password: string;
}

export interface CreateDepartmentInput {
  code: string;
  name: string;
}

export interface CreateCourseInput {
  departmentId: number;
  courseCode: string;
  title: string;
}

export interface CreateFileInput {
  courseId: number;
  ownerId: string;
  title: string;
  fileUrl: string;
}

export interface GrantFileAccessInput {
  fileId: number;
  userId: number;
  accessLevel: AccessLevel;
}

export interface CreateAnnotationInput {
  fileId: number;
  authorId: string;
  parentId?: number | null;
  anchorJson: Prisma.InputJsonValue;
  body: string;
}

export interface UpdateAnnotationInput {
  body?: string;
  anchorJson?: Prisma.InputJsonValue;
}

export type ValidatedLocals = {
  id?: number;
};

