import { 
  User, UserRole, Class, ClassMember, Assignment, AssignmentView, MaterialView, Material, 
  Submission, Announcement, Comment, Notification, CalendarEvent, Topic 
} from '../types';
import { generateClassCode } from './utils';

const STORAGE_KEYS = {
  USERS: 'classflow_users',
  CLASSES: 'classflow_classes',
  MEMBERS: 'classflow_members',
  ASSIGNMENTS: 'classflow_assignments',
  MATERIALS: 'classflow_materials',
  VIEWS: 'classflow_assignment_views',
  MATERIAL_VIEWS: 'classflow_material_views',
  SUBMISSIONS: 'classflow_submissions',
  ANNOUNCEMENTS: 'classflow_announcements',
  COMMENTS: 'classflow_comments',
  NOTIFICATIONS: 'classflow_notifications',
  EVENTS: 'classflow_events',
  TOPICS: 'classflow_topics',
  CURRENT_USER: 'classflow_current_user',
};

// Initial Seed Users: Exactly 5 Teachers, 1 Admin, 20 Students
export const SEED_USERS: User[] = [
  // 5 Teachers
  {
    id: 'usr_teacher_1',
    name: 'Dr. Amit Kulkarni',
    email: 'amit.kulkarni@classflow.demo',
    role: 'teacher',
    subject: 'Operating Systems',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    createdAt: '2026-01-10T08:00:00Z',
    bio: 'Professor of Operating Systems & Systems Architecture',
    status: 'active',
  },
  {
    id: 'usr_teacher_2',
    name: 'Prof. Neha Sharma',
    email: 'neha.sharma@classflow.demo',
    role: 'teacher',
    subject: 'Data Structures',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    createdAt: '2026-01-10T08:00:00Z',
    bio: 'Assistant Professor of Data Structures & Algorithms',
    status: 'active',
  },
  {
    id: 'usr_teacher_3',
    name: 'Prof. Rahul Deshmukh',
    email: 'rahul.deshmukh@classflow.demo',
    role: 'teacher',
    subject: 'Database Management Systems',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150',
    createdAt: '2026-01-10T08:00:00Z',
    bio: 'Database Systems Architect & Lecturer',
    status: 'active',
  },
  {
    id: 'usr_teacher_4',
    name: 'Dr. Priya Patil',
    email: 'priya.patil@classflow.demo',
    role: 'teacher',
    subject: 'Computer Networks',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    createdAt: '2026-01-10T08:00:00Z',
    bio: 'Network Security & Protocol Specialist',
    status: 'active',
  },
  {
    id: 'usr_teacher_5',
    name: 'Prof. Arjun Joshi',
    email: 'arjun.joshi@classflow.demo',
    role: 'teacher',
    subject: 'Java Programming',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
    createdAt: '2026-01-10T08:00:00Z',
    bio: 'Object-Oriented Programming & Enterprise Java Instructor',
    status: 'active',
  },

  // 1 Admin
  {
    id: 'usr_admin_1',
    name: 'Platform Administrator',
    email: 'admin@classflow.demo',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    createdAt: '2026-01-01T00:00:00Z',
    bio: 'ClassFlow System Administrator',
    status: 'active',
  },

  // 20 Students
  { id: 'usr_student_1', name: 'Aarav Sharma', email: 'aarav.sharma@classflow.demo', role: 'student', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', createdAt: '2026-01-15T09:30:00Z', status: 'active' },
  { id: 'usr_student_2', name: 'Ananya Patil', email: 'ananya.patil@classflow.demo', role: 'student', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', createdAt: '2026-01-15T09:35:00Z', status: 'active' },
  { id: 'usr_student_3', name: 'Rohan Deshmukh', email: 'rohan.deshmukh@classflow.demo', role: 'student', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150', createdAt: '2026-01-15T09:40:00Z', status: 'active' },
  { id: 'usr_student_4', name: 'Sneha Kulkarni', email: 'sneha.kulkarni@classflow.demo', role: 'student', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', createdAt: '2026-01-15T09:45:00Z', status: 'active' },
  { id: 'usr_student_5', name: 'Aditya Joshi', email: 'aditya.joshi@classflow.demo', role: 'student', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', createdAt: '2026-01-15T09:50:00Z', status: 'active' },
  { id: 'usr_student_6', name: 'Priya Shinde', email: 'priya.shinde@classflow.demo', role: 'student', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', createdAt: '2026-01-15T09:55:00Z', status: 'active' },
  { id: 'usr_student_7', name: 'Vedant More', email: 'vedant.more@classflow.demo', role: 'student', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', createdAt: '2026-01-15T10:00:00Z', status: 'active' },
  { id: 'usr_student_8', name: 'Ishita Pawar', email: 'ishita.pawar@classflow.demo', role: 'student', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150', createdAt: '2026-01-15T10:05:00Z', status: 'active' },
  { id: 'usr_student_9', name: 'Omkar Jadhav', email: 'omkar.jadhav@classflow.demo', role: 'student', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150', createdAt: '2026-01-15T10:10:00Z', status: 'active' },
  { id: 'usr_student_10', name: 'Neha Desai', email: 'neha.desai@classflow.demo', role: 'student', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', createdAt: '2026-01-15T10:15:00Z', status: 'active' },
  { id: 'usr_student_11', name: 'Atharv Chavan', email: 'atharv.chavan@classflow.demo', role: 'student', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150', createdAt: '2026-01-15T10:20:00Z', status: 'active' },
  { id: 'usr_student_12', name: 'Riya Mahajan', email: 'riya.mahajan@classflow.demo', role: 'student', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', createdAt: '2026-01-15T10:25:00Z', status: 'active' },
  { id: 'usr_student_13', name: 'Yash Thakur', email: 'yash.thakur@classflow.demo', role: 'student', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150', createdAt: '2026-01-15T10:30:00Z', status: 'active' },
  { id: 'usr_student_14', name: 'Aditi Kale', email: 'aditi.kale@classflow.demo', role: 'student', avatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=150', createdAt: '2026-01-15T10:35:00Z', status: 'active' },
  { id: 'usr_student_15', name: 'Kunal Bhosale', email: 'kunal.bhosale@classflow.demo', role: 'student', avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150', createdAt: '2026-01-15T10:40:00Z', status: 'active' },
  { id: 'usr_student_16', name: 'Sakshi Wagh', email: 'sakshi.wagh@classflow.demo', role: 'student', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', createdAt: '2026-01-15T10:45:00Z', status: 'active' },
  { id: 'usr_student_17', name: 'Siddhant Patil', email: 'siddhant.patil@classflow.demo', role: 'student', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', createdAt: '2026-01-15T10:50:00Z', status: 'active' },
  { id: 'usr_student_18', name: 'Pooja Gaikwad', email: 'pooja.gaikwad@classflow.demo', role: 'student', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', createdAt: '2026-01-15T10:55:00Z', status: 'active' },
  { id: 'usr_student_19', name: 'Tanmay Joshi', email: 'tanmay.joshi@classflow.demo', role: 'student', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', createdAt: '2026-01-15T11:00:00Z', status: 'active' },
  { id: 'usr_student_20', name: 'Mansi Deshmukh', email: 'mansi.deshmukh@classflow.demo', role: 'student', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', createdAt: '2026-01-15T11:05:00Z', status: 'active' },
];

// Initial Seed Classes: 5 Classes corresponding to the 5 teachers
const SEED_CLASSES: Class[] = [
  {
    id: 'cls_os_101',
    teacherId: 'usr_teacher_1',
    teacherName: 'Dr. Amit Kulkarni',
    teacherAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    name: 'Operating Systems',
    subject: 'Operating Systems',
    section: 'CS-301',
    room: 'Lab 402',
    description: 'Kernel Architecture, Memory Management, Process Scheduling & Concurrency.',
    classCode: 'OS2026',
    bannerColor: 'from-blue-600 to-indigo-700',
    createdAt: '2026-01-10T09:00:00Z',
    updatedAt: '2026-01-10T09:00:00Z',
  },
  {
    id: 'cls_ds_102',
    teacherId: 'usr_teacher_2',
    teacherName: 'Prof. Neha Sharma',
    teacherAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    name: 'Data Structures',
    subject: 'Data Structures',
    section: 'CS-201',
    room: 'Hall A',
    description: 'Arrays, Stacks, Queues, Linked Lists, Trees, Graphs & Algorithm Complexity.',
    classCode: 'DS2026',
    bannerColor: 'from-emerald-600 to-teal-700',
    createdAt: '2026-01-10T09:30:00Z',
    updatedAt: '2026-01-10T09:30:00Z',
  },
  {
    id: 'cls_dbms_103',
    teacherId: 'usr_teacher_3',
    teacherName: 'Prof. Rahul Deshmukh',
    teacherAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150',
    name: 'Database Management Systems',
    subject: 'Database Management Systems',
    section: 'CS-302',
    room: 'Lab 305',
    description: 'Relational Databases, SQL, Normalization, Transactions & Indexing.',
    classCode: 'DBMS26',
    bannerColor: 'from-amber-600 to-orange-700',
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-01-10T10:00:00Z',
  },
  {
    id: 'cls_cn_104',
    teacherId: 'usr_teacher_4',
    teacherName: 'Dr. Priya Patil',
    teacherAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    name: 'Computer Networks',
    subject: 'Computer Networks',
    section: 'CS-303',
    room: 'Hall C',
    description: 'OSI Model, TCP/IP, Routing Algorithms, IP Addressing & Socket Programming.',
    classCode: 'CN2026',
    bannerColor: 'from-purple-600 to-pink-700',
    createdAt: '2026-01-10T10:30:00Z',
    updatedAt: '2026-01-10T10:30:00Z',
  },
  {
    id: 'cls_java_105',
    teacherId: 'usr_teacher_5',
    teacherName: 'Prof. Arjun Joshi',
    teacherAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
    name: 'Java Programming',
    subject: 'Java Programming',
    section: 'CS-102',
    room: 'Lab 101',
    description: 'Java Syntax, Object-Oriented Principles, Exception Handling & Collections Framework.',
    classCode: 'JAVA26',
    bannerColor: 'from-cyan-600 to-blue-700',
    createdAt: '2026-01-10T11:00:00Z',
    updatedAt: '2026-01-10T11:00:00Z',
  },
];

// Helper to build members list cleanly
const createSeedMembers = (): ClassMember[] => {
  const members: ClassMember[] = [];
  let mId = 1;

  // Add teachers to their classes
  const teacherClassMap = [
    { classId: 'cls_os_101', teacher: SEED_USERS[0] },
    { classId: 'cls_ds_102', teacher: SEED_USERS[1] },
    { classId: 'cls_dbms_103', teacher: SEED_USERS[2] },
    { classId: 'cls_cn_104', teacher: SEED_USERS[3] },
    { classId: 'cls_java_105', teacher: SEED_USERS[4] },
  ];

  teacherClassMap.forEach(({ classId, teacher }) => {
    members.push({
      id: `m_${mId++}`,
      classId,
      userId: teacher.id,
      userName: teacher.name,
      userEmail: teacher.email,
      userAvatar: teacher.avatar,
      role: 'teacher',
      joinedAt: '2026-01-10T09:00:00Z',
    });
  });

  // Distribute 20 students across classes (~10 per class)
  const students = SEED_USERS.filter((u) => u.role === 'student');

  const distributions: { [classId: string]: number[] } = {
    // OS: Students 1..10 (indices 0..9)
    'cls_os_101': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    // DS: Students 6..15 (indices 5..14)
    'cls_ds_102': [5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
    // DBMS: Students 11..20 (indices 10..19)
    'cls_dbms_103': [10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
    // CN: Students 1..5, 11..15 (indices 0..4, 10..14)
    'cls_cn_104': [0, 1, 2, 3, 4, 10, 11, 12, 13, 14],
    // JAVA: Students 4..8, 16..20 (indices 3..7, 15..19)
    'cls_java_105': [3, 4, 5, 6, 7, 15, 16, 17, 18, 19],
  };

  Object.entries(distributions).forEach(([classId, studentIndices]) => {
    studentIndices.forEach((idx) => {
      const st = students[idx];
      members.push({
        id: `m_${mId++}`,
        classId,
        userId: st.id,
        userName: st.name,
        userEmail: st.email,
        userAvatar: st.avatar,
        role: 'student',
        joinedAt: '2026-01-15T10:00:00Z',
      });
    });
  });

  return members;
};

const SEED_MEMBERS: ClassMember[] = createSeedMembers();

// Initial Seed Assignments: Exactly 2 per teacher / class
const SEED_ASSIGNMENTS: Assignment[] = [
  // OS (Dr. Amit Kulkarni) - Task 1: Due in 26 hours (within 48 hours for immediate alert demonstration)
  {
    id: 'asg_os_1',
    classId: 'cls_os_101',
    className: 'Operating Systems',
    teacherId: 'usr_teacher_1',
    teacherName: 'Dr. Amit Kulkarni',
    title: 'Process Management & PCB Lifecycle',
    instructions: 'Implement process creation, fork/exec lifecycle, and PCB tracking in C or Python. Analyze process context switching overhead under 500 concurrent threads.',
    points: 100,
    dueDate: new Date(Date.now() + 26 * 3600 * 1000).toISOString(),
    attachments: [
      { id: 'att_os_1', name: 'Process_Management_Spec.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', type: 'application/pdf', size: 1024500 },
    ],
    topic: 'Process & Threads',
    status: 'published',
    createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
  },
  {
    id: 'asg_os_2',
    classId: 'cls_os_101',
    className: 'Operating Systems',
    teacherId: 'usr_teacher_1',
    teacherName: 'Dr. Amit Kulkarni',
    title: 'CPU Scheduling Algorithms',
    instructions: 'Build a simulator comparing FCFS, SJF, Priority Scheduling, and Round Robin. Measure average waiting time, turnaround time, and CPU utilization.',
    points: 100,
    dueDate: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString(),
    attachments: [],
    topic: 'CPU Scheduling',
    status: 'published',
    createdAt: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
  },

  // Data Structures (Prof. Neha Sharma) - Task 2: Due in 41 hours (within 48 hours)
  {
    id: 'asg_ds_1',
    classId: 'cls_ds_102',
    className: 'Data Structures',
    teacherId: 'usr_teacher_2',
    teacherName: 'Prof. Neha Sharma',
    title: 'Linked List Implementation',
    instructions: 'Implement Singly, Doubly, and Circular Linked Lists with generic data types. Include methods for insertion, deletion, reversal, and loop detection.',
    points: 100,
    dueDate: new Date(Date.now() - 24 * 3600 * 1000).toISOString(), // Past Due / Late
    attachments: [],
    topic: 'Linear Structures',
    status: 'published',
    createdAt: new Date(Date.now() - 96 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 96 * 3600 * 1000).toISOString(),
  },
  {
    id: 'asg_ds_2',
    classId: 'cls_ds_102',
    className: 'Data Structures',
    teacherId: 'usr_teacher_2',
    teacherName: 'Prof. Neha Sharma',
    title: 'Binary Search Tree & AVL Rebalancing',
    instructions: 'Construct an unbalanced BST and an AVL Tree. Benchmark search times for 10,000 random insertions versus sorted sequential insertions.',
    points: 100,
    dueDate: new Date(Date.now() + 41 * 3600 * 1000).toISOString(),
    attachments: [],
    topic: 'Trees & Graphs',
    status: 'published',
    createdAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
  },

  // DBMS (Prof. Rahul Deshmukh)
  {
    id: 'asg_dbms_1',
    classId: 'cls_dbms_103',
    className: 'Database Management Systems',
    teacherId: 'usr_teacher_3',
    teacherName: 'Prof. Rahul Deshmukh',
    title: 'SQL Queries',
    instructions: 'Write complex SQL queries involving INNER JOIN, LEFT JOIN, GROUP BY, HAVING, and subqueries on an e-commerce database schema.',
    points: 100,
    dueDate: '2026-08-19T23:59:00Z',
    attachments: [],
    topic: 'Relational SQL',
    status: 'published',
    createdAt: '2026-08-09T10:00:00Z',
    updatedAt: '2026-08-09T10:00:00Z',
  },
  {
    id: 'asg_dbms_2',
    classId: 'cls_dbms_103',
    className: 'Database Management Systems',
    teacherId: 'usr_teacher_3',
    teacherName: 'Prof. Rahul Deshmukh',
    title: 'Database Normalization',
    instructions: 'Convert an unnormalized university dataset to 1NF, 2NF, 3NF, and BCNF. Provide ER diagrams and dependency diagrams.',
    points: 100,
    dueDate: '2026-08-24T23:59:00Z',
    attachments: [],
    topic: 'Database Design',
    status: 'published',
    createdAt: '2026-08-10T15:00:00Z',
    updatedAt: '2026-08-10T15:00:00Z',
  },

  // Computer Networks (Dr. Priya Patil)
  {
    id: 'asg_cn_1',
    classId: 'cls_cn_104',
    className: 'Computer Networks',
    teacherId: 'usr_teacher_4',
    teacherName: 'Dr. Priya Patil',
    title: 'OSI Model',
    instructions: 'Analyze packet encapsulation across all 7 layers of the OSI model using Wireshark network packet captures.',
    points: 100,
    dueDate: '2026-08-21T23:59:00Z',
    attachments: [],
    topic: 'Network Layers',
    status: 'published',
    createdAt: '2026-08-10T08:00:00Z',
    updatedAt: '2026-08-10T08:00:00Z',
  },
  {
    id: 'asg_cn_2',
    classId: 'cls_cn_104',
    className: 'Computer Networks',
    teacherId: 'usr_teacher_4',
    teacherName: 'Dr. Priya Patil',
    title: 'TCP/IP Protocol Suite',
    instructions: 'Implement a basic TCP socket client-server application handling concurrent connections and sliding window flow control.',
    points: 100,
    dueDate: '2026-08-26T23:59:00Z',
    attachments: [],
    topic: 'Transport Protocols',
    status: 'published',
    createdAt: '2026-08-11T12:00:00Z',
    updatedAt: '2026-08-11T12:00:00Z',
  },

  // Java Programming (Prof. Arjun Joshi)
  {
    id: 'asg_java_1',
    classId: 'cls_java_105',
    className: 'Java Programming',
    teacherId: 'usr_teacher_5',
    teacherName: 'Prof. Arjun Joshi',
    title: 'Java OOP Concepts',
    instructions: 'Design a banking application incorporating Encapsulation, Inheritance, Polymorphism, and Abstract classes in Java.',
    points: 100,
    dueDate: '2026-08-17T23:59:00Z',
    attachments: [],
    topic: 'Object-Oriented Programming',
    status: 'published',
    createdAt: '2026-08-07T14:00:00Z',
    updatedAt: '2026-08-07T14:00:00Z',
  },
  {
    id: 'asg_java_2',
    classId: 'cls_java_105',
    className: 'Java Programming',
    teacherId: 'usr_teacher_5',
    teacherName: 'Prof. Arjun Joshi',
    title: 'Exception Handling',
    instructions: 'Build a custom file parser with try-with-resources, custom unchecked exceptions, and detailed logging output.',
    points: 100,
    dueDate: '2026-08-23T23:59:00Z',
    attachments: [],
    topic: 'Exception Management',
    status: 'published',
    createdAt: '2026-08-10T16:00:00Z',
    updatedAt: '2026-08-10T16:00:00Z',
  },
];

// Helper to construct realistic Seen Views and Submissions
const createSeedViewsAndSubmissions = () => {
  const views: AssignmentView[] = [];
  const submissions: Submission[] = [];

  const students = SEED_USERS.filter((u) => u.role === 'student');

  // OS Assignment 1: Process Management (Class: cls_os_101 -> Students 0..9)
  const osStudents = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => students[i]);
  
  // Seen mixture: 7 seen, 3 not seen
  const os1SeenIndices = [0, 1, 2, 3, 4, 5, 9];
  os1SeenIndices.forEach((idx) => {
    const st = osStudents[idx];
    views.push({
      id: `asg_os_1_${st.id}`,
      assignmentId: 'asg_os_1',
      studentId: st.id,
      studentName: st.name,
      studentEmail: st.email,
      studentAvatar: st.avatar,
      firstSeenAt: '2026-08-10T11:15:00Z',
      lastSeenAt: '2026-08-12T08:42:00Z',
      viewCount: 3,
    });
  });

  // Submissions mixture: 5 submitted (4 graded, 1 pending)
  const os1Submissions = [
    { st: osStudents[0], grade: 92, status: 'graded' as const, feedback: 'Excellent process fork lifecycle explanation!' },
    { st: osStudents[1], grade: 88, status: 'graded' as const, feedback: 'Good thread analysis, minor formatting issue.' },
    { st: osStudents[2], grade: 95, status: 'graded' as const, feedback: 'Outstanding C code execution and benchmarks.' },
    { st: osStudents[3], grade: undefined, status: 'submitted' as const, feedback: '' },
    { st: osStudents[9], grade: 82, status: 'graded' as const, feedback: 'Submitted slightly late, good analysis.' },
  ];

  os1Submissions.forEach(({ st, grade, status, feedback }, i) => {
    submissions.push({
      id: `sub_os_1_${i + 1}`,
      assignmentId: 'asg_os_1',
      studentId: st.id,
      studentName: st.name,
      studentEmail: st.email,
      studentAvatar: st.avatar,
      submittedAt: '2026-08-11T19:30:00Z',
      attachments: [
        { id: `att_sub_${i}`, name: `${st.name.replace(/\s+/g, '_')}_Process_Lab.pdf`, url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', type: 'application/pdf', size: 1200000 },
      ],
      textResponse: 'Completed all process creation benchmarks and multi-threaded context switching analysis.',
      grade,
      feedback,
      status,
    });
  });

  // Create similar realistic data for other assignments
  SEED_ASSIGNMENTS.forEach((asg) => {
    if (asg.id === 'asg_os_1') return; // already handled above

    // Get class members for this assignment
    const classMemberStudentIds = SEED_MEMBERS
      .filter((m) => m.classId === asg.classId && m.role === 'student')
      .map((m) => m.userId);
    
    const classStudents = students.filter((st) => classMemberStudentIds.includes(st.id));

    // ~70% seen
    const seenCount = Math.floor(classStudents.length * 0.7);
    for (let i = 0; i < seenCount; i++) {
      const st = classStudents[i];
      views.push({
        id: `${asg.id}_${st.id}`,
        assignmentId: asg.id,
        studentId: st.id,
        studentName: st.name,
        studentEmail: st.email,
        studentAvatar: st.avatar,
        firstSeenAt: '2026-08-11T10:00:00Z',
        lastSeenAt: '2026-08-12T07:30:00Z',
        viewCount: i % 2 === 0 ? 2 : 4,
      });
    }

    // ~50% submitted
    const subCount = Math.floor(classStudents.length * 0.5);
    for (let i = 0; i < subCount; i++) {
      const st = classStudents[i];
      const isGraded = i % 2 === 0;
      submissions.push({
        id: `sub_${asg.id}_${i + 1}`,
        assignmentId: asg.id,
        studentId: st.id,
        studentName: st.name,
        studentEmail: st.email,
        studentAvatar: st.avatar,
        submittedAt: '2026-08-11T18:00:00Z',
        attachments: [
          { id: `att_${asg.id}_${i}`, name: `${st.name.replace(/\s+/g, '_')}_Assignment.pdf`, url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', type: 'application/pdf', size: 980000 },
        ],
        textResponse: `Completed the ${asg.title} assignment requirements.`,
        grade: isGraded ? 85 + (i * 3) % 15 : undefined,
        feedback: isGraded ? 'Good work on following the instructions and submitting on time.' : '',
        status: isGraded ? 'graded' : 'submitted',
      });
    }
  });

  return { views, submissions };
};

const { views: SEED_VIEWS, submissions: SEED_SUBMISSIONS } = createSeedViewsAndSubmissions();

// Initial Seed Announcements
const SEED_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'anc_1',
    classId: 'cls_os_101',
    authorId: 'usr_teacher_1',
    authorName: 'Dr. Amit Kulkarni',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    authorRole: 'teacher',
    content: 'Welcome to Operating Systems (CS-301)! Please check the syllabus attached. Our office hours are Mondays & Wednesdays 2-4 PM in Lab 402.',
    attachments: [
      { id: 'anc_att_1', name: 'OS_Syllabus_2026.pdf', url: '#', type: 'application/pdf', size: 450000 }
    ],
    createdAt: '2026-08-09T09:00:00Z',
    commentsCount: 2,
  },
  {
    id: 'anc_2',
    classId: 'cls_ds_102',
    authorId: 'usr_teacher_2',
    authorName: 'Prof. Neha Sharma',
    authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    authorRole: 'teacher',
    content: 'Welcome to Data Structures! Make sure to set up your C++ or Java IDE before our first lab session.',
    attachments: [],
    createdAt: '2026-08-09T10:00:00Z',
    commentsCount: 1,
  },
];

// Initial Seed Study Materials (Notes, PDFs, Guides, Videos)
export const SEED_MATERIALS: Material[] = [
  {
    id: 'mat_os_1',
    classId: 'cls_os_101',
    className: 'Operating Systems',
    teacherId: 'usr_teacher_1',
    teacherName: 'Dr. Amit Kulkarni',
    title: 'Unit 3 — Network Layer Notes.pdf',
    description: 'Lecture slides and notes on network packet flow, IP routing, subnet masks, and virtual memory interaction.',
    type: 'pdf',
    content: 'Full comprehensive study notes on network packets, routing algorithms, and kernel socket integration.',
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    topic: 'Unit 3: Memory & Networking',
    createdAt: '2026-08-09T08:30:00Z',
    attachments: [
      { id: 'att_m1', name: 'Unit_3_Network_Notes.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', type: 'application/pdf', size: 2450000 }
    ],
  },
  {
    id: 'mat_os_2',
    classId: 'cls_os_101',
    className: 'Operating Systems',
    teacherId: 'usr_teacher_1',
    teacherName: 'Dr. Amit Kulkarni',
    title: 'Virtual Memory & Page Replacement Formulas Cheat Sheet',
    description: 'Quick reference formulas for FIFO, LRU, and Optimal page replacement with hit ratio examples.',
    type: 'notes',
    content: 'Essential formulas and calculation steps for TLB miss rates, effective memory access time, and dirty bit paging.',
    topic: 'Unit 3: Memory Management',
    createdAt: '2026-08-10T11:00:00Z',
    attachments: [
      { id: 'att_m2', name: 'Page_Replacement_CheatSheet.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', type: 'application/pdf', size: 1120000 }
    ],
  },
  {
    id: 'mat_os_3',
    classId: 'cls_os_101',
    className: 'Operating Systems',
    teacherId: 'usr_teacher_1',
    teacherName: 'Dr. Amit Kulkarni',
    title: 'Linux Kernel Mutex vs Semaphores Guide & Code Reference',
    description: 'Code snippets demonstrating pthread_mutex_lock vs sem_wait synchronization primitives.',
    type: 'document',
    content: 'Detailed code examples and race condition prevention using atomic operations in C/C++.',
    topic: 'Unit 2: Process Synchronization',
    createdAt: '2026-08-11T14:20:00Z',
  },
  {
    id: 'mat_ds_1',
    classId: 'cls_ds_102',
    className: 'Data Structures',
    teacherId: 'usr_teacher_2',
    teacherName: 'Prof. Neha Sharma',
    title: 'Red-Black Tree Balance & Rotation Step-by-Step Guide.pdf',
    description: 'Color-coded visual illustrations of left and right tree rotations during insertion.',
    type: 'pdf',
    content: 'Visual guide to maintaining self-balancing binary search tree invariants with asymptotic proofs.',
    topic: 'Module 3: Advanced Trees',
    createdAt: '2026-08-08T09:15:00Z',
    attachments: [
      { id: 'att_m3', name: 'RedBlack_Tree_Rotations.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', type: 'application/pdf', size: 3100000 }
    ],
  },
  {
    id: 'mat_ds_2',
    classId: 'cls_ds_102',
    className: 'Data Structures',
    teacherId: 'usr_teacher_2',
    teacherName: 'Prof. Neha Sharma',
    title: 'Graph Traversal & Dijkstra Shortest Path Practice Questions',
    description: '15 solved practice questions on BFS, DFS, and priority queue-based Dijkstra algorithm.',
    type: 'notes',
    content: 'Practice problem set with adjacency list versus adjacency matrix complexity breakdown.',
    topic: 'Module 4: Graphs',
    createdAt: '2026-08-10T16:00:00Z',
  },
];

// Seed Material Views for WhatsApp-style seen/unseen tracking
const createSeedMaterialViews = (): MaterialView[] => {
  const matViews: MaterialView[] = [];

  // 1. Assignment Views
  SEED_VIEWS.forEach((v) => {
    const asg = SEED_ASSIGNMENTS.find((a) => a.id === v.assignmentId);
    matViews.push({
      id: `${v.assignmentId}_${v.studentId}`,
      materialId: v.assignmentId,
      studentId: v.studentId,
      classId: asg?.classId || '',
      studentName: v.studentName,
      studentEmail: v.studentEmail,
      studentAvatar: v.studentAvatar,
      seen: true,
      firstSeenAt: v.firstSeenAt,
      lastSeenAt: v.lastSeenAt,
      viewCount: v.viewCount,
    });
  });

  // 2. Announcement Views
  SEED_ANNOUNCEMENTS.forEach((anc) => {
    const classMembers = SEED_MEMBERS.filter((m) => m.classId === anc.classId && m.role === 'student');
    const seenCount = Math.floor(classMembers.length * 0.7);
    for (let i = 0; i < seenCount; i++) {
      const m = classMembers[i];
      matViews.push({
        id: `${anc.id}_${m.userId}`,
        materialId: anc.id,
        studentId: m.userId,
        classId: anc.classId,
        studentName: m.userName,
        studentEmail: m.userEmail,
        studentAvatar: m.userAvatar,
        seen: true,
        firstSeenAt: '2026-08-09T10:30:00Z',
        lastSeenAt: '2026-08-10T14:15:00Z',
        viewCount: i % 2 === 0 ? 1 : 3,
      });
    }
  });

  // 3. Dedicated Materials Views (Unit Notes, PDFs, Guides)
  SEED_MATERIALS.forEach((mat) => {
    const classMembers = SEED_MEMBERS.filter((m) => m.classId === mat.classId && m.role === 'student');
    // Ensure Aarav, Rahul, and Rohan have seen mat_os_1, while Priya and Neha haven't yet
    const seenIndices = mat.id === 'mat_os_1' ? [0, 1, 3] : [0, 1, 2, 3];
    seenIndices.forEach((idx, order) => {
      if (idx < classMembers.length) {
        const m = classMembers[idx];
        const times = ['2026-08-10T10:32:00Z', '2026-08-10T10:41:00Z', '2026-08-10T11:02:00Z', '2026-08-10T11:30:00Z'];
        const seenTime = times[order] || '2026-08-10T11:00:00Z';
        matViews.push({
          id: `${mat.id}_${m.userId}`,
          materialId: mat.id,
          studentId: m.userId,
          classId: mat.classId,
          studentName: m.userName,
          studentEmail: m.userEmail,
          studentAvatar: m.userAvatar,
          seen: true,
          firstSeenAt: seenTime,
          lastSeenAt: seenTime,
          viewCount: order === 0 ? 3 : 1,
        });
      }
    });
  });

  return matViews;
};

const SEED_MATERIAL_VIEWS: MaterialView[] = createSeedMaterialViews();

// Initial Seed Comments
const SEED_COMMENTS: Comment[] = [
  {
    id: 'cmt_1',
    targetId: 'anc_1',
    targetType: 'announcement',
    authorId: 'usr_student_1',
    authorName: 'Aarav Sharma',
    authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    authorRole: 'student',
    content: 'Thank you Dr. Kulkarni! Looking forward to this course.',
    createdAt: '2026-08-09T09:30:00Z',
  },
  {
    id: 'cmt_2',
    targetId: 'asg_os_1',
    targetType: 'assignment_private',
    authorId: 'usr_student_1',
    authorName: 'Aarav Sharma',
    authorRole: 'student',
    studentIdForPrivate: 'usr_student_1',
    content: 'Dr. Kulkarni, should we submit standard C source files or compiled binaries for the process lab?',
    createdAt: '2026-08-11T12:00:00Z',
  },
  {
    id: 'cmt_3',
    targetId: 'asg_os_1',
    targetType: 'assignment_private',
    authorId: 'usr_teacher_1',
    authorName: 'Dr. Amit Kulkarni',
    authorRole: 'teacher',
    studentIdForPrivate: 'usr_student_1',
    content: 'Please submit source files (.c) alongside your PDF report.',
    createdAt: '2026-08-11T13:10:00Z',
  },
];

// Initial Seed Notifications
const SEED_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif_1',
    userId: 'usr_student_1',
    type: 'assignment_graded',
    title: 'Assignment Graded',
    message: 'Dr. Amit Kulkarni graded Process Management: 92/100',
    read: false,
    createdAt: '2026-08-11T20:00:00Z',
  },
  {
    id: 'notif_2',
    userId: 'usr_student_1',
    type: 'assignment_published',
    title: 'New Assignment Posted',
    message: 'CPU Scheduling Algorithms has been posted in Operating Systems.',
    read: true,
    createdAt: '2026-08-11T14:00:00Z',
  },
];

// Initial Calendar Events
const SEED_EVENTS: CalendarEvent[] = [
  {
    id: 'evt_1',
    title: 'Process Management Due',
    classId: 'cls_os_101',
    className: 'Operating Systems',
    date: '2026-08-20',
    time: '23:59',
    type: 'assignment',
    assignmentId: 'asg_os_1',
    color: '#2563EB',
  },
  {
    id: 'evt_2',
    title: 'CPU Scheduling Lab Due',
    classId: 'cls_os_101',
    className: 'Operating Systems',
    date: '2026-08-25',
    time: '23:59',
    type: 'assignment',
    assignmentId: 'asg_os_2',
    color: '#2563EB',
  },
  {
    id: 'evt_3',
    title: 'Linked List Implementation Due',
    classId: 'cls_ds_102',
    className: 'Data Structures',
    date: '2026-08-18',
    time: '23:59',
    type: 'assignment',
    assignmentId: 'asg_ds_1',
    color: '#059669',
  },
];

// Initial Seed Topics for Classes
export const SEED_TOPICS: Topic[] = [
  { id: 'top_1', classId: 'cls_os_101', name: 'Process & Threads', createdAt: '2026-08-01T00:00:00Z' },
  { id: 'top_2', classId: 'cls_os_101', name: 'CPU Scheduling', createdAt: '2026-08-01T00:00:00Z' },
  { id: 'top_3', classId: 'cls_ds_102', name: 'Linear Structures', createdAt: '2026-08-01T00:00:00Z' },
  { id: 'top_4', classId: 'cls_ds_102', name: 'Trees & Graphs', createdAt: '2026-08-01T00:00:00Z' },
  { id: 'top_5', classId: 'cls_dbms_103', name: 'Relational SQL', createdAt: '2026-08-01T00:00:00Z' },
  { id: 'top_6', classId: 'cls_dbms_103', name: 'Database Design', createdAt: '2026-08-01T00:00:00Z' },
  { id: 'top_7', classId: 'cls_cn_104', name: 'Network Layers', createdAt: '2026-08-01T00:00:00Z' },
  { id: 'top_8', classId: 'cls_cn_104', name: 'Transport Protocols', createdAt: '2026-08-01T00:00:00Z' },
  { id: 'top_9', classId: 'cls_java_105', name: 'Object-Oriented Programming', createdAt: '2026-08-01T00:00:00Z' },
  { id: 'top_10', classId: 'cls_java_105', name: 'Exception Management', createdAt: '2026-08-01T00:00:00Z' },
];

// Event Bus for Realtime Store Sync
type Listener = () => void;
const listeners: Set<Listener> = new Set();

export function subscribeToStore(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notifyStore() {
  listeners.forEach((fn) => fn());
}

// Local Storage Helper with automatic Seed initialization & Migration
export class StorageService {
  private static get<T>(key: string, defaultData: T): T {
    try {
      const val = localStorage.getItem(key);
      if (!val) {
        localStorage.setItem(key, JSON.stringify(defaultData));
        return defaultData;
      }
      return JSON.parse(val);
    } catch {
      return defaultData;
    }
  }

  private static set<T>(key: string, data: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      notifyStore();
    } catch (e) {
      console.error('Storage write error', e);
    }
  }

  public static initializeSeedData() {
    const rawUsers = localStorage.getItem(STORAGE_KEYS.USERS);
    // Auto-migrate if old seed names (like Sarthak or Sarah) exist in cached storage
    const needsMigration = !rawUsers || rawUsers.includes('Sarthak') || rawUsers.includes('Sarah Jenkins') || !rawUsers.includes('Amit Kulkarni');

    if (needsMigration) {
      this.resetToSeed();
      return;
    }

    if (!localStorage.getItem(STORAGE_KEYS.CLASSES)) {
      this.set(STORAGE_KEYS.CLASSES, SEED_CLASSES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.MEMBERS)) {
      this.set(STORAGE_KEYS.MEMBERS, SEED_MEMBERS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS)) {
      this.set(STORAGE_KEYS.ASSIGNMENTS, SEED_ASSIGNMENTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.MATERIALS)) {
      this.set(STORAGE_KEYS.MATERIALS, SEED_MATERIALS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.TOPICS)) {
      this.set(STORAGE_KEYS.TOPICS, SEED_TOPICS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.VIEWS)) {
      this.set(STORAGE_KEYS.VIEWS, SEED_VIEWS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.MATERIAL_VIEWS)) {
      this.set(STORAGE_KEYS.MATERIAL_VIEWS, SEED_MATERIAL_VIEWS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SUBMISSIONS)) {
      this.set(STORAGE_KEYS.SUBMISSIONS, SEED_SUBMISSIONS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS)) {
      this.set(STORAGE_KEYS.ANNOUNCEMENTS, SEED_ANNOUNCEMENTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.COMMENTS)) {
      this.set(STORAGE_KEYS.COMMENTS, SEED_COMMENTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
      this.set(STORAGE_KEYS.NOTIFICATIONS, SEED_NOTIFICATIONS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.EVENTS)) {
      this.set(STORAGE_KEYS.EVENTS, SEED_EVENTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
      this.set(STORAGE_KEYS.CURRENT_USER, SEED_USERS[6]); // Default to Aarav Sharma (Student)
    }
  }

  public static resetToSeed() {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(SEED_USERS));
    localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(SEED_CLASSES));
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(SEED_MEMBERS));
    localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(SEED_ASSIGNMENTS));
    localStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(SEED_MATERIALS));
    localStorage.setItem(STORAGE_KEYS.TOPICS, JSON.stringify(SEED_TOPICS));
    localStorage.setItem(STORAGE_KEYS.VIEWS, JSON.stringify(SEED_VIEWS));
    localStorage.setItem(STORAGE_KEYS.MATERIAL_VIEWS, JSON.stringify(SEED_MATERIAL_VIEWS));
    localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(SEED_SUBMISSIONS));
    localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(SEED_ANNOUNCEMENTS));
    localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(SEED_COMMENTS));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(SEED_NOTIFICATIONS));
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(SEED_EVENTS));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(SEED_USERS[6])); // Aarav Sharma
    notifyStore();
  }

  // Users
  public static getUsers(): User[] {
    return this.get(STORAGE_KEYS.USERS, SEED_USERS);
  }

  public static getCurrentUser(): User | null {
    return this.get<User | null>(STORAGE_KEYS.CURRENT_USER, SEED_USERS[6]);
  }

  public static setCurrentUser(user: User | null): void {
    this.set(STORAGE_KEYS.CURRENT_USER, user);
  }

  public static updateUserStatus(userId: string, status: 'active' | 'suspended'): void {
    const users = this.getUsers();
    const updated = users.map((u) => (u.id === userId ? { ...u, status } : u));
    this.set(STORAGE_KEYS.USERS, updated);
  }

  public static deleteUser(userId: string): void {
    const users = this.getUsers().filter((u) => u.id !== userId);
    this.set(STORAGE_KEYS.USERS, users);
  }

  public static registerUser(name: string, email: string, role: UserRole): User {
    const users = this.getUsers();
    const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      throw new Error('An account with this email already exists.');
    }
    const newUser: User = {
      id: `usr_${Date.now()}`,
      name,
      email,
      role,
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    this.set(STORAGE_KEYS.USERS, [...users, newUser]);
    this.setCurrentUser(newUser);
    return newUser;
  }

  // Classes
  public static getClasses(): Class[] {
    return this.get(STORAGE_KEYS.CLASSES, SEED_CLASSES);
  }

  public static createClass(teacher: User, data: { name: string; subject: string; section: string; room?: string; description?: string }): Class {
    const classes = this.getClasses();
    const newClass: Class = {
      id: `cls_${Date.now()}`,
      teacherId: teacher.id,
      teacherName: teacher.name,
      teacherAvatar: teacher.avatar,
      name: data.name,
      subject: data.subject,
      section: data.section,
      room: data.room || '',
      description: data.description || '',
      classCode: generateClassCode(),
      bannerColor: 'from-blue-600 to-indigo-700',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const updatedClasses = [newClass, ...classes];
    this.set(STORAGE_KEYS.CLASSES, updatedClasses);

    // Add teacher as member
    const members = this.getMembers();
    const teacherMember: ClassMember = {
      id: `m_${Date.now()}`,
      classId: newClass.id,
      userId: teacher.id,
      userName: teacher.name,
      userEmail: teacher.email,
      userAvatar: teacher.avatar,
      role: 'teacher',
      joinedAt: new Date().toISOString(),
    };
    this.set(STORAGE_KEYS.MEMBERS, [...members, teacherMember]);

    return newClass;
  }

  public static joinClass(student: User, classCode: string): Class {
    const classes = this.getClasses();
    const targetClass = classes.find((c) => c.classCode.toUpperCase() === classCode.trim().toUpperCase());
    if (!targetClass) {
      throw new Error('Invalid class code. Please check with your teacher.');
    }

    const members = this.getMembers();
    const alreadyJoined = members.some((m) => m.classId === targetClass.id && m.userId === student.id);
    if (alreadyJoined) {
      throw new Error('You are already enrolled in this class.');
    }

    const newMember: ClassMember = {
      id: `m_${Date.now()}`,
      classId: targetClass.id,
      userId: student.id,
      userName: student.name,
      userEmail: student.email,
      userAvatar: student.avatar,
      role: 'student',
      joinedAt: new Date().toISOString(),
    };

    this.set(STORAGE_KEYS.MEMBERS, [...members, newMember]);
    return targetClass;
  }

  public static updateClass(classId: string, updates: Partial<Class>): Class {
    const classes = this.getClasses();
    const index = classes.findIndex((c) => c.id === classId);
    if (index === -1) throw new Error('Class not found');
    const updatedClass: Class = {
      ...classes[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    classes[index] = updatedClass;
    this.set(STORAGE_KEYS.CLASSES, [...classes]);
    return updatedClass;
  }

  public static deleteClass(classId: string): void {
    const classes = this.getClasses().filter((c) => c.id !== classId);
    this.set(STORAGE_KEYS.CLASSES, classes);

    // Remove associated members
    const members = this.getMembers().filter((m) => m.classId !== classId);
    this.set(STORAGE_KEYS.MEMBERS, members);

    // Remove associated assignments
    const assignments = this.getAssignments().filter((a) => a.classId !== classId);
    this.set(STORAGE_KEYS.ASSIGNMENTS, assignments);

    // Remove associated announcements
    const announcements = this.getAnnouncements().filter((a) => a.classId !== classId);
    this.set(STORAGE_KEYS.ANNOUNCEMENTS, announcements);

    // Remove associated topics
    const topics = this.getTopics().filter((t) => t.classId !== classId);
    this.set(STORAGE_KEYS.TOPICS, topics);
  }

  public static generateNewClassCode(classId: string): string {
    const newCode = generateClassCode();
    this.updateClass(classId, { classCode: newCode });
    return newCode;
  }

  public static leaveClass(classId: string, studentId: string): void {
    this.removeMember(classId, studentId);
  }

  // Topics
  public static getTopics(classId?: string): Topic[] {
    const list = this.get(STORAGE_KEYS.TOPICS, SEED_TOPICS);
    if (!classId) return list;
    return list.filter((t) => t.classId === classId);
  }

  public static createTopic(classId: string, name: string): Topic {
    const topics = this.getTopics();
    const newTopic: Topic = {
      id: `top_${Date.now()}`,
      classId,
      name: name.trim(),
      createdAt: new Date().toISOString(),
    };
    this.set(STORAGE_KEYS.TOPICS, [...topics, newTopic]);
    return newTopic;
  }

  public static updateTopic(topicId: string, name: string): Topic {
    const topics = this.getTopics();
    const idx = topics.findIndex((t) => t.id === topicId);
    if (idx === -1) throw new Error('Topic not found');
    const oldName = topics[idx].name;
    const updatedTopic: Topic = {
      ...topics[idx],
      name: name.trim(),
    };
    topics[idx] = updatedTopic;
    this.set(STORAGE_KEYS.TOPICS, [...topics]);

    // Also update assignments with this topic name
    const assignments = this.getAssignments();
    let asgUpdated = false;
    const nextAsgs = assignments.map((a) => {
      if (a.topic === oldName) {
        asgUpdated = true;
        return { ...a, topic: name.trim(), updatedAt: new Date().toISOString() };
      }
      return a;
    });
    if (asgUpdated) {
      this.set(STORAGE_KEYS.ASSIGNMENTS, nextAsgs);
    }

    return updatedTopic;
  }

  public static deleteTopic(topicId: string): void {
    const topics = this.getTopics();
    const target = topics.find((t) => t.id === topicId);
    if (!target) return;
    this.set(STORAGE_KEYS.TOPICS, topics.filter((t) => t.id !== topicId));

    // Reset assignments that had this topic
    const assignments = this.getAssignments();
    const nextAsgs = assignments.map((a) => {
      if (a.topic === target.name) {
        return { ...a, topic: undefined, updatedAt: new Date().toISOString() };
      }
      return a;
    });
    this.set(STORAGE_KEYS.ASSIGNMENTS, nextAsgs);
  }

  // Members
  public static getMembers(): ClassMember[] {
    return this.get(STORAGE_KEYS.MEMBERS, SEED_MEMBERS);
  }

  public static removeMember(classId: string, userId: string): void {
    const members = this.getMembers().filter((m) => !(m.classId === classId && m.userId === userId));
    this.set(STORAGE_KEYS.MEMBERS, members);
  }

  // Assignments
  public static getAssignments(): Assignment[] {
    return this.get(STORAGE_KEYS.ASSIGNMENTS, SEED_ASSIGNMENTS);
  }

  public static createAssignment(assignment: Omit<Assignment, 'id' | 'createdAt' | 'updatedAt'>): Assignment {
    const assignments = this.getAssignments();
    const newAssignment: Assignment = {
      ...assignment,
      id: `asg_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.set(STORAGE_KEYS.ASSIGNMENTS, [newAssignment, ...assignments]);

    // Create Calendar Event
    if (newAssignment.dueDate) {
      const events = this.getEvents();
      const newEvent: CalendarEvent = {
        id: `evt_${Date.now()}`,
        title: `${newAssignment.title} Due`,
        classId: newAssignment.classId,
        className: newAssignment.className,
        date: newAssignment.dueDate.split('T')[0],
        time: newAssignment.dueTime || '23:59',
        type: 'assignment',
        assignmentId: newAssignment.id,
        color: '#2563EB',
      };
      this.set(STORAGE_KEYS.EVENTS, [...events, newEvent]);
    }

    // Notify Students in Class
    const members = this.getMembers().filter((m) => m.classId === newAssignment.classId && m.role === 'student');
    const notifications = this.getNotifications();
    const newNotifications: Notification[] = members.map((m) => ({
      id: `notif_${Date.now()}_${m.userId}`,
      userId: m.userId,
      type: 'assignment_published',
      title: 'New Assignment Posted',
      message: `${newAssignment.teacherName} posted: "${newAssignment.title}" in ${newAssignment.className}`,
      read: false,
      linkUrl: `/assignments/${newAssignment.id}`,
      createdAt: new Date().toISOString(),
    }));

    this.set(STORAGE_KEYS.NOTIFICATIONS, [...newNotifications, ...notifications]);

    return newAssignment;
  }

  public static updateAssignment(assignmentId: string, updates: Partial<Assignment>): Assignment {
    const assignments = this.getAssignments();
    const idx = assignments.findIndex((a) => a.id === assignmentId);
    if (idx === -1) throw new Error('Assignment not found');
    const updatedAsg: Assignment = {
      ...assignments[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    assignments[idx] = updatedAsg;
    this.set(STORAGE_KEYS.ASSIGNMENTS, [...assignments]);

    // Update calendar event if title or dueDate changed
    if (updates.dueDate || updates.title) {
      const events = this.getEvents();
      const updatedEvents = events.map((e) => {
        if (e.assignmentId === assignmentId) {
          return {
            ...e,
            title: updates.title ? `${updates.title} Due` : e.title,
            date: updates.dueDate ? updates.dueDate.split('T')[0] : e.date,
            time: updates.dueTime || e.time,
          };
        }
        return e;
      });
      this.set(STORAGE_KEYS.EVENTS, updatedEvents);
    }

    return updatedAsg;
  }

  public static deleteAssignment(assignmentId: string): void {
    const assignments = this.getAssignments().filter((a) => a.id !== assignmentId);
    this.set(STORAGE_KEYS.ASSIGNMENTS, assignments);

    // Remove views, submissions, and calendar events
    const views = this.getAssignmentViews().filter((v) => v.assignmentId !== assignmentId);
    this.set(STORAGE_KEYS.VIEWS, views);

    const submissions = this.getSubmissions().filter((s) => s.assignmentId !== assignmentId);
    this.set(STORAGE_KEYS.SUBMISSIONS, submissions);

    const events = this.getEvents().filter((e) => e.assignmentId !== assignmentId);
    this.set(STORAGE_KEYS.EVENTS, events);
  }

  // ASSIGNMENT SEEN TRACKING - CORE FEATURE
  public static recordAssignmentView(assignmentId: string, student: User): AssignmentView {
    const asg = this.getAssignments().find((a) => a.id === assignmentId);
    if (asg) {
      this.recordMaterialView(assignmentId, asg.classId, student);
    }

    const views = this.get(STORAGE_KEYS.VIEWS, SEED_VIEWS);
    const viewId = `${assignmentId}_${student.id}`;
    const existingIndex = views.findIndex((v) => v.id === viewId || (v.assignmentId === assignmentId && v.studentId === student.id));

    const now = new Date().toISOString();

    if (existingIndex >= 0) {
      const existing = views[existingIndex];
      const updatedView: AssignmentView = {
        ...existing,
        lastSeenAt: now,
        viewCount: (existing.viewCount || 1) + 1,
      };
      views[existingIndex] = updatedView;
      this.set(STORAGE_KEYS.VIEWS, [...views]);
      return updatedView;
    } else {
      const newView: AssignmentView = {
        id: viewId,
        assignmentId,
        studentId: student.id,
        studentName: student.name,
        studentEmail: student.email,
        studentAvatar: student.avatar,
        firstSeenAt: now,
        lastSeenAt: now,
        viewCount: 1,
      };
      this.set(STORAGE_KEYS.VIEWS, [newView, ...views]);
      return newView;
    }
  }

  public static getAssignmentViews(assignmentId?: string): AssignmentView[] {
    const views = this.get(STORAGE_KEYS.VIEWS, SEED_VIEWS);
    if (!assignmentId) return views;
    return views.filter((v) => v.assignmentId === assignmentId);
  }

  // GENERAL MATERIAL SEEN TRACKING (WhatsApp-style: Assignments, Announcements, Notes, PDFs, Links)
  public static recordMaterialView(materialId: string, classId: string, student: User): MaterialView {
    const matViews = this.get<MaterialView[]>(STORAGE_KEYS.MATERIAL_VIEWS, SEED_MATERIAL_VIEWS);
    const viewId = `${materialId}_${student.id}`;
    const existingIndex = matViews.findIndex((v) => v.id === viewId || (v.materialId === materialId && v.studentId === student.id));

    const now = new Date().toISOString();

    if (existingIndex >= 0) {
      const existing = matViews[existingIndex];
      const updatedView: MaterialView = {
        ...existing,
        seen: true,
        lastSeenAt: now,
        viewCount: (existing.viewCount || 1) + 1,
      };
      matViews[existingIndex] = updatedView;
      this.set(STORAGE_KEYS.MATERIAL_VIEWS, [...matViews]);
      return updatedView;
    } else {
      const newView: MaterialView = {
        id: viewId,
        materialId,
        classId,
        studentId: student.id,
        studentName: student.name,
        studentEmail: student.email,
        studentAvatar: student.avatar,
        seen: true,
        firstSeenAt: now,
        lastSeenAt: now,
        viewCount: 1,
      };
      this.set(STORAGE_KEYS.MATERIAL_VIEWS, [newView, ...matViews]);
      return newView;
    }
  }

  public static getMaterialViews(materialId?: string): MaterialView[] {
    const views = this.get<MaterialView[]>(STORAGE_KEYS.MATERIAL_VIEWS, SEED_MATERIAL_VIEWS);
    if (!materialId) return views;
    return views.filter((v) => v.materialId === materialId);
  }

  // Study Materials Management (Notes, PDFs, Documents, Links, Videos)
  public static getMaterials(classId?: string): Material[] {
    const materials = this.get<Material[]>(STORAGE_KEYS.MATERIALS, SEED_MATERIALS);
    if (!classId) return materials;
    return materials.filter((m) => m.classId === classId);
  }

  public static createMaterial(
    user: User, 
    data: Omit<Material, 'id' | 'createdAt' | 'updatedAt' | 'seenBy'>
  ): Material {
    const materials = this.get<Material[]>(STORAGE_KEYS.MATERIALS, SEED_MATERIALS);
    const newMaterial: Material = {
      ...data,
      id: `mat_${Date.now()}`,
      teacherId: user.id,
      teacherName: user.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      seenBy: [],
    };
    this.set(STORAGE_KEYS.MATERIALS, [newMaterial, ...materials]);
    return newMaterial;
  }

  public static updateMaterial(materialId: string, data: Partial<Material>): Material {
    const materials = this.get<Material[]>(STORAGE_KEYS.MATERIALS, SEED_MATERIALS);
    const index = materials.findIndex((m) => m.id === materialId);
    if (index === -1) throw new Error('Material not found');
    const updated = { ...materials[index], ...data, updatedAt: new Date().toISOString() };
    materials[index] = updated;
    this.set(STORAGE_KEYS.MATERIALS, [...materials]);
    return updated;
  }

  public static deleteMaterial(materialId: string): void {
    const materials = this.get<Material[]>(STORAGE_KEYS.MATERIALS, SEED_MATERIALS);
    this.set(STORAGE_KEYS.MATERIALS, materials.filter((m) => m.id !== materialId));

    // Clean up associated views
    const views = this.get<MaterialView[]>(STORAGE_KEYS.MATERIAL_VIEWS, SEED_MATERIAL_VIEWS);
    this.set(STORAGE_KEYS.MATERIAL_VIEWS, views.filter((v) => v.materialId !== materialId));
  }

  // Submissions
  public static getSubmissions(assignmentId?: string): Submission[] {
    const subs = this.get(STORAGE_KEYS.SUBMISSIONS, SEED_SUBMISSIONS);
    if (!assignmentId) return subs;
    return subs.filter((s) => s.assignmentId === assignmentId);
  }

  public static submitAssignment(student: User, assignmentId: string, attachments: any[], textResponse?: string): Submission {
    const subs = this.getSubmissions();
    const existingIndex = subs.findIndex((s) => s.assignmentId === assignmentId && s.studentId === student.id);
    const now = new Date().toISOString();

    const submissionData: Submission = {
      id: existingIndex >= 0 ? subs[existingIndex].id : `sub_${Date.now()}`,
      assignmentId,
      studentId: student.id,
      studentName: student.name,
      studentEmail: student.email,
      studentAvatar: student.avatar,
      submittedAt: now,
      attachments,
      textResponse,
      status: 'submitted',
    };

    let updatedSubs: Submission[];
    if (existingIndex >= 0) {
      updatedSubs = [...subs];
      updatedSubs[existingIndex] = submissionData;
    } else {
      updatedSubs = [submissionData, ...subs];
    }

    this.set(STORAGE_KEYS.SUBMISSIONS, updatedSubs);

    // Notify Teacher
    const assignment = this.getAssignments().find((a) => a.id === assignmentId);
    if (assignment) {
      const notifications = this.getNotifications();
      const teacherNotif: Notification = {
        id: `notif_${Date.now()}`,
        userId: assignment.teacherId,
        type: 'submission_received',
        title: 'New Submission',
        message: `${student.name} turned in "${assignment.title}"`,
        read: false,
        linkUrl: `/assignments/${assignmentId}`,
        createdAt: now,
      };
      this.set(STORAGE_KEYS.NOTIFICATIONS, [teacherNotif, ...notifications]);
    }

    return submissionData;
  }

  public static gradeSubmission(submissionId: string, grade: number, feedback: string): Submission {
    const subs = this.getSubmissions();
    const subIndex = subs.findIndex((s) => s.id === submissionId);
    if (subIndex === -1) throw new Error('Submission not found');

    const updatedSub: Submission = {
      ...subs[subIndex],
      grade,
      feedback,
      status: 'graded',
    };

    subs[subIndex] = updatedSub;
    this.set(STORAGE_KEYS.SUBMISSIONS, [...subs]);

    // Notify Student
    const assignment = this.getAssignments().find((a) => a.id === updatedSub.assignmentId);
    const notifications = this.getNotifications();
    const studentNotif: Notification = {
      id: `notif_${Date.now()}`,
      userId: updatedSub.studentId,
      type: 'assignment_graded',
      title: 'Assignment Graded',
      message: `${assignment ? assignment.teacherName : 'Your teacher'} graded "${assignment?.title || 'Assignment'}": ${grade}/${assignment?.points || 100}`,
      read: false,
      linkUrl: `/assignments/${updatedSub.assignmentId}`,
      createdAt: new Date().toISOString(),
    };
    this.set(STORAGE_KEYS.NOTIFICATIONS, [studentNotif, ...notifications]);

    return updatedSub;
  }

  public static unsubmitAssignment(submissionId: string): void {
    const subs = this.getSubmissions();
    const updated = subs.filter((s) => s.id !== submissionId);
    this.set(STORAGE_KEYS.SUBMISSIONS, updated);
  }

  // Announcements
  public static getAnnouncements(classId?: string): Announcement[] {
    const list = this.get(STORAGE_KEYS.ANNOUNCEMENTS, SEED_ANNOUNCEMENTS);
    if (!classId) return list;
    return list.filter((a) => a.classId === classId);
  }

  public static createAnnouncement(author: User, classId: string, content: string, attachments: any[]): Announcement {
    const announcements = this.getAnnouncements();
    const newAnc: Announcement = {
      id: `anc_${Date.now()}`,
      classId,
      authorId: author.id,
      authorName: author.name,
      authorAvatar: author.avatar,
      authorRole: author.role,
      content,
      attachments,
      createdAt: new Date().toISOString(),
      commentsCount: 0,
    };

    this.set(STORAGE_KEYS.ANNOUNCEMENTS, [newAnc, ...announcements]);
    return newAnc;
  }

  public static updateAnnouncement(announcementId: string, content: string): Announcement {
    const list = this.getAnnouncements();
    const idx = list.findIndex((a) => a.id === announcementId);
    if (idx === -1) throw new Error('Announcement not found');
    const updated: Announcement = { ...list[idx], content };
    list[idx] = updated;
    this.set(STORAGE_KEYS.ANNOUNCEMENTS, [...list]);
    return updated;
  }

  public static deleteAnnouncement(announcementId: string): void {
    const list = this.getAnnouncements().filter((a) => a.id !== announcementId);
    this.set(STORAGE_KEYS.ANNOUNCEMENTS, list);
    // Also remove comments attached to this announcement
    const comments = this.get(STORAGE_KEYS.COMMENTS, SEED_COMMENTS).filter((c) => c.targetId !== announcementId);
    this.set(STORAGE_KEYS.COMMENTS, comments);
  }

  // Comments
  public static getComments(targetId: string, studentIdForPrivate?: string): Comment[] {
    const comments = this.get(STORAGE_KEYS.COMMENTS, SEED_COMMENTS);
    return comments.filter((c) => {
      if (c.targetId !== targetId) return false;
      if (c.targetType === 'assignment_private') {
        if (!studentIdForPrivate) return true;
        return c.studentIdForPrivate === studentIdForPrivate;
      }
      return true;
    });
  }

  public static addComment(
    author: User,
    targetId: string,
    targetType: 'announcement' | 'assignment_class' | 'assignment_private',
    content: string,
    studentIdForPrivate?: string
  ): Comment {
    const comments = this.get(STORAGE_KEYS.COMMENTS, SEED_COMMENTS);
    const newComment: Comment = {
      id: `cmt_${Date.now()}`,
      targetId,
      targetType,
      authorId: author.id,
      authorName: author.name,
      authorAvatar: author.avatar,
      authorRole: author.role,
      studentIdForPrivate,
      content,
      createdAt: new Date().toISOString(),
    };

    this.set(STORAGE_KEYS.COMMENTS, [...comments, newComment]);
    return newComment;
  }

  public static deleteComment(commentId: string): void {
    const comments = this.get(STORAGE_KEYS.COMMENTS, SEED_COMMENTS).filter((c) => c.id !== commentId);
    this.set(STORAGE_KEYS.COMMENTS, comments);
  }

  // Notifications
  public static createNotification(
    userId: string,
    type: 'assignment_published' | 'assignment_due' | 'assignment_graded' | 'announcement' | 'class_invitation' | 'submission_received',
    title: string,
    message: string,
    linkUrl?: string
  ): Notification {
    const notifications = this.get<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, SEED_NOTIFICATIONS);
    const newNotif: Notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId,
      type,
      title,
      message,
      read: false,
      linkUrl,
      createdAt: new Date().toISOString(),
    };
    this.set(STORAGE_KEYS.NOTIFICATIONS, [newNotif, ...notifications]);
    return newNotif;
  }

  public static getNotifications(userId?: string): Notification[] {
    const list = this.get(STORAGE_KEYS.NOTIFICATIONS, SEED_NOTIFICATIONS);
    if (!userId) return list;
    return list.filter((n) => n.userId === userId);
  }

  public static markNotificationRead(notifId: string): void {
    const list = this.getNotifications();
    const updated = list.map((n) => (n.id === notifId ? { ...n, read: true } : n));
    this.set(STORAGE_KEYS.NOTIFICATIONS, updated);
  }

  public static markAllNotificationsRead(userId: string): void {
    const list = this.getNotifications();
    const updated = list.map((n) => (n.userId === userId ? { ...n, read: true } : n));
    this.set(STORAGE_KEYS.NOTIFICATIONS, updated);
  }

  public static deleteNotification(notifId: string): void {
    const list = this.getNotifications().filter((n) => n.id !== notifId);
    this.set(STORAGE_KEYS.NOTIFICATIONS, list);
  }

  // Events
  public static getEvents(): CalendarEvent[] {
    return this.get(STORAGE_KEYS.EVENTS, SEED_EVENTS);
  }

  // Data Management: Export / Import / Clear
  public static exportAllData(): string {
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      users: this.getUsers(),
      classes: this.getClasses(),
      members: this.getMembers(),
      assignments: this.getAssignments(),
      materials: this.getMaterials(),
      topics: this.getTopics(),
      views: this.getAssignmentViews(),
      materialViews: this.getMaterialViews(),
      submissions: this.getSubmissions(),
      announcements: this.getAnnouncements(),
      comments: this.get(STORAGE_KEYS.COMMENTS, SEED_COMMENTS),
      notifications: this.getNotifications(),
      events: this.getEvents(),
    };
    return JSON.stringify(data, null, 2);
  }

  public static importAllData(jsonStr: string): boolean {
    try {
      const data = JSON.parse(jsonStr);
      if (!data.classes || !data.assignments) {
        throw new Error('Invalid backup file. Missing essential ClassFlow classes or assignments.');
      }
      if (Array.isArray(data.users)) localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(data.users));
      if (Array.isArray(data.classes)) localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(data.classes));
      if (Array.isArray(data.members)) localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(data.members));
      if (Array.isArray(data.assignments)) localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(data.assignments));
      if (Array.isArray(data.materials)) localStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(data.materials));
      if (Array.isArray(data.topics)) localStorage.setItem(STORAGE_KEYS.TOPICS, JSON.stringify(data.topics));
      if (Array.isArray(data.views)) localStorage.setItem(STORAGE_KEYS.VIEWS, JSON.stringify(data.views));
      if (Array.isArray(data.materialViews)) localStorage.setItem(STORAGE_KEYS.MATERIAL_VIEWS, JSON.stringify(data.materialViews));
      if (Array.isArray(data.submissions)) localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(data.submissions));
      if (Array.isArray(data.announcements)) localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(data.announcements));
      if (Array.isArray(data.comments)) localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(data.comments));
      if (Array.isArray(data.notifications)) localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(data.notifications));
      if (Array.isArray(data.events)) localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(data.events));
      notifyStore();
      return true;
    } catch (e: any) {
      console.error('Import failed', e);
      throw new Error(e.message || 'Failed to import JSON data.');
    }
  }

  public static clearAllData(): void {
    Object.values(STORAGE_KEYS).forEach((k) => {
      localStorage.removeItem(k);
    });
    notifyStore();
  }
}

// Ensure seed data on module import
StorageService.initializeSeedData();
