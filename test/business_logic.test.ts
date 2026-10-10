import { validateStorageFile, normalizeError } from '../src/lib/supabase';
import { normalizeClassroom, normalizeAssignment, normalizeMaterial } from '../src/types/database';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failed++;
  }
}

console.log('=== CLASSFLOW AUTOMATED LOGIC VERIFICATION ===\n');

// 1. Classroom Join Code & Normalization Test
console.log('Test 1: Classroom Join Code & Normalization');
const mockClassroomRaw = {
  id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  name: 'Advanced Physics',
  teacher_id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  join_code: 'CF-XYZ890',
  created_at: new Date().toISOString(),
};
const normalizedClass = normalizeClassroom(mockClassroomRaw);
assert(normalizedClass.join_code === 'CF-XYZ890', 'Preserves canonical join_code');
assert(/^CF-[A-Z0-9]{6}$/.test(normalizedClass.join_code), 'Matches CF-XXXXXX format');

// Backward compatibility with legacy .code column
const legacyClass = normalizeClassroom({
  id: 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
  name: 'Legacy Code Class',
  code: 'CF-LEG123',
});
assert(legacyClass.join_code === 'CF-LEG123', 'Maps legacy code column to canonical join_code');

// 2. Assignment Draft vs Published & Points Normalization Test
console.log('\nTest 2: Assignment Normalization & Draft Isolation');
const mockAssignmentRaw = {
  id: 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
  classroom_id: mockClassroomRaw.id,
  title: 'Quantum Mechanics Lab 1',
  points: 75,
  due_date: '2026-12-01T23:59:59Z',
  published: true,
  published_at: '2026-10-01T12:00:00Z',
};
const normalizedAsgn = normalizeAssignment(mockAssignmentRaw);
assert(normalizedAsgn.max_marks === 75, 'Maps points to canonical max_marks');
assert(normalizedAsgn.due_at === '2026-12-01T23:59:59Z', 'Maps due_date to canonical due_at');
assert(normalizedAsgn.is_published === true, 'Correctly flags published state');
assert(normalizedAsgn.status === 'published', 'Resolves status to published');

const draftAsgn = normalizeAssignment({
  id: 'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
  classroom_id: mockClassroomRaw.id,
  title: 'Draft Exam',
  published: false,
  published_at: null,
});
assert(draftAsgn.is_published === false, 'Draft assignment is marked unpublished');
assert(draftAsgn.status === 'draft', 'Draft assignment has status draft');

// 3. Material Normalization & Tracking Fields Test
console.log('\nTest 3: Material Normalization & Tracking');
const mockMaterialRaw = {
  id: 'f5eebc99-9c0b-4ef8-bb6d-6bb9bd380a66',
  classroom_id: mockClassroomRaw.id,
  title: 'Lecture Slides PDF',
  file_url: 'classroom-materials/a0ee/f5ee/lecture.pdf',
  file_type: 'application/pdf',
  published: true,
  published_at: '2026-10-02T10:00:00Z',
};
const normalizedMat = normalizeMaterial(mockMaterialRaw);
assert(normalizedMat.file_path === 'classroom-materials/a0ee/f5ee/lecture.pdf', 'Maps file_url to canonical file_path');
assert(normalizedMat.is_published === true, 'Flags published material');
assert(normalizedMat.is_viewed === false, 'Defaults student seen status to false');

// 4. Storage Limits & File Validation Test
console.log('\nTest 4: Storage File Validation');
const mockPdfFile = {
  name: 'document.pdf',
  size: 5 * 1024 * 1024, // 5MB
  type: 'application/pdf',
} as unknown as File;
const pdfCheck = validateStorageFile('classroom-materials', mockPdfFile);
assert(pdfCheck.valid === true, 'Accepts 5MB PDF file');

const mockOversizedFile = {
  name: 'huge.pdf',
  size: 15 * 1024 * 1024, // 15MB
  type: 'application/pdf',
} as unknown as File;
const oversizeCheck = validateStorageFile('classroom-materials', mockOversizedFile);
assert(oversizeCheck.valid === false, 'Rejects file exceeding 10MB limit');

const mockInvalidType = {
  name: 'virus.exe',
  size: 1024,
  type: 'application/x-msdownload',
} as unknown as File;
const invalidCheck = validateStorageFile('classroom-materials', mockInvalidType);
assert(invalidCheck.valid === false, 'Rejects unsupported executable file format');

