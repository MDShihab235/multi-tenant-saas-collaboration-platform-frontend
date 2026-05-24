import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
  withCredentials: true,
});

export interface Project {
  id: string;
  name: string;
  description: string | null;
  status: "ACTIVE" | "ARCHIVED" | "COMPLETED";
  createdAt: string;
  _count: {
    tasks: number;
    members: number;
  };
}

export interface PaginatedProjects {
  projects: Project[];
  total: number;
  pages: number;
}
export interface MyProject extends Project {
  organization: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface ProjectDetail extends Project {
  projectMembers: {
    userId: string;
    role: "OWNER" | "MEMBER" | "VIEWER";
    user: {
      name: string;
      email: string;
      image: string;
    };
  }[];
}
export interface ProjectStats {
  total: number;
  todo: number;
  inProgress: number;
  inReview: number;
  done: number;
  canceled: number;
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: "OWNER" | "MEMBER" | "VIEWER";
  user: {
    id: string;
    name: string;
    email: string;
    image: string;
  };
}

export interface ProjectLabel {
  id: string;
  name: string;
  color: string; // Hex code: e.g., #EF4444
  projectId: string;
  _count: {
    taskLabels: number;
  };
}
export interface CreateTaskPayload {
  title: string;
  description?: string;
  assignedTo?: string; // Must be a ProjectMember userId
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  dueDate?: string;
}
export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE" | "CANCELED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  assignedTo: string | null;
  assignee?: {
    id: string;
    name: string;
    image: string;
  };
  taskLabels: {
    label: {
      id: string;
      name: string;
      color: string;
    };
  }[];
  _count: {
    comments: number;
    attachments: number;
  };
  dueDate: string | null;
  createdAt: string;
}
export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    image: string;
  };
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  createdAt: string;
}

export type TaskStatus =
  | "TODO"
  | "IN_PROGRESS"
  | "IN_REVIEW"
  | "DONE"
  | "CANCELED";

export interface TaskComment {
  id: string;
  message: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    image?: string;
  };
}

export interface TaskAttachment {
  id: string;
  taskId: string;
  userId: string;
  name: string;
  url: string;
  fileType: string;
  size: number;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    image: string | null;
  };
}

export interface TaskLabel {
  id: string;
  taskId: string;
  labelId: string;
  label: {
    id: string;
    name: string;
    color: string;
  };
}

