import { 
  User, Project, Task, Notification, Team, Organization, TaskComment 
} from "../types";

const getHeaders = () => {
  const token = localStorage.getItem("taskforge_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {})
  };
};

export async function request(url: string, options: RequestInit = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getHeaders(),
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Session setup helper
  setAuthToken: (token: string) => {
    if (token) {
      localStorage.setItem("taskforge_token", token);
    } else {
      localStorage.removeItem("taskforge_token");
    }
  },

  // Auth
  login: (credentials: any) => request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials)
  }),
  
  register: (data: any) => request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(data)
  }),
  
  me: () => request("/api/auth/me"),
  
  forgotPassword: (email: string) => request("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email })
  }),
  
  resetPassword: (data: any) => request("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(data)
  }),
  
  updateProfile: (data: any) => request("/api/auth/profile", {
    method: "PUT",
    body: JSON.stringify(data)
  }),
  
  changePassword: (data: any) => request("/api/auth/change-password", {
    method: "POST",
    body: JSON.stringify(data)
  }),

  // Projects
  getProjects: () => request("/api/projects"),
  createProject: (data: any) => request("/api/projects", {
    method: "POST",
    body: JSON.stringify(data)
  }),
  updateProject: (id: string, data: any) => request(`/api/projects/${id}`, {
    method: "PUT",
    body: JSON.stringify(data)
  }),
  deleteProject: (id: string) => request(`/api/projects/${id}`, {
    method: "DELETE"
  }),

  // Tasks
  getTasks: () => request("/api/tasks"),
  createTask: (data: any) => request("/api/tasks", {
    method: "POST",
    body: JSON.stringify(data)
  }),
  updateTask: (id: string, data: any) => request(`/api/tasks/${id}`, {
    method: "PUT",
    body: JSON.stringify(data)
  }),
  deleteTask: (id: string) => request(`/api/tasks/${id}`, {
    method: "DELETE"
  }),
  addTaskComment: (taskId: string, content: string) => request(`/api/tasks/${taskId}/comments`, {
    method: "POST",
    body: JSON.stringify({ content })
  }),

  // Organizations & Users
  getUsers: () => request("/api/users"),
  getOrganizations: () => request("/api/organizations"),
  getTeams: () => request("/api/teams"),
  createTeam: (data: any) => request("/api/teams", {
    method: "POST",
    body: JSON.stringify(data)
  }),

  // Notifications
  getNotifications: () => request("/api/notifications"),
  markNotificationRead: (id: string) => request(`/api/notifications/${id}/read`, {
    method: "PUT"
  }),
  markAllNotificationsRead: () => request("/api/notifications/read-all", {
    method: "POST"
  }),

  // Dashboard Stats
  getDashboardStats: () => request("/api/dashboard/stats"),

  // Search
  search: (query: string) => request(`/api/search?q=${encodeURIComponent(query)}`),

  // File Upload
  uploadFile: (fileName: string, fileType: string, base64Data: string, taskId?: string) => request("/api/files/upload", {
    method: "POST",
    body: JSON.stringify({ fileName, fileType, base64Data, taskId })
  }),

  // AI Assistant (TaskForge AI)
  aiChat: (prompt: string, projectId?: string, taskId?: string) => request("/api/ai/chat", {
    method: "POST",
    body: JSON.stringify({ prompt, projectId, taskId })
  })
};
export default api;
