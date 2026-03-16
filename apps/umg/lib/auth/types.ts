export interface User {
  id: number;
  email: string;
  name: string;
  payment_status: "unpaid" | "paid";
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface DraftPhoto {
  media_id: number;
  url: string;
  title: string;
  description: string;
}

export interface DraftStudentProof {
  media_id: number;
  url: string;
  filename: string;
}

export interface DraftData {
  status: "draft" | "submitted";
  division: string;
  first_name: string;
  last_name: string;
  dob: string;
  address: string;
  school: string;
  grade: string;
  job: string;
  biography: string;
  photos: DraftPhoto[];
  student_proof: DraftStudentProof | null;
  exhibition_opt_in: boolean;
  consent_originality: boolean;
  consent_subjects: boolean;
  consent_rights: boolean;
  consent_rules: boolean;
  submitted_at: string | null;
}

export interface SaveDraftPayload {
  division: string;
  first_name: string;
  last_name: string;
  dob: string;
  address: string;
  school: string;
  grade: string;
  job: string;
  biography: string;
  photos: Array<{
    media_id: number;
    title: string;
    description: string;
  }>;
  exhibition_opt_in: boolean;
  consent_originality: boolean;
  consent_subjects: boolean;
  consent_rights: boolean;
  consent_rules: boolean;
}

export interface UploadPhotoResponse {
  id: number;
  url: string;
}

export interface UploadStudentProofResponse {
  id: number;
  url: string;
  filename: string;
}
