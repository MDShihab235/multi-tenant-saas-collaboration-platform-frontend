import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
  withCredentials: true, // Required for checkAuth() middleware
});
export interface FileRecord {
  id: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
  name: string;
  createdAt: string;
}

export const fileService = {
  /**
   * POST /api/v1/files/upload
   * Uploads a file to Cloudinary and saves the record.
   */
  uploadFile: async (
    file: File,
    onProgress?: (percent: number) => void,
  ): Promise<FileRecord> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post("/api/v1/file/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          onProgress(percent);
        }
      },
    });

    return response.data.data;
  },
  getMyFiles: async (): Promise<FileRecord[]> => {
    try {
      const response = await api.get("/api/v1/file/my");
      return response.data.data;
    } catch (error) {
      throw new Error("Failed to synchronize with the Vault.");
    }
  },
  getFileById: async (fileId: string): Promise<FileRecord> => {
    try {
      const response = await api.get(`/api/v1/file/${fileId}`);
      return response.data.data;
    } catch (error) {
      throw new Error(
        "Access Denied: You are not the authorized handler for this asset.",
      );
    }
  },
  deleteFile: async (fileId: string): Promise<void> => {
    try {
      await api.delete(`/api/v1/file/${fileId}`);
    } catch (error) {
      throw new Error("Termination failed. Asset remains in the Vault.");
    }
  },
};
