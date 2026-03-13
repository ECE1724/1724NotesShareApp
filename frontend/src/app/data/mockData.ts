// Mock data for the course materials platform

export interface Department {
  id: string;
  name: string;
  code: string;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  department: string;
  documentsCount: number;
  color: string;
}

export interface Comment {
  id: string;
  author: string;
  role: 'Admin' | 'Viewer';
  content: string;
  timestamp: string;
  replies?: Comment[];
}

export interface Document {
  id: string;
  title: string;
  courseCode: string;
  uploadDate: string;
  uploader: string;
}

export const departments: Department[] = [
  { id: '1', name: 'Mathematics', code: 'MAT' },
  { id: '2', name: 'Computer Science', code: 'CSC' },
  { id: '3', name: 'Physics', code: 'PHY' },
  { id: '4', name: 'Chemistry', code: 'CHM' },
  { id: '5', name: 'Biology', code: 'BIO' },
  { id: '6', name: 'Engineering', code: 'ENG' },
  { id: '7', name: 'Economics', code: 'ECO' },
  { id: '8', name: 'Psychology', code: 'PSY' },
];

export const courses: Course[] = [
  {
    id: '1',
    code: 'MAT137',
    name: 'Calculus',
    department: 'MAT',
    documentsCount: 24,
    color: '#0B4F91',
  },
  {
    id: '2',
    code: 'CSC148',
    name: 'Intro to CS',
    department: 'CSC',
    documentsCount: 18,
    color: '#0066CC',
  },
  {
    id: '3',
    code: 'PHY151',
    name: 'Physics I',
    department: 'PHY',
    documentsCount: 32,
    color: '#2E5C8A',
  },
  {
    id: '4',
    code: 'CHM135',
    name: 'Chemistry I',
    department: 'CHM',
    documentsCount: 15,
    color: '#1F4B73',
  },
  {
    id: '5',
    code: 'CSC207',
    name: 'Software Design',
    department: 'CSC',
    documentsCount: 21,
    color: '#0066CC',
  },
  {
    id: '6',
    code: 'MAT223',
    name: 'Linear Algebra',
    department: 'MAT',
    documentsCount: 19,
    color: '#0B4F91',
  },
  {
    id: '7',
    code: 'ECO101',
    name: 'Microeconomics',
    department: 'ECO',
    documentsCount: 12,
    color: '#3D6B99',
  },
  {
    id: '8',
    code: 'PSY100',
    name: 'Intro to Psychology',
    department: 'PSY',
    documentsCount: 27,
    color: '#4A7BA7',
  },
];

export const documents: Document[] = [
  {
    id: '1',
    title: 'Lecture 5 - Limits and Continuity',
    courseCode: 'MAT137',
    uploadDate: '2026-03-10',
    uploader: 'Prof. Johnson',
  },
  {
    id: '2',
    title: 'Problem Set 3',
    courseCode: 'MAT137',
    uploadDate: '2026-03-09',
    uploader: 'TA Sarah',
  },
  {
    id: '3',
    title: 'Midterm Review',
    courseCode: 'CSC148',
    uploadDate: '2026-03-08',
    uploader: 'Prof. Chen',
  },
];

export const comments: Comment[] = [
  {
    id: '1',
    author: 'Prof. Johnson',
    role: 'Admin',
    content: 'This section covers the formal definition of limits. Pay special attention to the epsilon-delta definition on page 3.',
    timestamp: '2026-03-12 10:30 AM',
    replies: [
      {
        id: '2',
        author: 'Sarah M.',
        role: 'Viewer',
        content: 'Could you clarify the example on page 4? I\'m having trouble understanding the approach.',
        timestamp: '2026-03-12 2:15 PM',
      },
      {
        id: '3',
        author: 'Prof. Johnson',
        role: 'Admin',
        content: 'Great question! The key is to work backwards from what you want to prove. I\'ll add more detail in office hours.',
        timestamp: '2026-03-12 3:45 PM',
      },
    ],
  },
  {
    id: '4',
    author: 'Michael K.',
    role: 'Viewer',
    content: 'The highlighted section on page 2 is really helpful for understanding the concept. Thanks for sharing!',
    timestamp: '2026-03-13 9:00 AM',
  },
  {
    id: '5',
    author: 'TA Sarah',
    role: 'Admin',
    content: 'Note: There\'s a typo in equation 2.3. It should be "x²" not "x³". This will be corrected in the next version.',
    timestamp: '2026-03-13 11:20 AM',
  },
];
