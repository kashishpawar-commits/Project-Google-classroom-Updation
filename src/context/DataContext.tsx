import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  Class, ClassMember, Assignment, AssignmentView, MaterialView, Material, Submission, 
  Announcement, Comment, Notification, CalendarEvent, User, Topic 
} from '../types';
import { StorageService, subscribeToStore } from '../lib/storage';
import { useAuth } from './AuthContext';

interface DataContextType {
  classes: Class[];
  members: ClassMember[];
  assignments: Assignment[];
  materials: Material[];
  topics: Topic[];
  views: AssignmentView[];
  materialViews: MaterialView[];
  submissions: Submission[];
  announcements: Announcement[];
  comments: Comment[];
  notifications: Notification[];
  events: CalendarEvent[];
  unreadNotificationCount: number;
  
  // Class Actions
  createClass: (data: { name: string; subject: string; section: string; room?: string; description?: string }) => Class;
  updateClass: (classId: string, data: Partial<Class>) => Class;
  deleteClass: (classId: string) => void;
  generateClassCode: (classId: string) => string;
  joinClass: (classCode: string) => Class;
  leaveClass: (classId: string) => void;
  removeMember: (classId: string, userId: string) => void;

  // Topic Actions
  createTopic: (classId: string, name: string) => Topic;
  updateTopic: (topicId: string, name: string) => Topic;
  deleteTopic: (topicId: string) => void;

  // Assignment & Material Actions
  createAssignment: (assignment: Omit<Assignment, 'id' | 'createdAt' | 'updatedAt'>) => Assignment;
  updateAssignment: (assignmentId: string, data: Partial<Assignment>) => Assignment;
  deleteAssignment: (assignmentId: string) => void;

  createMaterial: (data: Omit<Material, 'id' | 'createdAt' | 'updatedAt' | 'seenBy'>) => Material;
  updateMaterial: (materialId: string, data: Partial<Material>) => Material;
  deleteMaterial: (materialId: string) => void;

  recordAssignmentView: (assignmentId: string) => AssignmentView | null;
  recordMaterialView: (materialId: string, classId: string) => MaterialView | null;
  sendReminderToUnseenStudents: (materialId: string, materialTitle: string, classId: string) => number;

  // Submission Actions
  submitAssignment: (assignmentId: string, attachments: any[], textResponse?: string) => Submission | null;
  unsubmitAssignment: (submissionId: string) => void;
  gradeSubmission: (submissionId: string, grade: number, feedback: string) => Submission;

  // Announcements & Comments
  createAnnouncement: (classId: string, content: string, attachments: any[]) => Announcement;
  updateAnnouncement: (announcementId: string, content: string) => Announcement;
  deleteAnnouncement: (announcementId: string) => void;
  addComment: (targetId: string, targetType: 'announcement' | 'assignment_class' | 'assignment_private', content: string, studentIdForPrivate?: string) => Comment;
  deleteComment: (commentId: string) => void;

  // Notifications
  markNotificationRead: (notifId: string) => void;
  markAllNotificationsRead: () => void;
  deleteNotification: (notifId: string) => void;

  // System & Data Management
  exportData: () => string;
  importData: (jsonStr: string) => boolean;
  resetDemoData: () => void;
  clearAllData: () => void;
  refreshData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const [classes, setClasses] = useState<Class[]>(() => StorageService.getClasses());
  const [members, setMembers] = useState<ClassMember[]>(() => StorageService.getMembers());
  const [assignments, setAssignments] = useState<Assignment[]>(() => StorageService.getAssignments());
  const [materials, setMaterials] = useState<Material[]>(() => StorageService.getMaterials());
  const [topics, setTopics] = useState<Topic[]>(() => StorageService.getTopics());
  const [views, setViews] = useState<AssignmentView[]>(() => StorageService.getAssignmentViews());
  const [materialViews, setMaterialViews] = useState<MaterialView[]>(() => StorageService.getMaterialViews());
  const [submissions, setSubmissions] = useState<Submission[]>(() => StorageService.getSubmissions());
  const [announcements, setAnnouncements] = useState<Announcement[]>(() => StorageService.getAnnouncements());
  const [comments, setComments] = useState<Comment[]>(() => StorageService.getComments(''));
  const [notifications, setNotifications] = useState<Notification[]>(() => StorageService.getNotifications(user?.id));
  const [events, setEvents] = useState<CalendarEvent[]>(() => StorageService.getEvents());

