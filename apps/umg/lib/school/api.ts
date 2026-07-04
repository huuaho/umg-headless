import { CompetitionApiError } from "@/lib/auth/api";
import type {
  ApplicationDetail,
  ApplicationSummary,
  CheckoutSessionResponse,
  SaveApplicationPayload,
  UploadApplicationPhotoResponse,
} from "./types";

const API_BASE =
  (process.env.NEXT_PUBLIC_WP_API_URL ||
    "https://www.api.unitedmediadc.com/wp-json") + "/umg/v1";

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

export async function listApplications(
  token: string
): Promise<ApplicationSummary[]> {
  const response = await fetch(`${API_BASE}/school/applications`, {
    headers: authHeaders(token),
  });
  const data = await handleResponse<{ applications: ApplicationSummary[] }>(
    response
  );
  return data.applications;
}

export async function createApplication(token: string): Promise<number> {
  const response = await fetch(`${API_BASE}/school/applications`, {
    method: "POST",
    headers: authHeaders(token),
  });
  const data = await handleResponse<{ id: number }>(response);
  return data.id;
}

export async function getApplication(
  token: string,
  id: number
): Promise<ApplicationDetail> {
  const response = await fetch(`${API_BASE}/school/application/${id}`, {
    headers: authHeaders(token),
  });
  return handleResponse<ApplicationDetail>(response);
}

export async function saveApplication(
  token: string,
  id: number,
  data: SaveApplicationPayload
): Promise<void> {
  const response = await fetch(`${API_BASE}/school/application/${id}`, {
    method: "PUT",
    headers: {
      ...authHeaders(token),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  await handleResponse<{ success: boolean }>(response);
}

export async function deleteApplication(
  token: string,
  id: number
): Promise<void> {
  const response = await fetch(`${API_BASE}/school/application/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  await handleResponse<{ success: boolean }>(response);
}

export async function submitApplication(
  token: string,
  id: number
): Promise<void> {
  const response = await fetch(`${API_BASE}/school/application/${id}/submit`, {
    method: "POST",
    headers: authHeaders(token),
  });
  await handleResponse<{ success: boolean }>(response);
}

export async function uploadPhoto(
  token: string,
  id: number,
  file: File
): Promise<UploadApplicationPhotoResponse> {
  const formData = new FormData();
  formData.append("photo", file);

  const response = await fetch(`${API_BASE}/school/application/${id}/photo`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    body: formData,
  });
  return handleResponse<UploadApplicationPhotoResponse>(response);
}

export async function removePhoto(
  token: string,
  id: number,
  mediaId: number
): Promise<void> {
  const response = await fetch(
    `${API_BASE}/school/application/${id}/photo/${mediaId}`,
    {
      method: "DELETE",
      headers: authHeaders(token),
    }
  );
  await handleResponse<{ success: boolean }>(response);
}

export async function createCheckoutSession(
  token: string
): Promise<CheckoutSessionResponse> {
  const response = await fetch(`${API_BASE}/school/checkout`, {
    method: "POST",
    headers: authHeaders(token),
  });
  return handleResponse<CheckoutSessionResponse>(response);
}
