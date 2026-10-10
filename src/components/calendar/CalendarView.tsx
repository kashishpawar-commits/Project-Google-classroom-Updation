import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, BookOpen } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { formatDate } from '../../lib/utils';
import { DueSoonBadge } from '../ui/DueSoonBadge';

interface CalendarViewProps {
  onNavigate?: (view: string, id?: string) => void;
  onNavigateToAssignment?: (assignmentId: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ 
  onNavigate, 
  onNavigateToAssignment 
}) => {
  const { events } = useData();
  const [viewMode, setViewMode] = useState<'month' | 'agenda'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleOpenAssignment = (assignmentId?: string) => {
    if (!assignmentId) return;
    if (onNavigateToAssignment) {
      onNavigateToAssignment(assignmentId);
    } else if (onNavigate) {
      onNavigate('assignment', assignmentId);
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Calendar Header */}
      <div className="p-5 bg-white border border-[#DADCE0] rounded-xl shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#202124] flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-[#1A73E8]" /> Academic Calendar
          </h1>
          <p className="text-xs text-[#5F6368]">Track assignment deadlines, exam dates and course milestones</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Month Navigation */}
          <div className="flex items-center gap-1 bg-[#F8F9FA] border border-[#DADCE0] p-1 rounded-lg">
            <button 
              onClick={prevMonth} 
              className="p-1 text-[#5F6368] hover:text-[#202124] hover:bg-slate-200 rounded"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-semibold w-32 text-center text-[#202124]">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <button 
              onClick={nextMonth} 
              className="p-1 text-[#5F6368] hover:text-[#202124] hover:bg-slate-200 rounded"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* View Mode Switcher */}
          <div className="flex bg-[#F8F9FA] border border-[#DADCE0] p-1 rounded-lg text-xs font-semibold">
            {(['month', 'agenda'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 rounded-md capitalize transition-colors ${
                  viewMode === mode ? 'bg-white text-[#1A73E8] shadow-xs' : 'text-[#5F6368]'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Month View Grid */}
      {viewMode === 'month' && (
        <div className="bg-white border border-[#DADCE0] rounded-xl shadow-xs overflow-hidden">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 text-center border-b border-[#DADCE0] bg-[#F8F9FA] py-2.5 text-xs font-semibold text-[#5F6368]">
            <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
          </div>

          {/* Day Cells */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-[#DADCE0] min-h-[480px]">
            {/* Blank cells for offset */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`blank-${i}`} className="p-2 bg-slate-50/50" />
            ))}

            {/* Days of month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const dayEvents = events.filter((e) => e.date === dateStr);

              return (
                <div key={dayNum} className="p-2 space-y-1 hover:bg-blue-50/20 transition-colors min-h-[85px]">
                  <span className="text-xs font-semibold text-[#5F6368] font-mono">{dayNum}</span>
                  {dayEvents.map((evt) => (
                    <div
                      key={evt.id}
                      onClick={() => handleOpenAssignment(evt.assignmentId)}
                      className="p-1.5 bg-blue-50 border border-blue-200 rounded text-[11px] font-medium text-[#1A73E8] hover:bg-blue-100 cursor-pointer truncate transition-colors"
                      title={`${evt.title} (${evt.className})`}
                    >
                      <p className="truncate font-semibold">{evt.title}</p>
                      <p className="text-[10px] text-[#5F6368] truncate">{evt.className}</p>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Agenda List View */}
      {viewMode === 'agenda' && (
        <div className="bg-white border border-[#DADCE0] rounded-xl shadow-xs p-6 space-y-4">
          <h3 className="text-sm font-semibold text-[#202124]">Upcoming Deadlines & Events</h3>
          <div className="space-y-3">
            {events.length === 0 ? (
              <p className="text-xs text-[#5F6368] py-4 text-center">No calendar events or assignment deadlines recorded.</p>
            ) : (
              events
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .map((evt) => (
                  <div
                    key={evt.id}
                    onClick={() => handleOpenAssignment(evt.assignmentId)}
                    className="p-3.5 bg-slate-50 border border-[#DADCE0] hover:border-[#1A73E8] hover:bg-blue-50/20 rounded-xl flex items-center justify-between cursor-pointer transition-all"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold text-[#1A73E8] uppercase tracking-wider">{evt.className}</span>
                        <DueSoonBadge dueDate={`${evt.date}T${evt.time || '23:59'}:00`} size="sm" />
                      </div>
                      <h4 className="text-xs font-semibold text-[#202124]">{evt.title}</h4>
                      <p className="text-[11px] text-[#5F6368] flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#5F6368]" /> Due {evt.date} at {evt.time || '23:59'}
                      </p>
                    </div>
                    <button className="px-3 py-1.5 bg-[#1A73E8] text-white rounded-lg text-xs font-semibold hover:bg-[#1557B0]">
                      Open Task
                    </button>
                  </div>
                ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
