export interface ApplicationSummary {
  id: number;
  division: string;
  first_name: string;
  last_name: string;
  status: "draft" | "submitted";
  payment_status: "unpaid" | "paid";
}

export interface ApplicationPhoto {
  media_id: number;
  url: string;
  title: string;
  description: string;
}

export interface ApplicationDetail {
  id: number;
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
  photos: ApplicationPhoto[];
  consent_originality: boolean;
  consent_subjects: boolean;
  consent_rights: boolean;
  consent_rules: boolean;
  consent_social_media: boolean;
  social_links: string;
  submitted_at: string | null;
  payment_status: "unpaid" | "paid";
  payment_date: string | null;
}

export interface SaveApplicationPayload {
  division?: string;
  first_name?: string;
  last_name?: string;
  dob?: string;
  address?: string;
  school?: string;
  grade?: string;
  job?: string;
  biography?: string;
  photos?: Array<{
    media_id: number;
    title?: string;
    description?: string;
  }>;
  consent_originality?: boolean;
  consent_subjects?: boolean;
  consent_rights?: boolean;
  consent_rules?: boolean;
  consent_social_media?: boolean;
  social_links?: string;
}

export interface UploadApplicationPhotoResponse {
  id: number;
  url: string;
}

export interface CheckoutSessionResponse {
  url: string;
  application_ids: number[];
  quantity: number;
  total: number;
}