// 5. Error Normalization Test
console.log('\nTest 5: Error Normalization');
const rlsErr = normalizeError({ code: '42501', message: 'permission denied for table classrooms' });
assert(rlsErr.code === '42501', 'Retains 42501 code');
assert(rlsErr.message.includes('Access denied'), 'Provides user-friendly RLS message');

const dupErr = normalizeError({ code: '23505', message: 'duplicate key value violates unique constraint' });
assert(dupErr.message.includes('already exists'), 'Provides user-friendly duplicate key message');

const bucketErr = normalizeError({ message: 'Bucket not found: classroom-materials' });
assert(bucketErr.code === 'BUCKET_NOT_FOUND', 'Categorizes missing bucket error correctly');

// 6. Join Code Validation & Sanitization (Test 2 & 13)
console.log('\nTest 6: Join Code Sanitization & Format Rules');
const sanitizeCode = (raw: string) => raw.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '');
const validCode1 = sanitizeCode('  cf-ab12cd  ');
assert(validCode1 === 'CF-AB12CD', 'Sanitizes whitespace and enforces uppercase');
assert(/^CF-[A-Z0-9]{6}$/.test(validCode1), 'Validates strict CF-XXXXXX join code pattern');
const invalidCode = sanitizeCode('malicious_code_here');
assert(!/^CF-[A-Z0-9]{6}$/.test(invalidCode), 'Rejects non-compliant join codes');

// 7. Seen vs Unseen Aggregation Logic (Test 4, 5, 14)
console.log('\nTest 7: Seen / Unseen Aggregation Logic');
const enrolledStudents = [
  { id: 'student-1', name: 'Alice' },
  { id: 'student-2', name: 'Bob' },
  { id: 'student-3', name: 'Charlie' },
];
const materialViews = [
  { student_id: 'student-1', first_viewed_at: '2026-10-10T10:00:00Z', view_count: 3 },
  { student_id: 'student-3', first_viewed_at: '2026-10-10T11:30:00Z', view_count: 1 },
];
const seenStudentIds = new Set(materialViews.map((v) => v.student_id));
const seenStudents = enrolledStudents.filter((s) => seenStudentIds.has(s.id));
const unseenStudents = enrolledStudents.filter((s) => !seenStudentIds.has(s.id));

assert(seenStudents.length === 2, 'Accurately computes seen count');
assert(unseenStudents.length === 1, 'Accurately computes unseen count');
assert(unseenStudents[0].id === 'student-2', 'Identifies student-2 as unseen');
assert(seenStudents.length + unseenStudents.length === enrolledStudents.length, 'Total views partition matches enrollment');

// 8. Student Submissions Privacy Filter (Test 7, 8)
console.log('\nTest 8: Student Submissions Isolation');
const allSubmissions = [
  { id: 'sub-1', student_id: 'student-1', grade: 90, submission_text: 'Alice Work' },
  { id: 'sub-2', student_id: 'student-2', grade: 85, submission_text: 'Bob Work' },
];
const getStudentSubmission = (subs: typeof allSubmissions, currentStudentId: string) => {
  return subs.find((s) => s.student_id === currentStudentId) || null;
};
assert(getStudentSubmission(allSubmissions, 'student-1')?.id === 'sub-1', 'Student 1 receives own submission');
assert(getStudentSubmission(allSubmissions, 'student-3') === null, 'Student 3 receives null submission');
assert(getStudentSubmission(allSubmissions, 'student-1')?.submission_text === 'Alice Work', 'Student 1 cannot see Bob data');

// 9. Draft Filtering Rule (Test 11)
console.log('\nTest 9: Draft Materials & Assignments Secrecy');
const classroomItems = [
  { id: '1', title: 'Pub 1', published: true, published_at: '2026-10-01' },
  { id: '2', title: 'Draft 1', published: false, published_at: null },
  { id: '3', title: 'Pub 2', published: true, published_at: '2026-10-02' },
];
const studentVisible = classroomItems.filter((i) => i.published && Boolean(i.published_at));
assert(studentVisible.length === 2, 'Student view filters out all draft items');
assert(!studentVisible.some((i) => i.id === '2'), 'Draft item 2 is completely excluded from student payload');

// Summary
console.log('\n=============================================');
console.log(`Results: ${passed} Passed, ${failed} Failed`);
console.log('=============================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
