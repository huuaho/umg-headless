"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { currentCompetition } from "@/lib/competitions/current";
import type { CompetitionDivision } from "@/lib/competitions/types";
import { useAuth } from "@/lib/auth/AuthContext";
import {
  loadDraft as apiLoadDraft,
  saveDraft as apiSaveDraft,
  uploadPhoto as apiUploadPhoto,
  removePhoto as apiRemovePhoto,
  uploadStudentProof as apiUploadStudentProof,
  removeStudentProof as apiRemoveStudentProof,
  submitEntry as apiSubmitEntry,
} from "@/lib/auth/api";

interface PhotoEntry {
  file: File | null; // null when loaded from server draft
  preview: string; // blob URL (local) or server URL (draft)
  mediaId: string | null; // WP media ID once uploaded
  title: string;
  description: string;
  isUploading: boolean;
}

interface StudentProofEntry {
  file: File | null;
  filename: string;
  mediaId: string | null;
  isUploading: boolean;
}

interface SubmissionFormProps {
  user: { email: string; name: string };
  onLogout: () => void;
}

function wordCount(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

export function SubmissionForm({ user, onLogout }: SubmissionFormProps) {
  const competition = currentCompetition;
  const { token, user: authUser, refreshUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [divisionId, setDivisionId] = useState(competition.divisions[0].id);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [address, setAddress] = useState("");
  const [school, setSchool] = useState("");
  const [grade, setGrade] = useState("");
  const [job, setJob] = useState("");
  const [biography, setBiography] = useState("");
  const [photos, setPhotos] = useState<PhotoEntry[]>([]);
  const [studentProof, setStudentProof] = useState<StudentProofEntry | null>(
    null,
  );
  const studentProofInputRef = useRef<HTMLInputElement>(null);
  const [exhibitionOptIn, setExhibitionOptIn] = useState(false);
  const [consentOriginality, setConsentOriginality] = useState(false);
  const [consentSubjects, setConsentSubjects] = useState(false);
  const [consentRights, setConsentRights] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoadingDraft, setIsLoadingDraft] = useState(true);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
    "idle",
  );
  const [error, setError] = useState("");
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const [paymentPollError, setPaymentPollError] = useState("");

  const selectedDivision = competition.divisions.find(
    (d) => d.id === divisionId,
  ) as CompetitionDivision;

  // --- Draft Load ---
  useEffect(() => {
    async function load() {
      if (!token) {
        setIsLoadingDraft(false);
        return;
      }
      try {
        const draft = await apiLoadDraft(token);
        if (draft) {
          if (draft.status === "submitted") {
            setIsSubmitted(true);
          }
          setDivisionId(draft.division || competition.divisions[0].id);
          setFirstName(draft.first_name || "");
          setLastName(draft.last_name || "");
          setDob(draft.dob || "");
          setAddress(draft.address || "");
          setSchool(draft.school || "");
          setGrade(draft.grade || "");
          setJob(draft.job || "");
          setBiography(draft.biography || "");
          setExhibitionOptIn(draft.exhibition_opt_in || false);
          setConsentOriginality(draft.consent_originality || false);
          setConsentSubjects(draft.consent_subjects || false);
          setConsentRights(draft.consent_rights || false);
          if (draft.photos?.length) {
            setPhotos(
              draft.photos.map((p) => ({
                file: null,
                preview: p.url,
                mediaId: String(p.media_id),
                title: p.title || "",
                description: p.description || "",
                isUploading: false,
              })),
            );
          }
          if (draft.student_proof) {
            setStudentProof({
              file: null,
              filename: draft.student_proof.filename,
              mediaId: String(draft.student_proof.media_id),
              isUploading: false,
            });
          }
        }
      } catch {
        // Draft load failed - start with empty form
      } finally {
        setIsLoadingDraft(false);
      }
    }
    load();
  }, [token, competition.divisions]);

  // --- Draft Autosave (debounced) ---
  const saveDraft = useCallback(async () => {
    if (isSubmitted || isLoadingDraft || !token) return;

    setSaveStatus("saving");

    try {
      await apiSaveDraft(token, {
        division: divisionId,
        first_name: firstName,
        last_name: lastName,
        dob,
        address,
        school,
        grade,
        job,
        biography,
        photos: photos
          .filter((p) => p.mediaId)
          .map((p) => ({
            media_id: Number(p.mediaId),
            title: p.title,
            description: p.description,
          })),
        exhibition_opt_in: exhibitionOptIn,
        consent_originality: consentOriginality,
        consent_subjects: consentSubjects,
        consent_rights: consentRights,
      });
      setSaveStatus("saved");
    } catch {
      setSaveStatus("idle");
    }
  }, [
    token,
    isSubmitted,
    isLoadingDraft,
    divisionId,
    firstName,
    lastName,
    dob,
    address,
    school,
    grade,
    job,
    biography,
    photos,
    exhibitionOptIn,
    consentOriginality,
    consentSubjects,
    consentRights,
  ]);

  // Extract photo metadata for dependency tracking
  const photoMetaKey = photos
    .map((p) => `${p.title}|${p.description}`)
    .join(",");

  // Debounce: save 2 seconds after last change
  useEffect(() => {
    if (isLoadingDraft || isSubmitted) return;

    // Don't autosave if the form is empty
    if (!firstName && !lastName && !dob && photos.length === 0) return;

    setSaveStatus("idle");
    const timer = setTimeout(() => {
      saveDraft();
    }, 2000);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    divisionId,
    firstName,
    lastName,
    dob,
    address,
    school,
    grade,
    job,
    biography,
    exhibitionOptIn,
    consentOriginality,
    consentSubjects,
    consentRights,
    photoMetaKey,
  ]);

  // --- Photo Handlers ---
  const handleAddPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    // Client-side validation
    const validTypes = ["image/jpeg", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      setError("Only JPEG/JPG files are accepted.");
      return;
    }
    if (file.size > competition.maxFileSizeMB * 1024 * 1024) {
      setError(`File exceeds ${competition.maxFileSizeMB}MB limit.`);
      return;
    }

    setError("");
    const preview = URL.createObjectURL(file);
    const newPhoto: PhotoEntry = {
      file,
      preview,
      mediaId: null,
      title: "",
      description: "",
      isUploading: true,
    };

    setPhotos((prev) => [...prev, newPhoto]);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    try {
      const result = await apiUploadPhoto(token, file);
      setPhotos((prev) =>
        prev.map((p) =>
          p.preview === preview
            ? { ...p, mediaId: String(result.id), isUploading: false }
            : p,
        ),
      );
    } catch (err) {
      // Upload failed - remove the photo entry and show error
      setPhotos((prev) => {
        const photo = prev.find((p) => p.preview === preview);
        if (photo?.file) URL.revokeObjectURL(photo.preview);
        return prev.filter((p) => p.preview !== preview);
      });
      setError(
        err instanceof Error
          ? err.message
          : "Photo upload failed. Please try again.",
      );
    }
  };

  const handleRemovePhoto = async (index: number) => {
    const photo = photos[index];

    if (photo.mediaId && token) {
      try {
        await apiRemovePhoto(token, Number(photo.mediaId));
      } catch {
        // If server delete fails, still remove from UI
      }
    }

    setPhotos((prev) => {
      if (prev[index].file) {
        URL.revokeObjectURL(prev[index].preview);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const updatePhoto = (
    index: number,
    field: "title" | "description",
    value: string,
  ) => {
    setPhotos((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)),
    );
  };

  // --- Student Proof Handlers ---
  const handleAddStudentProof = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
    if (!validTypes.includes(file.type)) {
      setError("Only JPEG, PNG, or PDF files are accepted for student proof.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Student proof file exceeds 10MB limit.");
      return;
    }

    setError("");
    setStudentProof({
      file,
      filename: file.name,
      mediaId: null,
      isUploading: true,
    });

    if (studentProofInputRef.current) {
      studentProofInputRef.current.value = "";
    }

    try {
      const result = await apiUploadStudentProof(token, file);
      setStudentProof({
        file,
        filename: result.filename,
        mediaId: String(result.id),
        isUploading: false,
      });
    } catch (err) {
      setStudentProof(null);
      setError(
        err instanceof Error
          ? err.message
          : "Student proof upload failed. Please try again.",
      );
    }
  };

  const handleRemoveStudentProof = async () => {
    if (!studentProof || !token) return;

    if (studentProof.mediaId) {
      try {
        await apiRemoveStudentProof(token);
      } catch {
        // If server delete fails, still remove from UI
      }
    }

    setStudentProof(null);
  };

  // --- Submit ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setIsSubmitting(true);
    setError("");

    try {
      // Save draft one final time to ensure all data is current
      await apiSaveDraft(token, {
        division: divisionId,
        first_name: firstName,
        last_name: lastName,
        dob,
        address,
        school,
        grade,
        job,
        biography,
        photos: photos
          .filter((p) => p.mediaId)
          .map((p) => ({
            media_id: Number(p.mediaId),
            title: p.title,
            description: p.description,
          })),
        exhibition_opt_in: exhibitionOptIn,
        consent_originality: consentOriginality,
        consent_subjects: consentSubjects,
        consent_rights: consentRights,
      });

      // Finalize submission
      await apiSubmitEntry(token);
      setIsSubmitted(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Submission failed. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Validation ---
  const hasRequiredPhotos = photos.length >= 1;
  const photosValid = photos.every(
    (p) =>
      p.title.trim() &&
      p.description.trim() &&
      wordCount(p.description) <= selectedDivision.maxDescriptionWords &&
      !p.isUploading,
  );
  const biographyValid =
    !selectedDivision.biographyRequired || biography.trim().length > 0;
  const allConsentsChecked =
    consentOriginality && consentSubjects && consentRights;
  const personalInfoValid =
    firstName.trim() &&
    lastName.trim() &&
    dob &&
    address.trim() &&
    school.trim() &&
    grade;

  const studentProofValid = !!(studentProof?.mediaId && !studentProof.isUploading);

  const canSubmit =
    personalInfoValid &&
    hasRequiredPhotos &&
    photosValid &&
    biographyValid &&
    studentProofValid &&
    allConsentsChecked &&
    !isSubmitting;

  // --- Payment polling (only when submitted + unpaid) ---
  const paymentStatus = authUser?.payment_status ?? "unpaid";
  const entryFee = selectedDivision.entryFee;
  const stripeUrl = `${competition.stripePaymentLink}?prefilled_email=${encodeURIComponent(user.email)}`;

  useEffect(() => {
    if (!isSubmitted || paymentStatus === "paid") return;

    pollIntervalRef.current = setInterval(() => {
      refreshUser().catch(() => {});
    }, 15_000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [isSubmitted, paymentStatus, refreshUser]);

  const handleCheckPayment = async () => {
    setIsCheckingPayment(true);
    setPaymentPollError("");

    try {
      await refreshUser();
      setTimeout(() => {
        setIsCheckingPayment(false);
        if (authUser?.payment_status !== "paid") {
          setPaymentPollError(
            "Payment not yet detected. If you just paid, please wait a moment and try again.",
          );
        }
      }, 100);
    } catch {
      setIsCheckingPayment(false);
      setPaymentPollError("Could not check payment status. Please try again.");
    }
  };

  // --- Loading State ---
  if (isLoadingDraft) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 w-48" />
          <div className="h-4 bg-gray-200 w-32" />
          <div className="h-32 bg-gray-200 w-full mt-8" />
        </div>
      </div>
    );
  }

  // --- Read-Only Submitted View ---
  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-[#212223]">
                Submission Received
              </h2>
            </div>
            <p className="text-sm text-gray-500">Signed in as {user.email}</p>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="text-sm text-gray-500 hover:text-[#212223] transition-colors"
          >
            Sign out
          </button>
        </div>

        <p className="text-gray-600 mb-8">
          Thank you for your submission to {competition.title}. Your entry is
          final and cannot be edited.
          {paymentStatus === "unpaid" &&
            " Please complete payment below to finalize your entry."}
        </p>

        {/* Payment Section */}
        {paymentStatus === "unpaid" ? (
          <div className="border border-amber-200 bg-amber-50 p-6 mb-8">
            <p className="text-xs font-semibold text-amber-800 uppercase tracking-wide mb-4">
              Payment Required
            </p>
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-700">Entry Fee</span>
              <span className="text-2xl font-bold text-[#212223]">
                ${entryFee}
              </span>
            </div>

            <div className="text-sm text-gray-600 space-y-2 mb-6">
              <p className="flex items-start">
                <span className="text-gray-400 mr-2">&bull;</span>
                Submission for official judging
              </p>
              <p className="flex items-start">
                <span className="text-gray-400 mr-2">&bull;</span>
                Eligibility for prizes up to $
                {competition.awards[0]?.amount.toLocaleString()}
              </p>
              <p className="flex items-start">
                <span className="text-gray-400 mr-2">&bull;</span>
                Exhibition eligibility at partner venues
              </p>
            </div>

            <a
              href={stripeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full px-4 py-2.5 text-sm font-medium text-white bg-[#212223] hover:bg-[#3a3a3a] transition-colors text-center mb-3"
            >
              Pay ${entryFee} with Stripe
            </a>

            <button
              onClick={handleCheckPayment}
              disabled={isCheckingPayment}
              className="w-full px-4 py-2.5 text-sm font-medium border border-gray-300 text-[#212223] hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCheckingPayment
                ? "Checking..."
                : "I've completed payment - check status"}
            </button>

            {paymentPollError && (
              <p className="text-sm text-amber-600 text-center mt-2">
                {paymentPollError}
              </p>
            )}

            <p className="text-xs text-gray-400 text-center mt-3">
              Payment status updates automatically. You can also click above to
              check manually.
            </p>
          </div>
        ) : (
          <div className="border border-green-200 bg-green-50 p-4 mb-8 flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0">
              <svg
                className="w-3.5 h-3.5 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 12.75l6 6 9-13.5"
                />
              </svg>
            </div>
            <p className="text-sm text-green-800 font-medium">
              Payment confirmed — your entry is complete.
            </p>
          </div>
        )}

        {/* Division */}
        <div className="mb-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
            Division
          </p>
          <p className="text-[#212223] font-medium">
            {selectedDivision.name}{" "}
            <span className="text-gray-500 font-normal">
              (Ages {selectedDivision.ageRange})
            </span>
          </p>
        </div>

        {/* Personal Info */}
        <div className="mb-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            Personal Information
          </p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <div>
              <span className="text-gray-500">Name:</span>{" "}
              <span className="text-[#212223]">
                {firstName} {lastName}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Date of Birth:</span>{" "}
              <span className="text-[#212223]">{dob}</span>
            </div>
            <div>
              <span className="text-gray-500">Address:</span>{" "}
              <span className="text-[#212223]">{address}</span>
            </div>
            <div>
              <span className="text-gray-500">School:</span>{" "}
              <span className="text-[#212223]">{school}</span>
            </div>
            <div>
              <span className="text-gray-500">Grade:</span>{" "}
              <span className="text-[#212223]">{grade}</span>
            </div>
            {job && (
              <div>
                <span className="text-gray-500">Job:</span>{" "}
                <span className="text-[#212223]">{job}</span>
              </div>
            )}
          </div>
        </div>

        {/* Student Proof */}
        {studentProof && (
          <div className="mb-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
              Proof of Student Status
            </p>
            <p className="text-sm text-[#212223]">{studentProof.filename}</p>
          </div>
        )}

        {/* Photos */}
        <div className="mb-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            Photos ({photos.length})
          </p>
          <div className="space-y-4">
            {photos.map((photo, i) => (
              <div key={i} className="border border-gray-200 p-4">
                <div className="flex gap-4">
                  <div className="shrink-0 w-24 h-24 bg-gray-100">
                    <img
                      src={photo.preview}
                      alt={photo.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-[#212223]">{photo.title}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {photo.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Biography */}
        {biography && (
          <div className="mb-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
              Biography
            </p>
            <p className="text-sm text-gray-600">{biography}</p>
          </div>
        )}

        {/* Exhibition */}
        {competition.exhibitionOptIn && (
          <div className="mb-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
              Exhibition
            </p>
            <p className="text-sm text-gray-600">
              {exhibitionOptIn ? "Opted in" : "Not opted in"}
            </p>
          </div>
        )}

        {/* Consents */}
        <div className="mb-8">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            Agreements
          </p>
          <div className="space-y-1 text-sm text-gray-600">
            <p>Originality & AI policy: Confirmed</p>
            <p>Subject consent: Confirmed</p>
            <p>Rights & usage: Confirmed</p>
          </div>
        </div>

        <a
          href="/how-to-enter"
          className="text-sm text-gray-500 hover:text-[#212223] transition-colors"
        >
          Back to competition info
        </a>
      </div>
    );
  }

  // --- Editable Form ---
  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-[#212223]">
            Submit Your Entry
          </h2>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-sm text-gray-500">Signed in as {user.email}</p>
            {saveStatus === "saving" && (
              <span className="text-xs text-gray-400">Saving...</span>
            )}
            {saveStatus === "saved" && (
              <span className="text-xs text-green-600">Draft saved</span>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="text-sm text-gray-500 hover:text-[#212223] transition-colors"
        >
          Sign out
        </button>
      </div>

      {/* Division Selection */}
      <fieldset className="mb-8">
        <legend className="text-sm font-semibold text-[#212223] uppercase tracking-wide mb-3">
          Division
        </legend>
        <div className="grid grid-cols-2 gap-3">
          {competition.divisions.map((division) => (
            <label
              key={division.id}
              className={`flex flex-col p-4 border cursor-pointer transition-colors ${
                divisionId === division.id
                  ? "border-[#212223] bg-gray-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                name="division"
                value={division.id}
                checked={divisionId === division.id}
                onChange={() => setDivisionId(division.id)}
                className="sr-only"
              />
              <span className="font-semibold text-[#212223]">
                {division.name}
              </span>
              <span className="text-sm text-gray-500">
                Ages {division.ageRange}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Personal Information */}
      <fieldset className="mb-8">
        <legend className="text-sm font-semibold text-[#212223] uppercase tracking-wide mb-3">
          Personal Information
        </legend>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="firstName"
                className="block text-sm font-medium text-[#212223] mb-1"
              >
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 text-[#212223]"
              />
            </div>
            <div>
              <label
                htmlFor="lastName"
                className="block text-sm font-medium text-[#212223] mb-1"
              >
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 text-[#212223]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="dob"
                className="block text-sm font-medium text-[#212223] mb-1"
              >
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <input
                id="dob"
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 text-[#212223]"
              />
            </div>
            <div>
              <label
                htmlFor="job"
                className="block text-sm font-medium text-[#212223] mb-1"
              >
                Major / Concentration
              </label>
              <input
                id="job"
                type="text"
                value={job}
                onChange={(e) => setJob(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 text-[#212223]"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="address"
              className="block text-sm font-medium text-[#212223] mb-1"
            >
              Address <span className="text-red-500">*</span>
            </label>
            <input
              id="address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 text-[#212223]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="school"
                className="block text-sm font-medium text-[#212223] mb-1"
              >
                School <span className="text-red-500">*</span>
              </label>
              <input
                id="school"
                type="text"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                required
                placeholder="e.g. Lincoln High School"
                className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 text-[#212223] placeholder-gray-400"
              />
            </div>
            <div>
              <label
                htmlFor="grade"
                className="block text-sm font-medium text-[#212223] mb-1"
              >
                Grade <span className="text-red-500">*</span>
              </label>
              <select
                id="grade"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 text-[#212223] bg-white"
              >
                <option value="" disabled>
                  Select grade
                </option>
                <option value="5th Grade">5th Grade</option>
                <option value="6th Grade">6th Grade</option>
                <option value="7th Grade">7th Grade</option>
                <option value="8th Grade">8th Grade</option>
                <option value="9th Grade">9th Grade</option>
                <option value="10th Grade">10th Grade</option>
                <option value="11th Grade">11th Grade</option>
                <option value="12th Grade">12th Grade</option>
                <option value="Undergraduate Student">Undergraduate Student</option>
                <option value="Graduate Student">Graduate Student</option>
              </select>
            </div>
          </div>
        </div>
      </fieldset>

      {/* Student Proof Upload */}
      <fieldset className="mb-8">
        <legend className="text-sm font-semibold text-[#212223] uppercase tracking-wide mb-3">
          Proof of Student Status <span className="text-red-500">*</span>
        </legend>
        <p className="text-sm text-gray-500 mb-3">
          Upload a photo or PDF of your transcript or student ID.
        </p>

        {studentProof ? (
          <div className="border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="shrink-0 w-10 h-10 bg-gray-100 flex items-center justify-center relative">
                {studentProof.isUploading && (
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                  />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#212223] truncate">
                  {studentProof.filename}
                </p>
                {studentProof.isUploading && (
                  <p className="text-xs text-gray-400">Uploading...</p>
                )}
              </div>
              <button
                type="button"
                onClick={handleRemoveStudentProof}
                className="text-xs text-red-500 hover:text-red-700 transition-colors shrink-0"
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <label className="flex items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors cursor-pointer">
            <div className="text-center">
              <svg
                className="w-6 h-6 text-gray-400 mx-auto mb-1"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
              <span className="text-sm text-gray-500">
                Upload file (JPEG, PNG, or PDF, max 10MB)
              </span>
            </div>
            <input
              ref={studentProofInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handleAddStudentProof}
              className="sr-only"
            />
          </label>
        )}
      </fieldset>

      {/* Photo Uploads */}
      <fieldset className="mb-8">
        <legend className="text-sm font-semibold text-[#212223] uppercase tracking-wide mb-3">
          Photos ({photos.length}/{selectedDivision.maxPhotos})
        </legend>

        {photos.map((photo, index) => (
          <div key={index} className="border border-gray-200 p-4 mb-4">
            <div className="flex gap-4">
              <div className="shrink-0 w-24 h-24 bg-gray-100 relative">
                {photo.isUploading && (
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                <img
                  src={photo.preview}
                  alt={photo.title || `Photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 space-y-3">
                <div className="flex items-start justify-between">
                  <span className="text-sm font-medium text-gray-500">
                    Photo {index + 1}
                    {photo.isUploading && (
                      <span className="text-xs text-gray-400 ml-2">
                        Uploading...
                      </span>
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(index)}
                    className="text-xs text-red-500 hover:text-red-700 transition-colors"
                  >
                    Remove
                  </button>
                </div>
                <input
                  type="text"
                  value={photo.title}
                  onChange={(e) => updatePhoto(index, "title", e.target.value)}
                  placeholder="Photo title"
                  required
                  className="w-full px-3 py-1.5 border border-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 text-[#212223] placeholder-gray-400"
                />
                <div>
                  <textarea
                    value={photo.description}
                    onChange={(e) =>
                      updatePhoto(index, "description", e.target.value)
                    }
                    placeholder="Describe your photo..."
                    required
                    rows={3}
                    className="w-full px-3 py-1.5 border border-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 text-[#212223] placeholder-gray-400 resize-none"
                  />
                  <p
                    className={`text-xs mt-1 ${
                      wordCount(photo.description) >
                      selectedDivision.maxDescriptionWords
                        ? "text-red-500"
                        : "text-gray-400"
                    }`}
                  >
                    {wordCount(photo.description)}/
                    {selectedDivision.maxDescriptionWords} words
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}

        {photos.length < selectedDivision.maxPhotos && (
          <label className="flex items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors cursor-pointer">
            <div className="text-center">
              <svg
                className="w-6 h-6 text-gray-400 mx-auto mb-1"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
              <span className="text-sm text-gray-500">
                Add photo (JPEG/JPG, max {competition.maxFileSizeMB}MB)
              </span>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg"
              onChange={handleAddPhoto}
              className="sr-only"
            />
          </label>
        )}
      </fieldset>

      {/* Biography */}
      <fieldset className="mb-8">
        <legend className="text-sm font-semibold text-[#212223] uppercase tracking-wide mb-3">
          Biography{" "}
          {selectedDivision.biographyRequired ? (
            <span className="text-red-500">*</span>
          ) : (
            <span className="text-gray-400 font-normal normal-case">
              (optional)
            </span>
          )}
        </legend>
        <textarea
          value={biography}
          onChange={(e) => setBiography(e.target.value)}
          placeholder="Tell us about yourself..."
          required={selectedDivision.biographyRequired}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 text-[#212223] placeholder-gray-400 resize-none"
        />
      </fieldset>

      {/* Exhibition Opt-In */}
      {competition.exhibitionOptIn && (
        <fieldset className="mb-8">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={exhibitionOptIn}
              onChange={(e) => setExhibitionOptIn(e.target.checked)}
              className="mt-0.5 w-4 h-4 border-gray-300 text-[#212223] focus:ring-gray-400"
            />
            <span className="text-sm text-gray-600">
              {competition.exhibitionNote}
            </span>
          </label>
        </fieldset>
      )}

      {/* Consent Checkboxes */}
      <fieldset className="mb-8">
        <legend className="text-sm font-semibold text-[#212223] uppercase tracking-wide mb-3">
          Consent & Agreements
        </legend>
        <div className="space-y-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={consentOriginality}
              onChange={(e) => setConsentOriginality(e.target.checked)}
              required
              className="mt-0.5 w-4 h-4 shrink-0 border-gray-300 text-[#212223] focus:ring-gray-400"
            />
            <span className="text-sm text-gray-600">
              {competition.originalityStatement}
            </span>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={consentSubjects}
              onChange={(e) => setConsentSubjects(e.target.checked)}
              required
              className="mt-0.5 w-4 h-4 shrink-0 border-gray-300 text-[#212223] focus:ring-gray-400"
            />
            <span className="text-sm text-gray-600">
              {competition.consentStatement}
            </span>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={consentRights}
              onChange={(e) => setConsentRights(e.target.checked)}
              required
              className="mt-0.5 w-4 h-4 shrink-0 border-gray-300 text-[#212223] focus:ring-gray-400"
            />
            <span className="text-sm text-gray-600">
              {competition.rightsStatement}
            </span>
          </label>
        </div>
      </fieldset>

      {/* Error */}
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {/* Submit */}
      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full px-4 py-3 text-sm font-medium text-white bg-[#212223] hover:bg-[#3a3a3a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Submitting..." : "Submit Entry"}
      </button>

      <p className="text-xs text-gray-400 text-center mt-3">
        Once submitted, your entry is final and cannot be edited. You will be
        prompted to complete the ${entryFee} entry fee after submission.
      </p>
    </form>
  );
}
