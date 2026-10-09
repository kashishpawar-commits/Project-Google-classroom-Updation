import React, { useState, useRef } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider, useData } from './context/DataContext';
import { AuthPage } from './components/auth/AuthPage';
import { AppShell } from './components/layout/AppShell';
import { StudentDashboard } from './components/dashboard/StudentDashboard';
import { TeacherDashboard } from './components/dashboard/TeacherDashboard';
import { ClassPage } from './components/classroom/ClassPage';
import { ClassCard } from './components/classroom/ClassCard';
import { AssignmentDetailPage } from './components/assignments/AssignmentDetailPage';
import { TeacherEngagementPanel } from './components/assignments/TeacherEngagementPanel';
import { TeacherMaterialsView } from './components/classroom/TeacherMaterialsView';
import { CalendarView } from './components/calendar/CalendarView';
import { CreateClassModal } from './components/classroom/CreateClassModal';
import { JoinClassModal } from './components/classroom/JoinClassModal';
import { CreateAssignmentModal } from './components/assignments/CreateAssignmentModal';
import { SubmissionsManagerModal } from './components/assignments/SubmissionsManagerModal';
import { StatusBadge } from './components/ui/StatusBadge';
import { DueSoonBadge } from './components/ui/DueSoonBadge';
import { formatDate, formatRelativeTime, isDueSoon } from './lib/utils';
import { StorageService } from './lib/storage';
import { 
  BookOpen, Plus, Users, Bell, GraduationCap, ShieldCheck, 
  Search, CheckCircle2, RotateCcw, Download, Upload, 
  Filter, FileText, Settings, User as UserIcon, Check, Trash2, Clock, AlertTriangle
} from 'lucide-react';

