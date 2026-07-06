export interface JudgingPhoto {
  url: string;
  title: string;
  description: string;
}

/** Present only for admins (or when blind judging is disabled server-side). */
export interface EntryIdentity {
  first_name: string;
  last_name: string;
  school: string;
  grade: string;
  // Optional: only present once the plugin's recommender update is deployed.
  recommender?: string;
}

export type ScoreStatus = "unscored" | "draft" | "final";

export interface SubmissionSummary {
  id: number;
  division: string;
  submitted_at: string | null;
  photos: JudgingPhoto[];
  my_score_status: ScoreStatus;
  my_total: number | null;
  identity?: EntryIdentity;
}

export interface SubmissionList {
  entries: SubmissionSummary[];
  total: number;
  page: number;
  per_page: number;
  blind: boolean;
}

export interface JudgeScore {
  judge_id: number;
  scores: Record<string, number>;
  total: number;
  notes: string;
  criteria_version: string;
  status: "draft" | "final";
  updated_at: string;
}

export interface SubmissionDetail {
  id: number;
  division: string;
  submitted_at: string | null;
  photos: JudgingPhoto[];
  biography: string;
  my_score: JudgeScore | null;
  blind: boolean;
  identity?: EntryIdentity;
}

export interface SaveScorePayload {
  scores: Record<string, number>;
  notes: string;
  status: "draft" | "final";
  criteria_version: string;
}

export interface ResultsRow {
  id: number;
  division: string;
  identity: EntryIdentity;
  submitted_at: string | null;
  judge_count: number;
  final_count: number;
  average_total: number | null;
  criterion_averages: Record<string, number | null>;
  rank: number | null;
}
