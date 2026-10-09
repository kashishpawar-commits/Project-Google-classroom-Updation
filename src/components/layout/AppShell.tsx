import React, { useState } from 'react';
import { 
  Home, BookOpen, FileText, Calendar, GraduationCap, 
  Users, BarChart3, ShieldCheck, Settings, LogOut, 
  X, Plus, Bell, Eye, FolderOpen, Clock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { isDueSoon } from '../../lib/utils';
import { Header } from './Header';

interface AppShellProps {
  children: React.ReactNode;
  activeView: string;
  onNavigate: (view: string, id?: string) => void;
  openCreateClassModal: () => void;
  openJoinClassModal: () => void;
  openCreateAssignmentModal?: () => void;
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  activeView,
  onNavigate,
  openCreateClassModal,
  openJoinClassModal,
  openCreateAssignmentModal,
}) => {
  const { user, logout } = useAuth();
  const { unreadNotificationCount, assignments, members, submissions } = useData();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Calculate Due Soon tasks for student badge
  const dueSoonCount = user?.role === 'student'
    ? assignments.filter((a) => {
        const isEnrolled = members.some((m) => m.userId === user.id && m.classId === a.classId);
        if (!isEnrolled) return false;
        const sub = submissions.find((s) => s.assignmentId === a.id && s.studentId === user.id);
        if (sub && (sub.status === 'submitted' || sub.status === 'graded')) return false;
        return isDueSoon(a.dueDate);
      }).length
    : 0;

  // Exact Teacher Navigation requested
  const teacherNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'classes', label: 'My Classes', icon: BookOpen },
    { id: 'materials', label: 'Materials', icon: FolderOpen },
    { id: 'seen-tracking', label: 'Seen Tracking', icon: Eye },
    { id: 'assignments', label: 'Assignments', icon: FileText },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  // Dedicated Student Navigation with Due Soon alert
  const studentNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'classes', label: 'My Classes', icon: BookOpen },
    { id: 'assignments', label: 'Assignments', icon: FileText },
    { id: 'due-soon', label: 'Due Soon', icon: Clock },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'grades', label: 'Grades', icon: GraduationCap },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  // Admin Navigation
  const adminNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'classes', label: 'All Classes', icon: BookOpen },
    { id: 'admin', label: 'Admin Management', icon: ShieldCheck },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  const currentNavItems = user?.role === 'teacher' 
    ? teacherNavItems 
    : user?.role === 'admin' 
    ? adminNavItems 
    : studentNavItems;

  const renderNavLinks = (items: typeof teacherNavItems) => (
    <div className="space-y-0.5">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeView === item.id;
        return (
          <button
            key={item.id}
            onClick={() => {
              onNavigate(item.id);
              setMobileSidebarOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-r-full text-xs font-medium transition-colors ${
              isActive
                ? 'bg-blue-50 text-[#1A73E8] font-semibold border-l-4 border-[#1A73E8]'
                : 'text-[#5F6368] hover:bg-slate-100 hover:text-[#202124]'
            }`}
          >
            <div className="flex items-center gap-3">
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#1A73E8]' : 'text-[#5F6368]'}`} />
              <span>{item.label}</span>
            </div>
            {item.id === 'notifications' && unreadNotificationCount > 0 ? (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#1A73E8] text-white">
                {unreadNotificationCount}
              </span>
            ) : null}
            {item.id === 'due-soon' && dueSoonCount > 0 ? (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500 text-white flex items-center gap-1 shadow-xs animate-pulse">
                {dueSoonCount}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#202124] flex flex-col font-sans antialiased">
      {/* Top Global Header (Full Width) */}
      <Header
        onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        onNavigate={onNavigate}
        openCreateClassModal={openCreateClassModal}
        openJoinClassModal={openJoinClassModal}
        openCreateAssignmentModal={openCreateAssignmentModal}
        activeViewTitle={activeView}
      />

      <div className="flex flex-1">
        {/* Mobile Backdrop */}
        {mobileSidebarOpen && (
          <div
            onClick={() => setMobileSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/30 lg:hidden transition-opacity"
          />
        )}

        {/* Clean Sidebar (~240px wide) */}
        <aside
          className={`fixed lg:sticky top-16 z-50 lg:z-10 h-[calc(100vh-4rem)] w-60 bg-white border-r border-[#DADCE0] flex flex-col justify-between py-4 pr-3 transition-transform duration-200 ease-in-out ${
            mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="space-y-4 overflow-y-auto">
            {/* Mobile close button */}
            <div className="flex lg:hidden items-center justify-between px-3 pb-2 border-b border-[#DADCE0]">
              <span className="text-xs font-bold text-[#5F6368]">MENU</span>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="p-1 text-[#5F6368] hover:text-[#202124]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Action Button */}
            <div className="px-2">
              {user?.role === 'teacher' ? (
                <button
                  onClick={() => {
                    openCreateClassModal();
                    setMobileSidebarOpen(false);
                  }}
                  className="w-full py-2 px-3.5 bg-[#1A73E8] hover:bg-[#1557B0] text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <Plus className="w-4 h-4" /> Create Class
                </button>
              ) : user?.role === 'student' ? (
                <button
                  onClick={() => {
                    openJoinClassModal();
                    setMobileSidebarOpen(false);
                  }}
                  className="w-full py-2 px-3.5 bg-[#1A73E8] hover:bg-[#1557B0] text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <Plus className="w-4 h-4" /> Join Class Code
                </button>
              ) : null}
            </div>

            {/* Role Header */}
            <div className="px-3">
              <span className="text-[10px] font-bold text-[#5F6368] uppercase tracking-wider">
                {user?.role === 'teacher' ? 'Teaching Workspace' : user?.role === 'admin' ? 'Administration' : 'Student Learning'}
              </span>
            </div>

            {/* Dedicated Role Navigation Links */}
            <div>
              {renderNavLinks(currentNavItems)}
            </div>
          </div>

          {/* Bottom Sidebar Controls */}
          <div className="pt-3 border-t border-[#DADCE0] space-y-0.5">
            <button
              onClick={() => {
                onNavigate('profile');
                setMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-r-full text-xs font-medium transition-colors ${
                activeView === 'profile'
                  ? 'bg-blue-50 text-[#1A73E8] font-semibold border-l-4 border-[#1A73E8]'
                  : 'text-[#5F6368] hover:bg-slate-100 hover:text-[#202124]'
              }`}
            >
              <Settings className="w-4 h-4 text-[#5F6368]" />
              <span>Settings</span>
            </button>
            <button
              onClick={() => logout()}
              className="w-full flex items-center gap-3 px-3.5 py-2 rounded-r-full text-xs font-medium text-[#D93025] hover:bg-rose-50 transition-colors"
            >
              <LogOut className="w-4 h-4 text-[#D93025]" />
              <span>Log out</span>
            </button>
          </div>
        </aside>

        {/* Main Content Workspace */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
};
