import { TOKEN_KEY } from "@/lib/auth";
import { API_BASE_URL } from "@/lib/api";

const UPLOAD_BASE_URL = API_BASE_URL.replace(/\/api$/, "");

export type MediaUploadResult = {
  filename: string;
  originalUrl: string;
  thumbFilename: string;
  thumbUrl: string;
  width: number | null;
  height: number | null;
  mime: string;
  size: number;
};

function authHeaders() {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

function toAbsolute(url: string | null | undefined): string {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  return `${UPLOAD_BASE_URL}${url.startsWith("/") ? url : `/${url}`}`;
}

export const MediaService = {
  async upload(files: FileList | File[]): Promise<MediaUploadResult[]> {
    const form = new FormData();
    Array.from(files).forEach(file => form.append("files", file));

    const res = await fetch(`${API_BASE_URL}/media`, {
      method: "POST",
      body: form,
      headers: {
        ...authHeaders(),
      },
    });

    if (!res.ok) {
      const errorJson = await res.json().catch(() => null);
      const message = errorJson?.error ?? `HTTP ${res.status}`;
      throw new Error(message);
    }

    const data = (await res.json()) as MediaUploadResult[];
    return data.map(item => ({
      ...item,
      originalUrl: toAbsolute(item.originalUrl),
      thumbUrl: toAbsolute(item.thumbUrl ?? item.originalUrl),
    }));
  },

  async remove(filename: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/media/${encodeURIComponent(filename)}`, {
      method: "DELETE",
      headers: {
        ...authHeaders(),
      },
    });

    if (!res.ok && res.status !== 204) {
      const errorJson = await res.json().catch(() => null);
      const message = errorJson?.error ?? `HTTP ${res.status}`;
      throw new Error(message);
    }
  },
};

export default MediaService;
