import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, Bell, User, LogOut, Check, Plus, 
  BookOpen, FileText, Users, Menu, X, Settings, ArrowRight, Megaphone 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { formatRelativeTime } from '../../lib/utils';
import { ClassMember } from '../../types';

interface HeaderProps {
  onToggleMobileSidebar: () => void;
  onNavigate: (view: string, id?: string) => void;
  openCreateClassModal?: () => void;
  openJoinClassModal?: () => void;
  openCreateAssignmentModal?: () => void;
  activeViewTitle?: string;
}

export const Header: React.FC<HeaderProps> = ({ 
  onToggleMobileSidebar, 
  onNavigate, 
  openCreateClassModal,
  openJoinClassModal,
  openCreateAssignmentModal,
  activeViewTitle = 'Dashboard' 
}) => {
  const { user, logout, switchUser, allUsers } = useAuth();
  const { 
    notifications, 
    unreadNotificationCount, 
    markNotificationRead, 
    markAllNotificationsRead, 
    classes, 
    assignments, 
    members, 
    announcements 
  } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showCreateDropdown, setShowCreateDropdown] = useState(false);
  const [showUserSwitcher, setShowUserSwitcher] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const createRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifDropdown(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
      if (createRef.current && !createRef.current.contains(event.target as Node)) {
        setShowCreateDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredClasses = classes.filter(
    (c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           c.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredAssignments = assignments.filter(
    (a) => a.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredPeople = members.filter(
    (m) => m.userName.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const uniquePeople: ClassMember[] = Array.from(new Map<string, ClassMember>(filteredPeople.map((p) => [p.userId, p])).values());
  const filteredAnnouncements = announcements.filter(
    (anc) => anc.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const hasSearchResults = searchQuery.trim().length > 0 && (
    filteredClasses.length > 0 || 
    filteredAssignments.length > 0 || 
    uniquePeople.length > 0 ||
    filteredAnnouncements.length > 0
  );

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-[#DADCE0] px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 text-[#5F6368] hover:bg-slate-100 rounded-full transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-base font-semibold text-[#202124] capitalize hidden sm:inline-block">
            {activeViewTitle}
          </span>
        </div>
      </div>

      {/* Center: Global Search Bar */}
      <div className="relative flex-1 max-w-lg mx-2" ref={searchRef}>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5F6368]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchDropdown(true);
            }}
            onFocus={() => setShowSearchDropdown(true)}
            placeholder="Search classes, assignments, people..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-[#F8F9FA] text-[#202124] rounded-lg border border-[#DADCE0] focus:border-[#1A73E8] focus:bg-white focus:outline-hidden transition-all duration-150"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5F6368] hover:text-[#202124]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {showSearchDropdown && searchQuery.trim().length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-[#DADCE0] rounded-xl shadow-lg max-h-96 overflow-y-auto z-50 p-2 animate-in fade-in duration-100">
            {!hasSearchResults ? (
              <div className="p-4 text-center text-xs text-[#5F6368]">
                No matching results found for "{searchQuery}".
              </div>
            ) : (
              <div className="space-y-2 text-left">
                {/* Classes */}
                {filteredClasses.length > 0 && (
                  <div>
                    <div className="px-3 py-1 text-[11px] font-semibold text-[#5F6368] flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-[#1A73E8]" /> Classes
                    </div>
                    {filteredClasses.slice(0, 4).map((c) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          onNavigate('class', c.id);
                          setShowSearchDropdown(false);
                          setSearchQuery('');
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs rounded-lg hover:bg-slate-50 flex items-center justify-between"
                      >
                        <span className="font-medium text-[#202124]">{c.name}</span>
                        <span className="text-[11px] text-[#5F6368]">{c.section}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Assignments */}
                {filteredAssignments.length > 0 && (
                  <div>
                    <div className="px-3 py-1 text-[11px] font-semibold text-[#5F6368] flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-[#1A73E8]" /> Assignments
                    </div>
                    {filteredAssignments.slice(0, 4).map((a) => (
                      <button
                        key={a.id}
                        onClick={() => {
                          onNavigate('assignment', a.id);
                          setShowSearchDropdown(false);
                          setSearchQuery('');
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs rounded-lg hover:bg-slate-50 flex items-center justify-between"
                      >
                        <span className="font-medium text-[#202124] truncate max-w-[200px] sm:max-w-xs">{a.title}</span>
                        <span className="text-[11px] text-[#5F6368] shrink-0">{a.className}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* People */}
                {uniquePeople.length > 0 && (
                  <div>
                    <div className="px-3 py-1 text-[11px] font-semibold text-[#5F6368] flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-[#1A73E8]" /> People
                    </div>
                    {uniquePeople.slice(0, 4).map((p) => (
                      <div
                        key={p.userId}
                        className="px-3 py-1.5 text-xs rounded-lg flex items-center justify-between hover:bg-slate-50"
                      >
                        <span className="font-medium text-[#202124]">{p.userName}</span>
                        <span className="text-[11px] text-[#5F6368] capitalize">{p.role}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Announcements */}
                {filteredAnnouncements.length > 0 && (
                  <div>
                    <div className="px-3 py-1 text-[11px] font-semibold text-[#5F6368] flex items-center gap-1.5">
                      <Megaphone className="w-3.5 h-3.5 text-[#188038]" /> Announcements
                    </div>
                    {filteredAnnouncements.slice(0, 4).map((anc) => (
                      <button
                        key={anc.id}
                        onClick={() => {
                          onNavigate('class', anc.classId);
                          setShowSearchDropdown(false);
                          setSearchQuery('');
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs rounded-lg hover:bg-slate-50 flex items-center justify-between"
                      >
                        <span className="font-medium text-[#202124] truncate max-w-[200px] sm:max-w-xs">{anc.content}</span>
                        <span className="text-[10px] text-[#5F6368] shrink-0 font-mono">{formatRelativeTime(anc.createdAt)}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Controls: Create (+), Notification Bell, Profile */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Quick Create (+) Button */}
        <div className="relative" ref={createRef}>
          <button
            onClick={() => setShowCreateDropdown(!showCreateDropdown)}
            className="p-2 text-[#5F6368] hover:text-[#202124] hover:bg-slate-100 rounded-full transition-colors flex items-center justify-center"
            title="Create"
            aria-label="Create item"
          >
            <Plus className="w-5 h-5" />
          </button>

          {showCreateDropdown && (
            <div className="absolute right-0 mt-1.5 w-48 bg-white border border-[#DADCE0] rounded-xl shadow-lg z-50 py-1.5 animate-in fade-in duration-100 text-left">
              {user?.role === 'teacher' ? (
                <>
                  <button
                    onClick={() => {
                      setShowCreateDropdown(false);
                      openCreateClassModal?.();
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs text-[#202124] hover:bg-slate-50 flex items-center gap-2"
                  >
                    <BookOpen className="w-4 h-4 text-[#1A73E8]" /> Create Class
                  </button>
                  <button
                    onClick={() => {
                      setShowCreateDropdown(false);
                      openCreateAssignmentModal?.();
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs text-[#202124] hover:bg-slate-50 flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4 text-[#1A73E8]" /> Create Assignment
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setShowCreateDropdown(false);
                    openJoinClassModal?.();
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs text-[#202124] hover:bg-slate-50 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4 text-[#1A73E8]" /> Join Class with Code
                </button>
              )}
            </div>
          )}
        </div>

        {/* Notifications Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            className="relative p-2 text-[#5F6368] hover:text-[#202124] hover:bg-slate-100 rounded-full transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadNotificationCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#1A73E8] rounded-full ring-2 ring-white" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifDropdown && (
            <div className="absolute right-0 mt-1.5 w-80 sm:w-96 bg-white border border-[#DADCE0] rounded-xl shadow-lg z-50 p-3 animate-in fade-in duration-100">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#DADCE0]">
                <h3 className="text-xs font-semibold text-[#202124]">Notifications</h3>
                {unreadNotificationCount > 0 && (
                  <button
                    onClick={() => markAllNotificationsRead()}
                    className="text-xs text-[#1A73E8] hover:underline font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto space-y-1 text-left">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[#5F6368]">No notifications yet.</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        markNotificationRead(n.id);
                        if (n.linkUrl) {
                          const parts = n.linkUrl.split('/');
                          if (parts[1] === 'assignments') {
                            onNavigate('assignment', parts[2]);
                          }
                        }
                        setShowNotifDropdown(false);
                      }}
                      className={`p-2.5 rounded-lg cursor-pointer transition-colors ${
                        !n.read 
                          ? 'bg-blue-50/60 border border-blue-100' 
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-xs font-medium text-[#202124]">{n.title}</span>
                        <span className="text-[10px] text-[#5F6368] shrink-0">{formatRelativeTime(n.createdAt)}</span>
                      </div>
                      <p className="text-xs text-[#5F6368] mt-0.5 line-clamp-2">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar & Menu */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 transition-colors"
          >
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover ring-1 ring-[#DADCE0]" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#1A73E8] text-white font-semibold flex items-center justify-center text-xs">
                {user?.name.charAt(0) || 'U'}
              </div>
            )}
          </button>

          {showProfileDropdown && (
            <div className="absolute right-0 mt-1.5 w-60 bg-white border border-[#DADCE0] rounded-xl shadow-lg z-50 p-2 animate-in fade-in duration-100 text-left">
              <div className="px-3 py-2 border-b border-[#DADCE0]">
                <p className="text-xs font-semibold text-[#202124] truncate">{user?.name}</p>
                <p className="text-[11px] text-[#5F6368] truncate">{user?.email}</p>
                <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-[#1A73E8] bg-blue-50 rounded">
                  {user?.role}
                </span>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    onNavigate('profile');
                    setShowProfileDropdown(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-[#202124] hover:bg-slate-50 rounded-lg flex items-center gap-2"
                >
                  <Settings className="w-4 h-4 text-[#5F6368]" /> Settings & Data
                </button>
                <button
                  onClick={() => {
                    setShowUserSwitcher(true);
                    setShowProfileDropdown(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-[#1A73E8] hover:bg-blue-50/50 rounded-lg flex items-center gap-2"
                >
                  <User className="w-4 h-4 text-[#1A73E8]" /> Switch Account
                </button>
                <button
                  onClick={() => {
                    logout();
                    setShowProfileDropdown(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-[#D93025] hover:bg-rose-50 rounded-lg flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4 text-[#D93025]" /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Account Switcher Modal (Light & Clean) */}
      {showUserSwitcher && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white border border-[#DADCE0] rounded-xl shadow-xl max-w-md w-full p-6 animate-in zoom-in-95 duration-100 text-left">
            <div className="flex justify-between items-center pb-3 border-b border-[#DADCE0]">
              <h3 className="text-sm font-semibold text-[#202124] flex items-center gap-2">
                <User className="w-4 h-4 text-[#1A73E8]" /> Switch Account
              </h3>
              <button
                onClick={() => setShowUserSwitcher(false)}
                className="text-[#5F6368] hover:text-[#202124]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-[#5F6368] mt-2 mb-4">
              Select an account to test as a Teacher, Student, or Administrator.
            </p>

            <div className="space-y-1.5 max-h-72 overflow-y-auto">
              {allUsers.map((u) => (
                <button
                  key={u.id}
                  onClick={() => {
                    switchUser(u.id);
                    setShowUserSwitcher(false);
                  }}
                  className={`w-full p-2.5 rounded-lg border text-left flex items-center justify-between transition-colors ${
                    user?.id === u.id
                      ? 'border-[#1A73E8] bg-blue-50/50'
                      : 'border-[#DADCE0] hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {u.avatar ? (
                      <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-slate-200 font-bold flex items-center justify-center text-xs text-[#5F6368]">
                        {u.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-semibold text-[#202124]">{u.name}</p>
                      <p className="text-[11px] text-[#5F6368]">{u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded bg-slate-100 text-[#5F6368]">
                      {u.role}
                    </span>
                    {user?.id === u.id && <Check className="w-4 h-4 text-[#1A73E8]" />}
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-[#DADCE0] flex justify-end">
              <button
                onClick={() => setShowUserSwitcher(false)}
                className="px-4 py-2 text-xs font-medium bg-slate-100 text-[#202124] rounded-lg hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