function AppContent() {
  const { user, switchUser, allUsers } = useAuth();
  const { 
    classes, members, assignments, views, submissions, 
    notifications, markNotificationRead, markAllNotificationsRead, deleteNotification,
    exportData, importData, resetDemoData, clearAllData 
  } = useData();

  // Navigation State
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);

  // Modal States
  const [createClassOpen, setCreateClassOpen] = useState(false);
  const [joinClassOpen, setJoinClassOpen] = useState(false);
  const [createAssignmentOpen, setCreateAssignmentOpen] = useState(false);
  const [submissionsManagerOpen, setSubmissionsManagerOpen] = useState(false);
  const [submissionsManagerAssignmentId, setSubmissionsManagerAssignmentId] = useState<string | null>(null);

  // Filters & Search State
  const [assignmentSearch, setAssignmentSearch] = useState('');
  const [assignmentClassFilter, setAssignmentClassFilter] = useState('all');
  const [assignmentDeadlineFilter, setAssignmentDeadlineFilter] = useState<'all' | 'due-soon' | 'overdue'>('all');

  // File import ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) {
    return <AuthPage />;
  }

  const handleNavigate = (view: string, id?: string) => {
    setActiveView(view);
    if (view === 'class' && id) {
      setSelectedClassId(id);
    } else if (view === 'assignment' && id) {
      setSelectedAssignmentId(id);
    }
  };

  const openSubmissionsForAssignment = (asgId: string) => {
    setSubmissionsManagerAssignmentId(asgId);
    setSubmissionsManagerOpen(true);
  };

  // Filter student/teacher classes
  const myClassMemberships = members.filter((m) => m.userId === user.id);
  const myClassIds = user.role === 'teacher' 
    ? classes.filter((c) => c.teacherId === user.id).map((c) => c.id)
    : myClassMemberships.map((m) => m.classId);
  
  const myClasses = classes.filter((c) => myClassIds.includes(c.id));

  // Export JSON backup
  const handleExportData = () => {
    const jsonStr = exportData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `classflow-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON backup
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        importData(content);
        alert('Data imported successfully!');
        window.location.reload();
      } catch (err: any) {
        alert(`Failed to import data: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  // Render Main Content according to active view
  const renderMainView = () => {
    switch (activeView) {
      case 'dashboard':
        if (user.role === 'admin') {
          return renderAdminPanel();
        }
        return user.role === 'teacher' ? (
          <TeacherDashboard
            onNavigate={handleNavigate}
            openCreateClassModal={() => setCreateClassOpen(true)}
            openCreateAssignmentModal={() => setCreateAssignmentOpen(true)}
          />
        ) : (
          <StudentDashboard
            onNavigate={handleNavigate}
            openJoinClassModal={() => setJoinClassOpen(true)}
          />
        );

      case 'classes':
        return (
          <div className="space-y-6 text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#DADCE0]">
              <div>
                <h1 className="text-2xl font-bold text-[#202124]">Classes</h1>
                <p className="text-xs text-[#5F6368]">
                  {user.role === 'teacher' ? 'Classes you teach' : 'Classes you are enrolled in'}
                </p>
              </div>
              <div>
                {user.role === 'teacher' ? (
                  <button
                    onClick={() => setCreateClassOpen(true)}
                    className="px-3.5 py-2 bg-[#1A73E8] hover:bg-[#1557B0] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Create Class
                  </button>
                ) : (
                  <button
                    onClick={() => setJoinClassOpen(true)}
                    className="px-3.5 py-2 bg-[#1A73E8] hover:bg-[#1557B0] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Join Class Code
                  </button>
                )}
              </div>
            </div>

            {myClasses.length === 0 ? (
              <div className="p-12 text-center bg-white border border-[#DADCE0] rounded-xl space-y-4">
                <BookOpen className="w-12 h-12 text-[#5F6368] mx-auto opacity-40" />
                <h3 className="text-base font-bold text-[#202124]">No classes found</h3>
                <p className="text-xs text-[#5F6368] max-w-sm mx-auto">
                  {user.role === 'teacher'
                    ? 'Get started by creating your first course class.'
                    : 'Enter a class code from your teacher to enroll.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myClasses.map((cls) => (
                  <ClassCard
                    key={cls.id}
                    cls={cls}
                    onClick={() => handleNavigate('class', cls.id)}
                  />
                ))}
              </div>
            )}
          </div>
        );

      case 'class':
        if (!selectedClassId) {
          return <div>Class not found</div>;
        }
        return (
          <ClassPage
            classId={selectedClassId}
            onNavigate={handleNavigate}
            openCreateAssignmentModal={() => setCreateAssignmentOpen(true)}
          />
        );

      case 'assignments':
        return renderAssignmentsList();

      case 'due-soon':
        return renderAssignmentsList('due-soon');

      case 'assignment':
        if (!selectedAssignmentId) {
          return <div>Assignment not found</div>;
        }
        return (
          <AssignmentDetailPage
            assignmentId={selectedAssignmentId}
            onNavigate={handleNavigate}
            openSubmissionsManager={(asgId) => openSubmissionsForAssignment(asgId)}
          />
        );

      case 'calendar':
        return (
          <CalendarView 
            onNavigate={handleNavigate} 
            onNavigateToAssignment={(asgId) => handleNavigate('assignment', asgId)} 
          />
        );

      case 'grades':
        return renderGradesView();

      case 'notifications':
        return renderNotificationsView();

      case 'materials':
        if (user?.role !== 'teacher' && user?.role !== 'admin') {
          return (
            <StudentDashboard
              onNavigate={handleNavigate}
              openJoinClassModal={() => setJoinClassOpen(true)}
            />
          );
        }
        return (
          <TeacherMaterialsView
            onNavigate={handleNavigate}
            openCreateModal={() => setCreateAssignmentOpen(true)}
          />
        );

      case 'seen-tracking':
      case 'students':
      case 'analytics':
        if (user?.role !== 'teacher' && user?.role !== 'admin') {
          return (
            <StudentDashboard
              onNavigate={handleNavigate}
              openJoinClassModal={() => setJoinClassOpen(true)}
            />
          );
        }
        return (
          <TeacherEngagementPanel
            onNavigate={handleNavigate}
            openSubmissionsManager={openSubmissionsForAssignment}
          />
        );

      case 'admin':
        return renderAdminPanel();

      case 'profile':
        return renderProfileView();

      default:
        return <div>View not found</div>;
    }
  };

  // Render Filterable Assignments List
  const renderAssignmentsList = (forcedFilter?: 'all' | 'due-soon' | 'overdue') => {
    const currentDeadlineFilter = forcedFilter || assignmentDeadlineFilter;

    // Base filtered list by search and class
    const baseFiltered = assignments.filter((a) => {
      const matchesSearch = a.title.toLowerCase().includes(assignmentSearch.toLowerCase()) || 
                            a.className.toLowerCase().includes(assignmentSearch.toLowerCase());
      const matchesClass = assignmentClassFilter === 'all' || a.classId === assignmentClassFilter;
      return matchesSearch && matchesClass;
    });

    // Counts for tabs
    const dueSoonCount = baseFiltered.filter((a) => isDueSoon(a.dueDate)).length;
    const overdueCount = baseFiltered.filter((a) => new Date(a.dueDate).getTime() < Date.now()).length;
    const allCount = baseFiltered.length;

    // Filter by deadline status
    const filtered = baseFiltered.filter((a) => {
      if (currentDeadlineFilter === 'due-soon') {
        return isDueSoon(a.dueDate);
      }
      if (currentDeadlineFilter === 'overdue') {
        return new Date(a.dueDate).getTime() < Date.now();
      }
      return true;
    });

    return (
      <div className="space-y-6 text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#DADCE0]">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold text-[#202124]">
                {currentDeadlineFilter === 'due-soon' ? 'Due Soon Tasks' : 'Coursework Tasks'}
              </h1>
              {dueSoonCount > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                  <Clock className="w-3 h-3 text-amber-600 animate-pulse" />
                  {dueSoonCount} Due within 48h
                </span>
              )}
            </div>
            <p className="text-xs text-[#5F6368] mt-0.5">
              {currentDeadlineFilter === 'due-soon'
                ? 'High-priority assignments with deadlines approaching in the next 48 hours'
                : user.role === 'teacher'
                ? 'Manage, track student views & grade work'
                : 'View, complete & submit coursework'}
            </p>
          </div>
          {user.role === 'teacher' && (
            <button
              onClick={() => setCreateAssignmentOpen(true)}
              className="px-3.5 py-2 bg-[#1A73E8] hover:bg-[#1557B0] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" /> Post New Assignment
            </button>
          )}
        </div>

        {/* Search, Class Filter, and Deadline Filter Tabs */}
        <div className="p-4 bg-white border border-[#DADCE0] rounded-xl shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5F6368]" />
              <input
                type="text"
                value={assignmentSearch}
                onChange={(e) => setAssignmentSearch(e.target.value)}
                placeholder="Search assignments by title or course name..."
                className="w-full pl-9 pr-3 py-1.5 bg-[#F8F9FA] text-[#202124] rounded-lg border border-[#DADCE0] text-xs focus:border-[#1A73E8] focus:bg-white outline-hidden"
              />
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Filter className="w-4 h-4 text-[#5F6368]" />
              <select
                value={assignmentClassFilter}
                onChange={(e) => setAssignmentClassFilter(e.target.value)}
                className="py-1.5 px-3 bg-[#F8F9FA] text-[#202124] rounded-lg border border-[#DADCE0] text-xs font-medium focus:border-[#1A73E8] outline-hidden"
              >
                <option value="all">All Classes</option>
                {myClasses.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Deadline Filter Tabs with Visual Badges */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
            <button
              onClick={() => {
                if (forcedFilter) setActiveView('assignments');
                setAssignmentDeadlineFilter('all');
              }}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                currentDeadlineFilter === 'all'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'bg-slate-100 text-[#5F6368] hover:bg-slate-200'
              }`}
            >
              All Tasks ({allCount})
            </button>

            <button
              onClick={() => {
                if (forcedFilter) setActiveView('assignments');
                setAssignmentDeadlineFilter('due-soon');
              }}
              className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                currentDeadlineFilter === 'due-soon'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : dueSoonCount > 0
                  ? 'bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100'
                  : 'bg-slate-100 text-[#5F6368] hover:bg-slate-200'
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>Due Soon (&lt;48h)</span>
              {dueSoonCount > 0 && (
                <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-bold ${
                  currentDeadlineFilter === 'due-soon' ? 'bg-amber-700 text-white' : 'bg-amber-200 text-amber-900'
                }`}>
                  {dueSoonCount}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                if (forcedFilter) setActiveView('assignments');
                setAssignmentDeadlineFilter('overdue');
              }}
              className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                currentDeadlineFilter === 'overdue'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : overdueCount > 0
                  ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                  : 'bg-slate-100 text-[#5F6368] hover:bg-slate-200'
              }`}
            >
              <AlertTriangle className="w-3 h-3" />
              <span>Overdue ({overdueCount})</span>
            </button>
          </div>
        </div>

        {/* Assignments Cards */}
        {filtered.length === 0 ? (
          <div className="p-12 text-center bg-white border border-[#DADCE0] rounded-xl space-y-2">
            <Clock className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-semibold text-[#202124]">
              {currentDeadlineFilter === 'due-soon'
                ? 'No tasks due within the next 48 hours!'
                : currentDeadlineFilter === 'overdue'
                ? 'No overdue assignments found.'
                : 'No assignments found matching your filter.'}
            </p>
            {currentDeadlineFilter !== 'all' && (
              <button
                onClick={() => {
                  if (forcedFilter) setActiveView('assignments');
                  setAssignmentDeadlineFilter('all');
                }}
                className="text-xs text-[#1A73E8] hover:underline font-medium"
              >
                View all assignments
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2.5">
            {filtered.map((a) => {
              const view = views.find((v) => v.assignmentId === a.id && v.studentId === user.id);
              const sub = submissions.find((s) => s.assignmentId === a.id && s.studentId === user.id);
              const dueSoon = isDueSoon(a.dueDate);

              return (
                <div
                  key={a.id}
                  onClick={() => handleNavigate('assignment', a.id)}
                  className={`p-4 bg-white border rounded-xl transition-all cursor-pointer flex flex-col sm:flex-row justify-between sm:items-center gap-3 ${
                    dueSoon
                      ? 'border-amber-300/80 hover:border-amber-500 shadow-2xs hover:shadow-xs bg-gradient-to-r from-amber-50/20 via-white to-white'
                      : 'border-[#DADCE0] hover:border-[#1A73E8] hover:shadow-xs'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-semibold text-[#1A73E8] bg-blue-50 px-2 py-0.5 rounded">
                        {a.className}
                      </span>
                      <span className="text-[11px] text-[#5F6368]">• {a.points} Points</span>
                      <DueSoonBadge dueDate={a.dueDate} size="sm" />
                    </div>

                    <h3 className="text-sm font-semibold text-[#202124] hover:text-[#1A73E8]">
                      {a.title}
                    </h3>

                    <div className="flex items-center gap-2 text-xs">
                      <span className={`flex items-center gap-1 font-medium ${
                        dueSoon ? 'text-amber-800 font-semibold' : 'text-[#5F6368]'
                      }`}>
                        {dueSoon && <Clock className="w-3.5 h-3.5 text-amber-600 inline shrink-0" />}
                        Due {formatDate(a.dueDate)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {user.role === 'student' ? (
                      <StatusBadge
                        seen={!!view}
                        submissionStatus={sub?.status}
                        dueDate={a.dueDate}
                        firstSeenAt={view?.firstSeenAt}
                        lastSeenAt={view?.lastSeenAt}
                        submittedAt={sub?.submittedAt}
                        grade={sub?.grade}
                        points={a.points}
                      />
                    ) : (
                      <div className="text-right flex items-center gap-2">
                        <DueSoonBadge dueDate={a.dueDate} size="sm" showCountdown={true} />
                        <span className="text-xs font-semibold text-[#1A73E8] bg-blue-50 px-2.5 py-1 rounded-md hover:bg-blue-100 transition-colors">
                          Review Submissions →
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // Render Grades Overview
  const renderGradesView = () => {
    const studentSubmissions = user.role === 'student'
      ? submissions.filter((s) => s.studentId === user.id)
      : submissions;

    return (
      <div className="space-y-6 text-left">
        <div className="pb-2 border-b border-[#DADCE0]">
          <h1 className="text-2xl font-bold text-[#202124] flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-[#1A73E8]" /> Gradebook & Records
          </h1>
          <p className="text-xs text-[#5F6368]">Academic performance records and returned grades</p>
        </div>

        <div className="bg-white border border-[#DADCE0] rounded-xl shadow-xs overflow-x-auto">
          {studentSubmissions.length === 0 ? (
            <p className="text-xs text-[#5F6368] text-center py-8">No graded submissions recorded yet.</p>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F9FA] border-b border-[#DADCE0] text-[#5F6368] uppercase text-[10px] font-semibold">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Assignment</th>
                  <th className="py-3 px-4">Submission Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DADCE0]">
                {studentSubmissions.map((sub) => {
                  const asg = assignments.find((a) => a.id === sub.assignmentId);
                  return (
                    <tr key={sub.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4 font-semibold text-[#202124]">{sub.studentName}</td>
                      <td className="py-3.5 px-4 text-[#1A73E8] font-medium">{asg?.title || 'Assignment'}</td>
                      <td className="py-3.5 px-4 text-[#5F6368]">{formatDate(sub.submittedAt)}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          sub.status === 'graded' ? 'bg-emerald-50 text-[#188038]' : 'bg-blue-50 text-[#1A73E8]'
                        }`}>
                          {sub.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-[#202124]">
                        {sub.grade !== undefined ? `${sub.grade} / ${asg?.points || 100}` : 'Pending Review'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    );
  };

  // Render Notifications View
  const renderNotificationsView = () => {
    const userNotifs = notifications.filter((n) => n.userId === user.id);

    return (
      <div className="space-y-6 text-left">
        <div className="flex justify-between items-center pb-2 border-b border-[#DADCE0]">
          <div>
            <h1 className="text-2xl font-bold text-[#202124] flex items-center gap-2">
              <Bell className="w-6 h-6 text-[#1A73E8]" /> Notifications
            </h1>
            <p className="text-xs text-[#5F6368]">Alerts for assignments, grades, and class posts</p>
          </div>
          {userNotifs.some((n) => !n.read) && (
            <button
              onClick={() => markAllNotificationsRead()}
              className="text-xs font-semibold text-[#1A73E8] hover:underline"
            >
              Mark all as read
            </button>
          )}
        </div>

        <div className="bg-white border border-[#DADCE0] rounded-xl shadow-xs divide-y divide-[#DADCE0]">
          {userNotifs.length === 0 ? (
            <p className="text-xs text-[#5F6368] text-center py-8">No notifications yet.</p>
          ) : (
            userNotifs.map((n) => (
              <div
                key={n.id}
                onClick={() => {
                  markNotificationRead(n.id);
                  if (n.linkUrl) {
                    const parts = n.linkUrl.split('/');
                    if (parts[1] === 'assignments') {
                      handleNavigate('assignment', parts[2]);
                    }
                  }
                }}
                className={`p-4 cursor-pointer flex items-start justify-between gap-4 transition-colors ${
                  !n.read ? 'bg-blue-50/40' : 'hover:bg-slate-50'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-semibold text-[#202124]">{n.title}</h4>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-[#1A73E8] shrink-0" />}
                  </div>
                  <p className="text-xs text-[#5F6368]">{n.message}</p>
                  <p className="text-[10px] text-[#5F6368] font-mono">{formatRelativeTime(n.createdAt)}</p>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(n.id);
                  }}
                  className="p-1 text-[#5F6368] hover:text-[#D93025]"
                  title="Dismiss notification"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  // Render Admin Control Panel
  const renderAdminPanel = () => {
    return (
      <div className="space-y-8 text-left">
        <div className="pb-2 border-b border-[#DADCE0] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h1 className="text-2xl font-bold text-[#202124] flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-[#1A73E8]" /> Platform Administration
            </h1>
            <p className="text-xs text-[#5F6368]">
              Manage registered accounts, view instructors, and manage system database state.
            </p>
          </div>
          <button
            onClick={() => {
              if (confirm('Reset entire system to initial seed data?')) {
                resetDemoData();
                window.location.reload();
              }
            }}
            className="px-3 py-1.5 bg-[#D93025] hover:bg-rose-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Demo State
          </button>
        </div>

        {/* Teachers Overview Section */}
        <div className="p-6 bg-white border border-[#DADCE0] rounded-xl shadow-xs space-y-4">
          <div>
            <h2 className="text-base font-bold text-[#202124] flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#1A73E8]" /> Instructors Overview ({allUsers.filter((u) => u.role === 'teacher').length})
            </h2>
            <p className="text-xs text-[#5F6368]">Monitor all subject teachers, assigned classes, enrolled students, and total assignments.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F9FA] border-b border-[#DADCE0] text-[#5F6368] uppercase font-semibold text-[10px]">
                <tr>
                  <th className="py-3 px-4">Instructor</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Classes</th>
                  <th className="py-3 px-4">Students Enrolled</th>
                  <th className="py-3 px-4">Assignments</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DADCE0]">
                {allUsers
                  .filter((u) => u.role === 'teacher')
                  .map((t) => {
                    const tClasses = classes.filter((c) => c.teacherId === t.id);
                    const tClassIds = tClasses.map((c) => c.id);
                    const uniqueStudentsCount = new Set(
                      members
                        .filter((m) => m.role === 'student' && tClassIds.includes(m.classId))
                        .map((m) => m.userId)
                    ).size;
                    const tAssignmentsCount = assignments.filter((a) => a.teacherId === t.id).length;

                    return (
                      <tr key={t.id} className="hover:bg-slate-50">
                        <td className="py-3.5 px-4 font-semibold text-[#202124] flex items-center gap-2">
                          <img
                            src={t.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                            alt={t.name}
                            className="w-7 h-7 rounded-full object-cover"
                          />
                          {t.name}
                        </td>
                        <td className="py-3.5 px-4 text-[#5F6368] font-mono text-[11px]">{t.email}</td>
                        <td className="py-3.5 px-4 font-medium text-[#1A73E8]">
                          {t.subject || tClasses[0]?.subject || 'N/A'}
                        </td>
                        <td className="py-3.5 px-4">
                          {tClasses.length > 0 ? (
                            <span className="px-2 py-0.5 bg-blue-50 text-[#1A73E8] rounded font-semibold text-[11px]">
                              {tClasses.map((c) => `${c.name} (${c.classCode})`).join(', ')}
                            </span>
                          ) : (
                            <span className="text-[#5F6368] italic">No class assigned</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-[#202124]">
                          {uniqueStudentsCount} students
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-[#202124]">
                          {tAssignmentsCount} posted
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>

        {/* User Account Controls */}
        <div className="p-6 bg-white border border-[#DADCE0] rounded-xl shadow-xs space-y-4">
          <h2 className="text-base font-bold text-[#202124]">User Accounts Management</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F9FA] border-b border-[#DADCE0] text-[#5F6368] uppercase font-semibold text-[10px]">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DADCE0]">
                {allUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-semibold text-[#202124]">{u.name}</td>
                    <td className="py-3.5 px-4 text-[#5F6368]">{u.email}</td>
                    <td className="py-3.5 px-4 capitalize font-medium">{u.role}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.status === 'suspended' ? 'bg-rose-50 text-[#D93025]' : 'bg-emerald-50 text-[#188038]'
                      }`}>
                        {(u.status || 'active').toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {u.id !== user.id && (
                        <button
                          onClick={() => {
                            const nextStatus = u.status === 'suspended' ? 'active' : 'suspended';
                            StorageService.updateUserStatus(u.id, nextStatus);
                          }}
                          className={`px-2.5 py-1 rounded text-[10px] font-semibold ${
                            u.status === 'suspended'
                              ? 'bg-[#188038] text-white hover:bg-emerald-700'
                              : 'bg-[#D93025] text-white hover:bg-rose-700'
                          }`}
                        >
                          {u.status === 'suspended' ? 'Activate' : 'Suspend'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Render User Profile & Data Management (Requirement 24 & 25)
  const renderProfileView = () => {
    return (
      <div className="max-w-2xl mx-auto space-y-6 text-left">
        <div className="pb-2 border-b border-[#DADCE0]">
          <h1 className="text-2xl font-bold text-[#202124]">Settings & Data Management</h1>
          <p className="text-xs text-[#5F6368]">Account profile and client-side database management</p>
        </div>

        {/* Profile Card */}
        <div className="p-6 bg-white border border-[#DADCE0] rounded-xl shadow-xs space-y-6">
          <div className="flex items-center gap-4">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-16 h-16 rounded-full object-cover ring-2 ring-[#DADCE0]"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-[#1A73E8] text-white text-xl font-bold flex items-center justify-center">
                {user.name.charAt(0)}
              </div>
            )}
            <div>
              <h3 className="text-lg font-bold text-[#202124]">{user.name}</h3>
              <p className="text-xs text-[#5F6368]">{user.email}</p>
              <span className="inline-block mt-1 px-2.5 py-0.5 rounded bg-blue-50 text-[#1A73E8] text-[10px] font-bold uppercase tracking-wider">
                {user.role}
              </span>
            </div>
          </div>

          {/* Role / Account Switcher for Demo Testing */}
          <div className="p-4 bg-[#F8F9FA] rounded-xl border border-[#DADCE0] space-y-2.5">
            <h4 className="text-xs font-bold text-[#202124]">Switch Active Account</h4>
            <div className="flex flex-wrap gap-2">
              {allUsers.map((u) => (
                <button
                  key={u.id}
                  onClick={() => switchUser(u.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    u.id === user.id
                      ? 'bg-[#1A73E8] text-white font-semibold'
                      : 'bg-white text-[#202124] border border-[#DADCE0] hover:bg-slate-50'
                  }`}
                >
                  {u.name} ({u.role})
                </button>
              ))}
            </div>
          </div>

          {/* Data Management Section (Requirement 24, 25) */}
          <div className="pt-4 border-t border-[#DADCE0] space-y-4">
            <div>
              <h4 className="text-sm font-bold text-[#202124]">LocalStorage Data Management</h4>
              <p className="text-xs text-[#5F6368]">
                Export, backup, restore, or reset the local database.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleExportData}
                className="p-3 bg-white border border-[#DADCE0] hover:bg-slate-50 rounded-xl text-xs font-semibold text-[#202124] flex items-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4 text-[#1A73E8]" />
                <div className="text-left">
                  <p>Export Data</p>
                  <span className="text-[10px] font-normal text-[#5F6368]">Download .json backup</span>
                </div>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-3 bg-white border border-[#DADCE0] hover:bg-slate-50 rounded-xl text-xs font-semibold text-[#202124] flex items-center gap-2 transition-colors"
              >
                <Upload className="w-4 h-4 text-[#188038]" />
                <div className="text-left">
                  <p>Import Data</p>
                  <span className="text-[10px] font-normal text-[#5F6368]">Restore from .json</span>
                </div>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportFile}
                className="hidden"
              />
            </div>

            <div className="flex flex-wrap gap-2 pt-2 border-t border-[#DADCE0]">
              <button
                onClick={() => {
                  if (confirm('Reset system data to initial seed demonstration data?')) {
                    resetDemoData();
                    window.location.reload();
                  }
                }}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-[#202124] rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#5F6368]" /> Reset Demo Data
              </button>

              <button
                onClick={() => {
                  if (confirm('Are you sure you want to CLEAR ALL DATA? All classes, assignments, and submissions will be deleted.')) {
                    clearAllData();
                    window.location.reload();
                  }
                }}
                className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-[#D93025] border border-rose-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5 text-[#D93025]" /> Clear All Data
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <AppShell
      activeView={activeView}
      onNavigate={handleNavigate}
      openCreateClassModal={() => setCreateClassOpen(true)}
      openJoinClassModal={() => setJoinClassOpen(true)}
      openCreateAssignmentModal={() => setCreateAssignmentOpen(true)}
    >
      {renderMainView()}

      {/* Interactive Modals */}
      <CreateClassModal
        isOpen={createClassOpen}
        onClose={() => setCreateClassOpen(false)}
        onCreated={(cls) => {
          setSelectedClassId(cls.id);
          setActiveView('class');
        }}
      />

      <JoinClassModal
        isOpen={joinClassOpen}
        onClose={() => setJoinClassOpen(false)}
        onJoined={(cls) => {
          setSelectedClassId(cls.id);
          setActiveView('class');
        }}
      />

      <CreateAssignmentModal
        isOpen={createAssignmentOpen}
        onClose={() => setCreateAssignmentOpen(false)}
        preselectedClassId={selectedClassId || undefined}
        onCreated={(asg) => {
          setSelectedAssignmentId(asg.id);
          setActiveView('assignment');
        }}
      />

      {submissionsManagerAssignmentId && (
        <SubmissionsManagerModal
          isOpen={submissionsManagerOpen}
          onClose={() => {
            setSubmissionsManagerOpen(false);
            setSubmissionsManagerAssignmentId(null);
          }}
          assignmentId={submissionsManagerAssignmentId}
        />
      )}
    </AppShell>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
}
