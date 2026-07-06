export enum UserRole {
  ADMIN = "Admin",
  PROJECT_MANAGER = "Project Manager",
  TEAM_MEMBER = "Team Member"
}

export enum ProjectStatus {
  PLANNING = "Planning",
  IN_PROGRESS = "In Progress",
  REVIEW = "Review",
  ARCHIVED = "Archived",
  COMPLETED = "Completed"
}

export enum ProjectPriority {
  LOW = "Low",
  MEDIUM = "Medium",
  HIGH = "High",
  CRITICAL = "Critical"
}

export enum TaskStatus {
  TO_DO = "To Do",
  IN_PROGRESS = "In Progress",
  REVIEW = "Review",
  BLOCKED = "Blocked",
  COMPLETED = "Completed",
  CANCELLED = "Cancelled"
}

export enum TaskPriority {
  LOW = "Low",
  MEDIUM = "Medium",
  HIGH = "High",
  CRITICAL = "Critical"
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  department?: string;
  role: UserRole;
  bio?: string;
  skills: string[];
  joinedDate: string;
  lastActive: string;
  avatar?: string;
}

export interface Organization {
  id: string;
  name: string;
  logo?: string;
  domain?: string;
  brandingColor?: string;
  settings?: {
    allowInvites: boolean;
    requireTwoFactor: boolean;
  };
}

export interface Team {
  id: string;
  name: string;
  leaderId: string;
  memberIds: string[];
  description: string;
  orgId: string;
}

export interface Milestone {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
}

export interface Project {
  id: string;
  name: string;
  orgId: string;
  coverImage?: string;
  description: string;
  startDate: string;
  deadline: string;
  priority: ProjectPriority;
  status: ProjectStatus;
  progress: number; // 0-100
  managerId: string;
  memberIds: string[];
  budget?: number;
  tags: string[];
  milestones: Milestone[];
  dependencies: string[]; // project ids
  health: "Healthy" | "At Risk" | "Critical";
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface TaskAttachment {
  id: string;
  name: string;
  url: string;
  size: string;
  mimeType: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface TaskReaction {
  emoji: string;
  userIds: string[];
}

export interface TaskReply {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  timestamp: string;
}

export interface TaskComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  timestamp: string;
  replies: TaskReply[];
  reactions: TaskReaction[];
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  labels: string[];
  dueDate: string;
  estimatedHours: number;
  actualHours: number;
  reporterId: string;
  assigneeId: string;
  watcherIds: string[];
  checklist: ChecklistItem[];
  attachments: TaskAttachment[];
  comments: TaskComment[];
  subtasks: Subtask[];
  dependencies: string[]; // task ids
  timeLogged?: { userId: string; hours: number; date: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "task_assigned" | "task_completed" | "comment_added" | "deadline_reminder" | "project_created" | "mention" | "invitation";
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface ActivityLog {
  id: string;
  projectId?: string;
  taskId?: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: string;
}
