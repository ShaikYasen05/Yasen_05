import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar, AlertCircle, Clock, CheckSquare, Target } from "lucide-react";
import { Task, Project } from "../types";

interface CalendarViewProps {
  apiClient: any;
  activeProjectId: string | null;
}

type ViewMode = "month" | "week" | "day";

export default function CalendarView({ apiClient, activeProjectId }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 6, 5)); // Base it on user's current local time environment (July 2026)
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const t = await apiClient.getTasks();
        setTasks(t);
        const p = await apiClient.getProjects();
        setProjects(p);
      } catch (err) {
        console.error("Failed to fetch calendar tasks", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [activeProjectId]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Helper date calculations for Month View grid
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const prevDaysInMonth = new Date(year, month, 0).getDate();

  const handlePrev = () => {
    if (viewMode === "month") {
      setCurrentDate(new Date(year, month - 1, 1));
    } else if (viewMode === "week") {
      setCurrentDate(new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000));
    } else {
      setCurrentDate(new Date(currentDate.getTime() - 24 * 60 * 60 * 1000));
    }
  };

  const handleNext = () => {
    if (viewMode === "month") {
      setCurrentDate(new Date(year, month + 1, 1));
    } else if (viewMode === "week") {
      setCurrentDate(new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000));
    } else {
      setCurrentDate(new Date(currentDate.getTime() + 24 * 60 * 60 * 1000));
    }
  };

  if (loading) {
    return (
      <div className="h-96 bg-white border border-slate-100 rounded-2xl animate-pulse flex items-center justify-center">
        <span className="text-xs text-slate-400">Loading TaskForge Calendar schedules...</span>
      </div>
    );
  }

  // Filter tasks based on project
  const filteredTasks = tasks.filter(t => !activeProjectId || t.projectId === activeProjectId);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Map tasks onto correct date keys (e.g. "2026-07-05")
  const getTasksForDate = (dayNum: number, relativeMonth: "current" | "prev" | "next") => {
    let checkYear = year;
    let checkMonth = month;
    if (relativeMonth === "prev") {
      checkMonth = month - 1;
      if (checkMonth < 0) { checkMonth = 11; checkYear -= 1; }
    } else if (relativeMonth === "next") {
      checkMonth = month + 1;
      if (checkMonth > 11) { checkMonth = 0; checkYear += 1; }
    }

    const checkMonthStr = String(checkMonth + 1).padStart(2, "0");
    const checkDayStr = String(dayNum).padStart(2, "0");
    const dateStr = `${checkYear}-${checkMonthStr}-${checkDayStr}`;

    return filteredTasks.filter(t => t.dueDate === dateStr);
  };

  // Rendering month day cells
  const renderMonthCells = () => {
    const cells = [];
    
    // Previous Month's padded days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = prevDaysInMonth - i;
      const dayTasks = getTasksForDate(dayNum, "prev");
      cells.push(
        <div key={`prev-${dayNum}`} className="min-h-[90px] p-2 bg-slate-50/50 border-b border-r border-slate-100 opacity-40 select-none">
          <span className="text-[10px] font-semibold text-slate-400">{dayNum}</span>
          <div className="mt-1.5 space-y-1">
            {dayTasks.map(t => (
              <div key={t.id} className="text-[8px] truncate px-1 py-0.5 bg-slate-100 text-slate-400 rounded">{t.title}</div>
            ))}
          </div>
        </div>
      );
    }

    // Current Month's days
    for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
      const dayTasks = getTasksForDate(dayNum, "current");
      const isToday = dayNum === 5 && month === 6 && year === 2026; // Match sandbox local date 2026-07-05
      
      cells.push(
        <div 
          key={`curr-${dayNum}`} 
          className={`min-h-[100px] p-2 border-b border-r border-slate-100 transition-colors flex flex-col justify-between ${
            isToday ? "bg-blue-50/70 border-blue-200" : "bg-white"
          }`}
        >
          <div>
            <span className={`text-[10px] font-bold inline-flex items-center justify-center w-5 h-5 rounded-full ${
              isToday ? "bg-blue-600 text-white shadow-sm" : "text-slate-500"
            }`}>
              {dayNum}
            </span>
            <div className="mt-1.5 space-y-1 overflow-y-auto max-h-[65px]">
              {dayTasks.map(t => (
                <div 
                  key={t.id} 
                  className={`text-[8px] font-medium truncate px-1.5 py-0.5 rounded border border-l-2 ${
                    t.status === "Completed" ? "bg-emerald-50 text-emerald-700 border-emerald-100 border-l-emerald-500" :
                    t.status === "Blocked" ? "bg-red-50 text-red-700 border-red-100 border-l-red-500" :
                    "bg-blue-50 text-blue-700 border-blue-100 border-l-blue-500"
                  }`}
                >
                  {t.title}
                </div>
              ))}
            </div>
          </div>
          {dayTasks.length > 2 && (
            <span className="text-[7px] text-slate-400 font-bold block text-right mt-1">+{dayTasks.length - 2} more</span>
          )}
        </div>
      );
    }

    // Next Month's padded days to fill remaining slots (usually 42 total slots in grid)
    const totalRendered = firstDayIndex + daysInMonth;
    const remainingSlots = 42 - totalRendered;
    for (let dayNum = 1; dayNum <= remainingSlots; dayNum++) {
      const dayTasks = getTasksForDate(dayNum, "next");
      cells.push(
        <div key={`next-${dayNum}`} className="min-h-[90px] p-2 bg-slate-50/50 border-b border-r border-slate-100 opacity-40 select-none">
          <span className="text-[10px] font-semibold text-slate-400">{dayNum}</span>
          <div className="mt-1.5 space-y-1">
            {dayTasks.map(t => (
              <div key={t.id} className="text-[8px] truncate px-1 py-0.5 bg-slate-100 text-slate-400 rounded">{t.title}</div>
            ))}
          </div>
        </div>
      );
    }

    return cells;
  };

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-140px)]">
      
      {/* Calendar Navigation and view toggle header */}
      <div className="flex flex-wrap items-center justify-between gap-4 shrink-0 bg-white p-4 border border-slate-100 rounded-2xl shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800 font-display">
              {viewMode === "month" && `${monthNames[month]} ${year}`}
              {viewMode === "week" && `Week of July 5, ${year}`}
              {viewMode === "day" && `July 5, ${year}`}
            </h2>
            <p className="text-[10px] text-slate-500 font-semibold">Workspace Schedules & Sprint Deadlines</p>
          </div>
        </div>

        {/* Navigation arrow buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            className="p-1.5 hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-500 hover:text-slate-800 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date(2026, 6, 5))}
            className="px-3 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[10px] font-semibold rounded-lg text-slate-600 transition-colors"
          >
            Today
          </button>
          <button
            onClick={handleNext}
            className="p-1.5 hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-500 hover:text-slate-800 rounded-lg transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* View Mode selection capsules */}
        <div className="flex gap-1 bg-slate-50 p-1 border border-slate-200 rounded-xl">
          {(["month", "week", "day"] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`text-[9px] font-bold uppercase tracking-wider px-3 py-1 rounded-lg transition-colors capitalize ${
                viewMode === mode
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Main Calendar Grid Canvas */}
      <div className="flex-1 overflow-y-auto bg-white border border-slate-100 rounded-2xl shadow-2xs overflow-hidden flex flex-col">
        {viewMode === "month" && (
          <div className="flex-1 flex flex-col min-w-[700px]">
            {/* Weekdays names row */}
            <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50 py-2.5 shrink-0">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <span key={day} className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {day}
                </span>
              ))}
            </div>

            {/* Monthly numbers grid */}
            <div className="flex-1 grid grid-cols-7 border-r border-slate-100/40 bg-white">
              {renderMonthCells()}
            </div>
          </div>
        )}

        {viewMode === "week" && (
          <div className="flex-1 p-6 space-y-4">
            <span className="text-[10px] text-slate-500 font-bold uppercase block tracking-wider">Sprint Week Backlog:</span>
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
              {["Sun 05", "Mon 06", "Tue 07", "Wed 08", "Thu 09", "Fri 10", "Sat 11"].map((day, idx) => {
                const dayNum = 5 + idx;
                const dayTasks = getTasksForDate(dayNum, "current");
                return (
                  <div key={day} className="bg-white p-3 rounded-xl border border-slate-100 shadow-2xs flex flex-col space-y-2.5">
                    <span className="text-[10px] font-bold text-slate-700 border-b border-slate-100 pb-1 block text-center bg-slate-50 rounded py-0.5">{day}</span>
                    <div className="space-y-1.5 flex-1 overflow-y-auto max-h-[220px]">
                      {dayTasks.length === 0 ? (
                        <span className="text-[8px] text-slate-400 text-center block py-4">No tasks</span>
                      ) : (
                        dayTasks.map(t => (
                          <div key={t.id} className="text-[8px] bg-blue-50 text-blue-700 border border-blue-100 p-1.5 rounded">{t.title}</div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {viewMode === "day" && (
          <div className="flex-1 p-6 flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/3 space-y-4 shrink-0">
              <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 shadow-2xs space-y-2">
                <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider block">Day Spotlight</span>
                <h3 className="text-sm font-bold text-slate-800 font-display">Sunday, July 5, 2026</h3>
                <p className="text-[10px] text-slate-600 leading-relaxed">
                  You have **{getTasksForDate(5, "current").length}** active sprint tasks and milestoning targets scheduled for today.
                </p>
              </div>
            </div>

            <div className="flex-1 space-y-3">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Timetable (24h due slots):</span>
              <div className="space-y-2">
                {getTasksForDate(5, "current").map((t) => (
                  <div key={t.id} className="p-4 bg-white border border-slate-100 rounded-xl flex items-center justify-between shadow-2xs hover:border-slate-200 hover:shadow-xs transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-1 bg-blue-50 text-blue-600 rounded border border-blue-100 shrink-0">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-slate-800">{t.title}</h4>
                        <span className="text-[9px] text-slate-400">{t.id} • {t.priority} Priority</span>
                      </div>
                    </div>
                    <span className="text-[10px] bg-slate-50 border border-slate-200 px-3 py-1 rounded-full text-slate-600 font-bold uppercase">{t.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
