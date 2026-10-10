export type UserRole = 'student' | 'teacher' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  subject?: string;
  avatar?: string;
  status?: 'active' | 'suspended';
  createdAt: string;
  bio?: string;
}

export interface Class {
  id: string;
  teacherId: string;
  teacherName: string;
  teacherAvatar?: string;
  name: string;
  subject: string;
  section: string;
  room?: string;
  description?: string;
  classCode: string; // e.g. "CF-7X92K"
  bannerColor?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClassMember {
  id: string;
  classId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  role: UserRole;
  joinedAt: string;
}

export interface Topic {
  id: string;
  classId: string;
  name: string;
  createdAt: string;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string; // e.g. "application/pdf", "image/png"
  size: number; // in bytes
}

export interface RubricItem {
  id: string;
  criterion: string;
  maxPoints: number;
  description?: string;
}

export interface Assignment {
  id: string;
  classId: string;
  className: string;
  teacherId: string;
  teacherName: string;
  title: string;
  instructions: string;
  points: number;
  dueDate: string; // ISO date string e.g. "2026-08-20T23:59:00Z"
  dueTime?: string;
  attachments: Attachment[];
  topic?: string;
  rubric?: RubricItem[];
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
}

export interface AssignmentView {
  id: string; // `${assignmentId}_${studentId}`
  assignmentId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentAvatar?: string;
  firstSeenAt: string;
  lastSeenAt: string;
  viewCount: number;
}

export interface MaterialView {
  id: string; // `${materialId}_${studentId}`
  materialId: string;
  studentId: string;
  classId: string;
  studentName: string;
  studentEmail: string;
  studentAvatar?: string;
  seen: boolean;
  firstSeenAt?: string;
  lastSeenAt?: string;
  viewCount: number;
}

export interface Material {
  id: string;
  classId: string;
  className?: string;
  teacherId: string;
  teacherName?: string;
  title: string;
  description?: string;
  type: 'pdf' | 'document' | 'link' | 'video' | 'notes' | 'announcement' | 'assignment';
  content?: string;
  url?: string;
  attachments?: Attachment[];
  topic?: string;
  createdAt: string;
  updatedAt?: string;
  seenBy?: string[];
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentAvatar?: string;
  submittedAt: string;
  attachments: Attachment[];
  textResponse?: string;
  grade?: number;
  feedback?: string;
  status: 'submitted' | 'graded' | 'late' | 'returned';
}

export interface Announcement {
  id: string;
  classId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  authorRole: UserRole;
  content: string;
  attachments: Attachment[];
  createdAt: string;
  commentsCount: number;
}

export interface Comment {
  id: string;
  targetId: string; // announcementId or assignmentId
  targetType: 'announcement' | 'assignment_class' | 'assignment_private';
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  authorRole: UserRole;
  studentIdForPrivate?: string; // for private comments between teacher & student
  content: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'assignment_published' | 'assignment_due' | 'assignment_graded' | 'announcement' | 'class_invitation' | 'submission_received';
  title: string;
  message: string;
  read: boolean;
  linkUrl?: string;
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  classId: string;
  className: string;
  date: string; // ISO YYYY-MM-DD
  time?: string;
  type: 'assignment' | 'exam' | 'event';
  assignmentId?: string;
  color?: string;
}

export type WhatsAppStatus = 'not_seen' | 'seen' | 'submitted' | 'graded' | 'late';