  const refreshData = useCallback(() => {
    setClasses(StorageService.getClasses());
    setMembers(StorageService.getMembers());
    setAssignments(StorageService.getAssignments());
    setMaterials(StorageService.getMaterials());
    setTopics(StorageService.getTopics());
    setViews(StorageService.getAssignmentViews());
    setMaterialViews(StorageService.getMaterialViews());
    setSubmissions(StorageService.getSubmissions());
    setAnnouncements(StorageService.getAnnouncements());
    setComments(StorageService.getComments(''));
    setNotifications(StorageService.getNotifications(user?.id));
    setEvents(StorageService.getEvents());
  }, [user?.id]);

  useEffect(() => {
    refreshData();
    const unsubscribe = subscribeToStore(() => {
      refreshData();
    });
    return unsubscribe;
  }, [refreshData]);

  const unreadNotificationCount = notifications.filter((n) => !n.read).length;

  const createClass = (data: { name: string; subject: string; section: string; room?: string; description?: string }) => {
    if (!user) throw new Error('Not authenticated');
    return StorageService.createClass(user, data);
  };

  const updateClass = (classId: string, data: Partial<Class>) => {
    return StorageService.updateClass(classId, data);
  };

  const deleteClass = (classId: string) => {
    StorageService.deleteClass(classId);
  };

  const generateClassCode = (classId: string) => {
    return StorageService.generateNewClassCode(classId);
  };

  const joinClass = (classCode: string) => {
    if (!user) throw new Error('Not authenticated');
    return StorageService.joinClass(user, classCode);
  };

  const leaveClass = (classId: string) => {
    if (!user) throw new Error('Not authenticated');
    StorageService.leaveClass(classId, user.id);
  };

  const removeMember = (classId: string, userId: string) => {
    StorageService.removeMember(classId, userId);
  };

  const createTopic = (classId: string, name: string) => {
    return StorageService.createTopic(classId, name);
  };

  const updateTopic = (topicId: string, name: string) => {
    return StorageService.updateTopic(topicId, name);
  };

  const deleteTopic = (topicId: string) => {
    StorageService.deleteTopic(topicId);
  };

  const createAssignment = (assignment: Omit<Assignment, 'id' | 'createdAt' | 'updatedAt'>) => {
    return StorageService.createAssignment(assignment);
  };

  const updateAssignment = (assignmentId: string, data: Partial<Assignment>) => {
    return StorageService.updateAssignment(assignmentId, data);
  };

  const deleteAssignment = (assignmentId: string) => {
    StorageService.deleteAssignment(assignmentId);
  };

  const createMaterial = (data: Omit<Material, 'id' | 'createdAt' | 'updatedAt' | 'seenBy'>) => {
    if (!user) throw new Error('Not authenticated');
    const created = StorageService.createMaterial(user, data);
    refreshData();
    return created;
  };

  const updateMaterial = (materialId: string, data: Partial<Material>) => {
    const updated = StorageService.updateMaterial(materialId, data);
    refreshData();
    return updated;
  };

  const deleteMaterial = (materialId: string) => {
    StorageService.deleteMaterial(materialId);
    refreshData();
  };

  const recordAssignmentView = (assignmentId: string): AssignmentView | null => {
    if (!user || user.role !== 'student') return null;
    const res = StorageService.recordAssignmentView(assignmentId, user);
    refreshData();
    return res;
  };

  const recordMaterialView = (materialId: string, classId: string): MaterialView | null => {
    if (!user || user.role !== 'student') return null;
    const res = StorageService.recordMaterialView(materialId, classId, user);
    refreshData();
    return res;
  };

