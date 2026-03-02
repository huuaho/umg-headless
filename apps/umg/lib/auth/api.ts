import type {
  AuthResponse,
  DraftData,
  SaveDraftPayload,
  UploadPhotoResponse,
  User,
} from "./types";

const API_BASE =
  (process.env.NEXT_PUBLIC_WP_API_URL ||
    "https://www.api.unitedmediadc.com/wp-json") + "/umg/v1";

export class CompetitionApiError extends Error {
  code: string;
  status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.name = "CompetitionApiError";
    this.code = code;
    this.status = status;
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorBody: { code?: string; message?: string } | null = null;
    try {
      errorBody = await response.json();
    } catch {
      // Response is not JSON
    }
    throw new CompetitionApiError(
      errorBody?.code || "api_error",
      errorBody?.message ||
        `API error: ${response.status} ${response.statusText}`,
      response.status
    );
  }
  return response.json();
}

function authHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
  };
}

// --- Auth ---

export async function requestCode(email: string): Promise<void> {
  const response = await fetch(`${API_BASE}/auth/request-code`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ email }),
  });
  await handleResponse<{ success: boolean }>(response);
}

export async function verifyCode(
  email: string,
  code: string
): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE}/auth/verify-code`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ email, code }),
  });
  return handleResponse<AuthResponse>(response);
}

export async function fetchCurrentUser(token: string): Promise<User> {
  const response = await fetch(`${API_BASE}/me`, {
    headers: authHeaders(token),
  });
  return handleResponse<User>(response);
}

// --- Draft ---

export async function loadDraft(token: string): Promise<DraftData | null> {
  const response = await fetch(`${API_BASE}/draft`, {
    headers: authHeaders(token),
  });
  if (response.status === 404) return null;
  return handleResponse<DraftData>(response);
}

export async function saveDraft(
  token: string,
  data: SaveDraftPayload
): Promise<void> {
  const response = await fetch(`${API_BASE}/draft`, {
    method: "PUT",
    headers: {
      ...authHeaders(token),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  await handleResponse<{ success: boolean }>(response);
}

export async function uploadPhoto(
  token: string,
  file: File
): Promise<UploadPhotoResponse> {
  const formData = new FormData();
  formData.append("photo", file);

  const response = await fetch(`${API_BASE}/draft/photo`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    body: formData,
  });
  return handleResponse<UploadPhotoResponse>(response);
}

export async function removePhoto(
  token: string,
  mediaId: number
): Promise<void> {
  const response = await fetch(`${API_BASE}/draft/photo/${mediaId}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  await handleResponse<{ success: boolean }>(response);
}

// --- Submit ---

export async function submitEntry(token: string): Promise<void> {
  const response = await fetch(`${API_BASE}/submit`, {
    method: "POST",
    headers: authHeaders(token),
  });
  await handleResponse<{ success: boolean }>(response);
}
