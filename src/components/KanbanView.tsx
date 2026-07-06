import React, { useState, useEffect } from "react";
import { 
  Plus, Calendar, Eye, Trash2, Edit, CheckCircle, Clock, User, MessageSquare, Paperclip, CheckSquare, ListTodo, AlertTriangle, ArrowRight, X, PlayCircle, PlusCircle, ArrowUpRight 
} from "lucide-react";
import { Task, TaskPriority, TaskStatus, UserRole } from "../types";
import { api } from "../services/api";
import UserAvatar from "./UserAvatar";

interface KanbanViewProps {
  apiClient: any;
  activeProjectId: string | null;
  activeUserId: string;
}

const statusColumns = [
  { id: TaskStatus.TO_DO, name: "To Do", color: "bg-slate-100 text-slate-600 border-slate-200" },
  { id: TaskStatus.IN_PROGRESS, name: "In Progress", color: "bg-blue-50 text-blue-700 border-blue-200" },
  { id: TaskStatus.REVIEW, name: "Review", color: "bg-purple-50 text-purple-700 border-purple-200" },
  { id: TaskStatus.BLOCKED, name: "Blocked", color: "bg-red-50 text-red-700 border-red-200" },
  { id: TaskStatus.COMPLETED, name: "Completed", color: "bg-emerald-50 text-emerald-700 border-emerald-200" }
];