  const sendReminderToUnseenStudents = (materialId: string, materialTitle: string, classId: string): number => {
    if (!user || (user.role !== 'teacher' && user.role !== 'admin')) return 0;
    const classStudents = members.filter((m) => m.classId === classId && m.role === 'student');
    const existingViews = StorageService.getMaterialViews(materialId);
    const seenStudentIds = new Set(existingViews.map((v) => v.studentId));
    const unseenStudents = classStudents.filter((s) => !seenStudentIds.has(s.userId));

    unseenStudents.forEach((student) => {
      StorageService.createNotification(
        student.userId,
        'announcement',
        `Pending Material Reminder: ${materialTitle}`,
        `Your teacher ${user.name} reminded you to open and review "${materialTitle}".`,
        `/class/${classId}`
      );
    });

    refreshData();
    return unseenStudents.length;
  };

  const submitAssignment = (assignmentId: string, attachments: any[], textResponse?: string): Submission | null => {
    if (!user || user.role !== 'student') return null;
    return StorageService.submitAssignment(user, assignmentId, attachments, textResponse);
  };

  const unsubmitAssignment = (submissionId: string) => {
    StorageService.unsubmitAssignment(submissionId);
  };

  const gradeSubmission = (submissionId: string, grade: number, feedback: string) => {
    return StorageService.gradeSubmission(submissionId, grade, feedback);
  };

  const createAnnouncement = (classId: string, content: string, attachments: any[]) => {
    if (!user) throw new Error('Not authenticated');
    return StorageService.createAnnouncement(user, classId, content, attachments);
  };

  const updateAnnouncement = (announcementId: string, content: string) => {
    return StorageService.updateAnnouncement(announcementId, content);
  };

  const deleteAnnouncement = (announcementId: string) => {
    StorageService.deleteAnnouncement(announcementId);
  };

  const addComment = (
    targetId: string,
    targetType: 'announcement' | 'assignment_class' | 'assignment_private',
    content: string,
    studentIdForPrivate?: string
  ) => {
    if (!user) throw new Error('Not authenticated');
    return StorageService.addComment(user, targetId, targetType, content, studentIdForPrivate);
  };

  const deleteComment = (commentId: string) => {
    StorageService.deleteComment(commentId);
  };

  const markNotificationRead = (notifId: string) => {
    StorageService.markNotificationRead(notifId);
  };

  const markAllNotificationsRead = () => {
    if (user) {
      StorageService.markAllNotificationsRead(user.id);
    }
  };

  const deleteNotification = (notifId: string) => {
    StorageService.deleteNotification(notifId);
  };

  const exportData = () => {
    return StorageService.exportAllData();
  };

  const importData = (jsonStr: string) => {
    return StorageService.importAllData(jsonStr);
  };

  const resetDemoData = () => {
    StorageService.resetToSeed();
  };

  const clearAllData = () => {
    StorageService.clearAllData();
  };

  return (
    <DataContext.Provider
      value={{
        classes,
        members,
        assignments,
        materials,
        topics,
        views,
        materialViews,
        submissions,
        announcements,
        comments,
        notifications,
        events,
        unreadNotificationCount,
        createClass,
        updateClass,
        deleteClass,
        generateClassCode,
        joinClass,
        leaveClass,
        removeMember,
        createTopic,
        updateTopic,
        deleteTopic,
        createAssignment,
        updateAssignment,
        deleteAssignment,
        createMaterial,
        updateMaterial,
        deleteMaterial,
        recordAssignmentView,
        recordMaterialView,
        sendReminderToUnseenStudents,
        submitAssignment,
        unsubmitAssignment,
        gradeSubmission,
        createAnnouncement,
        updateAnnouncement,
        deleteAnnouncement,
        addComment,
        deleteComment,
        markNotificationRead,
        markAllNotificationsRead,
        deleteNotification,
        exportData,
        importData,
        resetDemoData,
        clearAllData,
        refreshData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