export interface Project {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  organizationId: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Label {
  id: string;
  name: string;
  color: string; // hex code
  projectId: string;
}
export interface TaskDetail {
  id: string;
  title: string;
  description: string | null;
  status: "BACKLOG" | "TODO" | "IN_PROGRESS" | "DONE" | "CANCELED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  projectId: string;
  assigneeId?: string;
  dueDate?: string | null;
  assignee?: {
    id: string;
    name: string;
    image?: string;
  };
  labels: Array<{
    id: string;
    name: string;
    color: string;
  }>;
  createdAt: string;
  updatedAt: string;
  _count: {
    comments: number;
    attachments: number;
  };
}
export const projectService = {
  /**
   * GET /api/v1/projects/:orgId
   * Fetches projects with optional search and pagination.
   */
  getProjects: async (
    orgId: string,
    page: number = 1,
    limit: number = 10,
    search: string = "",
  ): Promise<PaginatedProjects> => {
    try {
      const response = await api.get(`/api/v1/project/${orgId}`, {
        params: { page, limit, search },
      });
      console.log("From getProjects:", response);
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to load projects",
      );
    }
  },
  getMyProjects: async (): Promise<MyProject[]> => {
    try {
      const response = await api.get("/api/v1/project/my-projects");
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to load your projects",
      );
    }
  },
  createProject: async (
    orgSlug: string,
    payload: { name: string; description?: string },
  ): Promise<Project> => {
    try {
      const response = await api.post(`/api/v1/project/${orgSlug}`, payload);
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to create project",
      );
    }
  },
  getProjectDetail: async (
    orgId: string,
    projectId: string,
  ): Promise<ProjectDetail> => {
    try {
      const response = await api.get(`/api/v1/project/${orgId}/${projectId}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Project not found");
    }
  },
  getProjectStats: async (
    orgId: string,
    projectId: string,
  ): Promise<ProjectStats> => {
    try {
      const response = await api.get(
        `/api/v1/project/${orgId}/${projectId}/stats`,
      );
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to load project stats",
      );
    }
  },
  getProjectMembers: async (projectId: string): Promise<ProjectMember[]> => {
    try {
      const response = await api.get(`/api/v1/project-member/${projectId}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to load project members",
      );
    }
  },
  addProjectMember: async (
    projectId: string,
    payload: { userId: string; role?: "OWNER" | "MEMBER" | "VIEWER" },
  ): Promise<ProjectMember> => {
    try {
      const response = await api.post(
        `/api/v1/project-member/${projectId}`,
        payload,
      );
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to add member to project",
      );
    }
  },
  getLabels: async (projectId: string): Promise<ProjectLabel[]> => {
    try {
      const response = await api.get(`/api/v1/label/${projectId}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to load labels");
    }
  },
  createLabel: async (
    projectId: string,
    payload: { name: string; color: string },
  ): Promise<ProjectLabel> => {
    try {
      const response = await api.post(`/api/v1/label/${projectId}`, payload);
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to create label",
      );
    }
  },
  createTask: async (projectId: string, payload: CreateTaskPayload) => {
    try {
      const response = await api.post(`/api/v1/task/${projectId}`, payload);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to create task");
    }
  },
  getTasks: async (
    projectId: string,
    filters?: {
      status?: string;
      priority?: string;
      assignedTo?: string;
    },
  ): Promise<Task[]> => {
    try {
      const response = await api.get(`/api/v1/task/${projectId}`, {
        params: filters,
      });
      return response.data.data; // Note: Adjust if your API wraps this in a { tasks: [], meta: {} } pagination object
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to load tasks");
    }
  },
  getTaskDetail: async (
    projectId: string,
    taskId: string,
  ): Promise<TaskDetail> => {
    try {
      const response = await api.get(`/api/v1/task/${projectId}/${taskId}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to load task details",
      );
    }
  },
  updateTask: async (
    projectId: string,
    taskId: string,
    payload: { title?: string; priority?: string },
  ): Promise<Task> => {
    try {
      const response = await api.patch(
        `/api/v1/task/${projectId}/${taskId}`,
        payload,
      );
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to update task");
    }
  },
  updateTaskStatus: async (
    projectId: string,
    taskId: string,
    status: TaskStatus,
  ): Promise<Task> => {
    try {
      const response = await api.patch(
        `/api/v1/task/${projectId}/${taskId}/status`,
        { status },
      );
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to update status",
      );
    }
  },
  assignTask: async (
    projectId: string,
    taskId: string,
    userId: string | null,
  ): Promise<TaskDetail> => {
    try {
      const response = await api.patch(
        `/api/v1/task/${projectId}/${taskId}/assign`,
        { userId },
      );
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to update assignee",
      );
    }
  },
  unassignTask: async (
    projectId: string,
    taskId: string,
  ): Promise<TaskDetail> => {
    try {
      const response = await api.patch(
        `/api/v1/task/${projectId}/${taskId}/unassign`,
      );
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to remove assignee",
      );
    }
  },
  addComment: async (taskId: string, message: string): Promise<TaskComment> => {
    try {
      const response = await api.post(`/api/v1/task-comment/${taskId}`, {
        message,
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to post comment",
      );
    }
  },
  getTaskComments: async (taskId: string): Promise<TaskComment[]> => {
    try {
      const response = await api.get(`/api/v1/task-comment/${taskId}`);
      return response.data.data; // Array of TaskComment with user objects
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to sync transmission log",
      );
    }
  },
  updateComment: async (
    taskId: string,
    commentId: string,
    message: string,
  ): Promise<TaskComment> => {
    try {
      const response = await api.patch(
        `/api/v1/task-comment/${taskId}/${commentId}`,
        { message },
      );
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to update transmission",
      );
    }
  },
  deleteComment: async (taskId: string, commentId: string): Promise<void> => {
    try {
      await api.delete(`/api/v1/task-comment/${taskId}/${commentId}`);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to redact transmission",
      );
    }
  },
  getTaskAttachments: async (taskId: string): Promise<TaskAttachment[]> => {
    try {
      const response = await api.get(`/api/v1/task-attachment/${taskId}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to retrieve assets",
      );
    }
  },

  /**
   * POST /api/v1/task-attachments/:taskId
   */
  uploadTaskAttachment: async (
    taskId: string,
    file: File,
  ): Promise<TaskAttachment> => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await api.post(
        `/api/v1/task-attachment/${taskId}`,
        formData,
      );
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Upload failed");
    }
  },
  getAttachmentDetail: async (
    taskId: string,
    attachmentId: string,
  ): Promise<TaskAttachment> => {
    try {
      const response = await api.get(
        `/api/v1/task-attachment/${taskId}/${attachmentId}`,
      );
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Access denied to asset",
      );
    }
  },
  deleteTaskAttachment: async (
    taskId: string,
    attachmentId: string,
  ): Promise<void> => {
    try {
      await api.delete(`/api/v1/task-attachment/${taskId}/${attachmentId}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Redaction failed");
    }
  },
  assignLabel: async (taskId: string, labelId: string): Promise<TaskLabel> => {
    try {
      const response = await api.post(
        `/api/v1/label/${taskId}/assign/${labelId}`,
      );
      return response.data.data;
    } catch (error: any) {
      if (error.response?.status === 409) {
        throw new Error("Label already assigned to this task");
      }
      throw new Error(
        error.response?.data?.message || "Label assignment failed",
      );
    }
  },
  getTaskLabels: async (taskId: string): Promise<TaskLabel[]> => {
    try {
      const response = await api.get(`/api/v1/label/${taskId}/task-labels`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to sync labels");
    }
  },
  removeLabel: async (taskId: string, labelId: string): Promise<void> => {
    try {
      await api.delete(`/api/v1/label/${taskId}/remove/${labelId}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Redaction failed");
    }
  },
  removeProjectMember: async (
    projectId: string,
    userId: string,
  ): Promise<void> => {
    // DELETE /api/v1/project-members/:projectId/:userId
    await api.delete(`/api/v1/project-member/${projectId}/${userId}`);
  },
  leaveProject: async (projectId: string): Promise<void> => {
    // DELETE /api/v1/project-members/:projectId/leave
    await api.delete(`/api/v1/project-member/${projectId}/leave`);
  },

  // Add to projectService object
  getProjectBySlug: async (projectSlug: string): Promise<Project> => {
    // GET /api/v1/projects/slug/:projectSlug
    const response = await api.get(`/api/v1/project/slug/${projectSlug}`);
    return response.data.data;
  },
  updateMemberRole: async (
    projectId: string,
    userId: string,
    role: string,
  ): Promise<ProjectMember> => {
    // PATCH /api/v1/project-members/:projectId/:userId
    const response = await api.patch(
      `/api/v1/project-member/${projectId}/${userId}`,
      { role },
    );
    return response.data.data;
  },
  updateLabel: async (
    projectId: string,
    labelId: string,
    data: { name?: string; color?: string },
  ): Promise<Label> => {
    const response = await api.patch(
      `/api/v1/label/${projectId}/${labelId}`,
      data,
    );
    return response.data.data;
  },
  deleteLabel: async (projectId: string, labelId: string): Promise<void> => {
    // DELETE /api/v1/labels/:projectId/:labelId
    await api.delete(`/api/v1/label/${projectId}/${labelId}`);
  },
  deleteTask: async (projectId: string, taskId: string): Promise<void> => {
    // DELETE /api/v1/tasks/:projectId/:taskId
    await api.delete(`/api/v1/task/${projectId}/${taskId}`);
  },

  // Add to projectService object
  getTaskById: async (
    projectSlug: string,
    taskId: string,
  ): Promise<TaskDetail> => {
    // GET /api/v1/projects/${projectSlug}/tasks/${taskId}
    const response = await api.get(
      `/api/v1/project/${projectSlug}/task/${taskId}`,
    );
    return response.data.data;
  },
};