export default function KanbanView({ apiClient, activeProjectId, activeUserId }: KanbanViewProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  // Create task states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createColumnId, setCreateColumnId] = useState<TaskStatus>(TaskStatus.TO_DO);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPriority, setNewPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);
  const [newAssignee, setNewAssignee] = useState(activeUserId);
  const [newProjectSelected, setNewProjectSelected] = useState("");

  // Task details editing states
  const [commentInput, setCommentInput] = useState("");
  const [checklistInput, setChecklistInput] = useState("");
  const [subtaskInput, setSubtaskInput] = useState("");
  const [logHoursInput, setLogHoursInput] = useState("");

  // Filter states
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");

  const fetchData = async () => {
    setLoading(true);
    try {
      const allTasks = await apiClient.getTasks();
      setTasks(allTasks);
      const allProjects = await apiClient.getProjects();
      setProjects(allProjects);
      const allUsers = await apiClient.getUsers();
      setUsers(allUsers);
      
      if (activeProjectId) {
        setNewProjectSelected(activeProjectId);
      } else if (allProjects.length > 0) {
        setNewProjectSelected(allProjects[0].id);
      }
    } catch (err) {
      console.error("Failed to load Kanban tasks", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeProjectId]);

  // Handle Drag & Drop
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("text/plain", taskId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("text/plain");
    if (!taskId) return;

    // Optimistic UI state update
    const updatedTasks = tasks.map(t => t.id === taskId ? { ...t, status: targetStatus } : t);
    setTasks(updatedTasks);

    try {
      await apiClient.updateTask(taskId, { status: targetStatus });
    } catch (err) {
      console.error("Failed to update task status on drop", err);
      // Revert state
      fetchData();
    }
  };

  // Create task
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newProjectSelected) return;

    try {
      await apiClient.createTask({
        projectId: newProjectSelected,
        title: newTitle,
        description: newDesc,
        priority: newPriority,
        status: createColumnId,
        assigneeId: newAssignee
      });

      setShowCreateForm(false);
      setNewTitle("");
      setNewDesc("");
      fetchData();
    } catch (err) {
      alert("Failed to create task: " + err);
    }
  };

  // Add Comment
  const handleAddComment = async () => {
    if (!selectedTask || !commentInput.trim()) return;
    try {
      const updatedComment = await apiClient.addTaskComment(selectedTask.id, commentInput);
      const updatedTask = {
        ...selectedTask,
        comments: [...selectedTask.comments, updatedComment]
      };
      setSelectedTask(updatedTask);
      setTasks(tasks.map(t => t.id === selectedTask.id ? updatedTask : t));
      setCommentInput("");
    } catch (err) {
      alert("Failed to submit comment: " + err);
    }
  };

  // Save specific task updates
  const handleSaveTaskUpdates = async (updates: Partial<Task>) => {
    if (!selectedTask) return;
    try {
      const updated = await apiClient.updateTask(selectedTask.id, updates);
      setSelectedTask(updated);
      setTasks(tasks.map(t => t.id === selectedTask.id ? updated : t));
    } catch (err) {
      alert("Failed to save changes: " + err);
    }
  };

  // Add checklist item
  const handleAddChecklistItem = async () => {
    if (!selectedTask || !checklistInput.trim()) return;
    const newItem = {
      id: "chk-" + Math.random().toString(36).substring(2, 9),
      text: checklistInput,
      completed: false
    };
    const updatedChecklist = [...selectedTask.checklist, newItem];
    await handleSaveTaskUpdates({ checklist: updatedChecklist });
    setChecklistInput("");
  };

  // Toggle checklist item
  const handleToggleChecklist = async (itemId: string, completed: boolean) => {
    if (!selectedTask) return;
    const updatedChecklist = selectedTask.checklist.map(item => 
      item.id === itemId ? { ...item, completed } : item
    );
    await handleSaveTaskUpdates({ checklist: updatedChecklist });
  };

  // Add Subtask
  const handleAddSubtask = async () => {
    if (!selectedTask || !subtaskInput.trim()) return;
    const newSub = {
      id: "sub-" + Math.random().toString(36).substring(2, 9),
      title: subtaskInput,
      completed: false
    };
    const updatedSubs = [...selectedTask.subtasks, newSub];
    await handleSaveTaskUpdates({ subtasks: updatedSubs });
    setSubtaskInput("");
  };

  // Toggle subtask
  const handleToggleSubtask = async (subId: string, completed: boolean) => {
    if (!selectedTask) return;
    const updatedSubs = selectedTask.subtasks.map(s => 
      s.id === subId ? { ...s, completed } : s
    );
    await handleSaveTaskUpdates({ subtasks: updatedSubs });
  };

  // Log Hours
  const handleLogHours = async () => {
    if (!selectedTask || !logHoursInput) return;
    const hours = Number(logHoursInput);
    if (isNaN(hours) || hours <= 0) return;
    const updatedActual = selectedTask.actualHours + hours;
    await handleSaveTaskUpdates({ actualHours: updatedActual });
    setLogHoursInput("");
  };

  // File Upload (Base64 helper)
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedTask) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = (reader.result as string).split(",")[1];
      try {
        await apiClient.uploadFile(file.name, file.type, base64Data, selectedTask.id);
        // Refresh detail view
        const allTasks = await apiClient.getTasks();
        setTasks(allTasks);
        const refreshed = allTasks.find((t: Task) => t.id === selectedTask.id);
        if (refreshed) setSelectedTask(refreshed);
      } catch (err) {
        alert("Failed to upload: " + err);
      }
    };
    reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-5 gap-4 animate-pulse h-96">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="bg-white border border-slate-100 rounded-2xl h-full" />
        ))}
      </div>
    );
  }

  // Filter tasks based on projects/priority/assignee filters
  const filteredTasks = tasks.filter(task => {
    if (activeProjectId && task.projectId !== activeProjectId) return false;
    if (priorityFilter !== "all" && task.priority !== priorityFilter) return false;
    if (assigneeFilter !== "all" && task.assigneeId !== assigneeFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-140px)]">
      
      {/* Filters Header toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 shrink-0 bg-white p-4 border border-slate-100 rounded-2xl shadow-xs">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">FILTERS:</span>
          
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-600 text-xs px-2.5 py-1.5 rounded-xl focus:outline-none"
          >
            <option value="all">All Priorities</option>
            {Object.values(TaskPriority).map(p => <option key={p} value={p}>{p} Priority</option>)}
          </select>

          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-600 text-xs px-2.5 py-1.5 rounded-xl focus:outline-none"
          >
            <option value="all">All Contributors</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </div>

        {activeProjectId && (
          <button
            onClick={() => {
              setCreateColumnId(TaskStatus.TO_DO);
              setShowCreateForm(true);
            }}
            className="flex items-center gap-1 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs px-3.5 py-1.5 font-semibold transition-all"
          >
            <Plus className="w-4 h-4" /> Add Task
          </button>
        )}
      </div>

      {/* Kanban Grid */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4 overflow-y-auto min-h-0">
        {statusColumns.map((col) => {
          const colTasks = filteredTasks.filter(t => t.status === col.id);
          return (
            <div
              key={col.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
              className="flex flex-col bg-slate-50/50 border border-slate-100 rounded-2xl p-3 min-h-[400px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-3 shrink-0">
                <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold shadow-2xs ${col.color}`}>
                  {col.name} ({colTasks.length})
                </span>
                <button
                  onClick={() => {
                    setCreateColumnId(col.id);
                    setShowCreateForm(true);
                  }}
                  className="p-1 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Column Task Stack */}
              <div className="flex-1 space-y-2.5 overflow-y-auto pr-1">
                {colTasks.length === 0 ? (
                  <div className="h-20 flex items-center justify-center border border-dashed border-slate-200 rounded-xl text-[10px] text-slate-500">
                    Drag backlogs here
                  </div>
                ) : (
                  colTasks.map((task) => {
                    const assignee = users.find(u => u.id === task.assigneeId);
                    const completedChecklist = task.checklist.filter(c => c.completed).length;
                    return (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        onClick={() => setSelectedTask(task)}
                        className="bg-white p-4 rounded-xl border border-slate-100 cursor-grab hover:border-slate-300 hover:shadow-xs transition-all space-y-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase border ${
                            task.priority === TaskPriority.CRITICAL ? "bg-red-50 text-red-600 border-red-100" :
                            task.priority === TaskPriority.HIGH ? "bg-orange-50 text-orange-600 border-orange-100" :
                            "bg-slate-50 text-slate-500 border-slate-200"
                          }`}>
                            {task.priority}
                          </span>
                          <span className="text-[9px] font-mono text-slate-400">
                            {task.id}
                          </span>
                        </div>

                        <h4 className="text-xs font-semibold text-slate-700 leading-snug group-hover:text-blue-600">
                          {task.title}
                        </h4>

                        {/* Checklist + comments count meta badges */}
                        {(task.checklist.length > 0 || task.comments.length > 0 || task.attachments.length > 0) && (
                          <div className="flex items-center gap-3 text-[9px] text-slate-500 pt-1">
                            {task.checklist.length > 0 && (
                              <span className="flex items-center gap-1"><CheckSquare className="w-3 h-3" /> {completedChecklist}/{task.checklist.length}</span>
                            )}
                            {task.comments.length > 0 && (
                              <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {task.comments.length}</span>
                            )}
                            {task.attachments.length > 0 && (
                              <span className="flex items-center gap-1"><Paperclip className="w-3 h-3" /> {task.attachments.length}</span>
                            )}
                          </div>
                        )}

                        {/* Card contributor info footer */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                          <span className="flex items-center gap-1 text-[9px] text-slate-500"><Calendar className="w-3 h-3" /> {task.dueDate}</span>
                          <UserAvatar
                            name={assignee?.name || "Unassigned"}
                            avatarUrl={assignee?.avatar}
                            className="w-4 h-4 text-[7px]"
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Creation popover Overlay */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex justify-center items-center p-4">
          <div className="w-full max-w-md glass-panel text-slate-700 rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">Add Backlog Task</h3>
                <p className="text-[10px] text-slate-500">Insert actionable deliverables inside current active sprints.</p>
              </div>
              <button onClick={() => setShowCreateForm(false)} className="text-slate-400 hover:text-slate-800"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleCreateTask} className="p-5 space-y-4">
              {!activeProjectId && (
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Select Project</label>
                  <select
                    value={newProjectSelected}
                    onChange={(e) => setNewProjectSelected(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Task Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Draft project spec token variables"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Task Description</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Outline acceptance criteria or links..."
                  rows={3}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none"
                  >
                    {Object.values(TaskPriority).map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Assignee</label>
                  <select
                    value={newAssignee}
                    onChange={(e) => setNewAssignee(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none"
                  >
                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-xl text-xs font-semibold border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-xs"
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Details Side Slider/Overlay */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-2xl bg-white border-l border-slate-200 h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
            
            {/* Header toolbar */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono text-slate-400">{selectedTask.id}</span>
                <span className={`text-[9px] px-2 py-0.5 rounded-full border ${
                  selectedTask.priority === TaskPriority.CRITICAL ? "bg-red-50 text-red-600 border-red-100" : "bg-slate-100 text-slate-600 border-slate-200"
                }`}>
                  {selectedTask.priority} Priority
                </span>
              </div>
              <button
                onClick={() => {
                  setSelectedTask(null);
                  fetchData();
                }}
                className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable details */}
            <div className="flex-1 p-6 overflow-y-auto space-y-6">
              
              {/* Title and description */}
              <div className="space-y-3">
                <h2 className="text-xl font-bold text-slate-800 font-display">{selectedTask.title}</h2>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {selectedTask.description || "No task description drafted."}
                </p>
              </div>

              {/* Grid details (Assignee, status selectors) */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50/50 border border-slate-100 rounded-2xl">
                <div>
                  <span className="block text-[8px] text-slate-500 uppercase tracking-wider font-bold mb-1">Status</span>
                  <select
                    value={selectedTask.status}
                    onChange={(e) => handleSaveTaskUpdates({ status: e.target.value as TaskStatus })}
                    className="bg-white border border-slate-200 text-xs px-2 py-1 rounded-lg text-slate-800"
                  >
                    {statusColumns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div>
                  <span className="block text-[8px] text-slate-500 uppercase tracking-wider font-bold mb-1">Assignee</span>
                  <select
                    value={selectedTask.assigneeId}
                    onChange={(e) => handleSaveTaskUpdates({ assigneeId: e.target.value })}
                    className="bg-white border border-slate-200 text-xs px-2 py-1 rounded-lg text-slate-800"
                  >
                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>

                <div>
                  <span className="block text-[8px] text-slate-500 uppercase tracking-wider font-bold mb-1">Hours Logged</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-emerald-600">{selectedTask.actualHours} hrs</span>
                    <span className="text-[10px] text-slate-500">of {selectedTask.estimatedHours || 0}</span>
                  </div>
                </div>

                <div>
                  <span className="block text-[8px] text-slate-500 uppercase tracking-wider font-bold mb-1">Due Date</span>
                  <input
                    type="date"
                    value={selectedTask.dueDate}
                    onChange={(e) => handleSaveTaskUpdates({ dueDate: e.target.value })}
                    className="bg-white border border-slate-200 text-xs px-1.5 py-0.5 rounded text-slate-800"
                  />
                </div>
              </div>

              {/* Log Hours trigger section */}
              <div className="space-y-2">
                <span className="text-[10px] text-slate-600 uppercase tracking-wider font-bold">Log Workspace Effort</span>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={logHoursInput}
                    onChange={(e) => setLogHoursInput(e.target.value)}
                    placeholder="Log extra hours (e.g., 4)"
                    className="bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-xs text-slate-800 focus:outline-none"
                  />
                  <button
                    onClick={handleLogHours}
                    className="px-4 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold rounded-xl"
                  >
                    Log Hours
                  </button>
                </div>
              </div>

              {/* Checklist items */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-emerald-500" /> Task Checklist
                </span>
                <div className="space-y-2">
                  {selectedTask.checklist.map(item => (
                    <div key={item.id} className="flex items-center gap-2 text-xs">
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={(e) => handleToggleChecklist(item.id, e.target.checked)}
                        className="rounded border-slate-200 bg-white text-blue-600 focus:ring-0"
                      />
                      <span className={item.completed ? "line-through text-slate-400" : "text-slate-700"}>{item.text}</span>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={checklistInput}
                      onChange={(e) => setChecklistInput(e.target.value)}
                      placeholder="Add checklist spec..."
                      className="flex-1 bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-xs text-slate-800 focus:outline-none"
                    />
                    <button onClick={handleAddChecklistItem} className="px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs"><Plus className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>

              {/* Subtasks items */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold flex items-center gap-1.5">
                  <ListTodo className="w-4 h-4 text-purple-500" /> Subtask backlog
                </span>
                <div className="space-y-2">
                  {selectedTask.subtasks.map(sub => (
                    <div key={sub.id} className="flex items-center gap-2 text-xs">
                      <input
                        type="checkbox"
                        checked={sub.completed}
                        onChange={(e) => handleToggleSubtask(sub.id, e.target.checked)}
                        className="rounded border-slate-200 bg-white text-purple-600 focus:ring-0"
                      />
                      <span className={sub.completed ? "line-through text-slate-400" : "text-slate-700"}>{sub.title}</span>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={subtaskInput}
                      onChange={(e) => setSubtaskInput(e.target.value)}
                      placeholder="Add subtask title..."
                      className="flex-1 bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-xs text-slate-800 focus:outline-none"
                    />
                    <button onClick={handleAddSubtask} className="px-3 py-1.5 bg-purple-600 text-white rounded-xl text-xs"><Plus className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>

              {/* File Attachment Upload */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold flex items-center gap-1.5">
                  <Paperclip className="w-4 h-4 text-blue-500" /> Deliverable Attachments
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {selectedTask.attachments.map(att => (
                    <a
                      key={att.id}
                      href={att.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl flex items-center justify-between text-[10px] text-slate-700 shadow-2xs"
                    >
                      <span className="font-semibold truncate max-w-[120px]">{att.name}</span>
                      <span className="text-slate-400">{att.size}</span>
                    </a>
                  ))}
                </div>
                <div className="border border-dashed border-slate-200 rounded-2xl p-4 text-center cursor-pointer hover:border-slate-300 hover:bg-slate-50/50 transition-colors relative">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <Paperclip className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
                  <span className="text-[10px] text-slate-500 font-semibold block">Click or Drop deliverables here</span>
                  <span className="text-[8px] text-slate-400">Supports PDF, JSON, PNG (Max 5MB)</span>
                </div>
              </div>

              {/* Comment Thread Thread */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Workspace Discussions</span>
                <div className="space-y-3">
                  {selectedTask.comments.map(com => (
                    <div key={com.id} className="p-3 bg-slate-50/70 rounded-xl border border-slate-100 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <UserAvatar name={com.userName} avatarUrl={com.userAvatar} className="w-4 h-4 text-[7px]" />
                          <span className="text-[10px] font-bold text-slate-600">{com.userName}</span>
                        </div>
                        <span className="text-[8px] text-slate-400">{new Date(com.timestamp).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{com.content}</p>
                    </div>
                  ))}
                  
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      placeholder="Comment on task deliverables..."
                      className="flex-1 bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                    <button
                      onClick={handleAddComment}
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold"
                    >
                      Post
                    </button>
                  </div>
                </div>
              </div>

            </div>

            {/* Close footer panel */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
              <button
                onClick={() => {
                  setSelectedTask(null);
                  fetchData();
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold border border-slate-200"
              >
                Close Panel
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
