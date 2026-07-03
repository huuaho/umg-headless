import { CompetitionApiError } from "@/lib/auth/api";
import type {
  SaveScorePayload,
  JudgeScore,
  ResultsRow,
  SubmissionDetail,
  SubmissionList,
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

export async function listSubmissions(
  token: string,
  filters?: { division?: string; page?: number }
): Promise<SubmissionList> {
  const params = new URLSearchParams();
  if (filters?.division) params.set("division", filters.division);
  if (filters?.page) params.set("page", String(filters.page));
  const qs = params.toString();

  const response = await fetch(
    `${API_BASE}/admin/submissions${qs ? `?${qs}` : ""}`,
    { headers: authHeaders(token) }
  );
  return handleResponse<SubmissionList>(response);
}

export async function getSubmission(
  token: string,
  id: number
): Promise<SubmissionDetail> {
  const response = await fetch(`${API_BASE}/admin/submissions/${id}`, {
    headers: authHeaders(token),
  });
  return handleResponse<SubmissionDetail>(response);
}

export async function saveScore(
  token: string,
  id: number,
  payload: SaveScorePayload
): Promise<JudgeScore> {
  const response = await fetch(`${API_BASE}/admin/submissions/${id}/score`, {
    method: "PUT",
    headers: {
      ...authHeaders(token),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  return handleResponse<JudgeScore>(response);
}

export async function getResults(
  token: string
): Promise<{ results: ResultsRow[] }> {
  const response = await fetch(`${API_BASE}/admin/results`, {
    headers: authHeaders(token),
  });
  return handleResponse<{ results: ResultsRow[] }>(response);
}

/**
 * Stable criterion key — must produce the same slugs the plugin stores
 * (PHP `sanitize_title` on save). ASCII criterion names only.
 */
export function criterionKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
