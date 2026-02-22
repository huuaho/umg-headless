"use client";

import { useState, useRef } from "react";
import { currentCompetition } from "@/lib/competitions/current";
import type { CompetitionDivision } from "@/lib/competitions/types";

interface PhotoEntry {
  file: File;
  preview: string;
  title: string;
  description: string;
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [divisionId, setDivisionId] = useState(competition.divisions[0].id);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [address, setAddress] = useState("");
  const [schoolGrade, setSchoolGrade] = useState("");
  const [job, setJob] = useState("");
  const [biography, setBiography] = useState("");
  const [photos, setPhotos] = useState<PhotoEntry[]>([]);
  const [exhibitionOptIn, setExhibitionOptIn] = useState(false);
  const [consentOriginality, setConsentOriginality] = useState(false);
  const [consentSubjects, setConsentSubjects] = useState(false);
  const [consentRights, setConsentRights] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState("");

  const selectedDivision = competition.divisions.find(
    (d) => d.id === divisionId,
  ) as CompetitionDivision;

  const handleAddPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
    setPhotos((prev) => [...prev, { file, preview, title: "", description: "" }]);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => {
      URL.revokeObjectURL(prev[index].preview);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    // TODO: Replace with real API call in Phase 4
    // POST /umg/v1/submit with FormData
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsSubmitting(false);
    setSubmitSuccess(true);
  };

  // Validate form completeness
  const hasRequiredPhotos = photos.length >= 1;
  const photosValid = photos.every(
    (p) =>
      p.title.trim() &&
      p.description.trim() &&
      wordCount(p.description) <= selectedDivision.maxDescriptionWords,
  );
  const biographyValid =
    !selectedDivision.biographyRequired || biography.trim().length > 0;
  const allConsentsChecked =
    consentOriginality && consentSubjects && consentRights;
  const personalInfoValid =
    firstName.trim() && lastName.trim() && dob && address.trim() && schoolGrade.trim();

  const canSubmit =
    personalInfoValid &&
    hasRequiredPhotos &&
    photosValid &&
    biographyValid &&
    allConsentsChecked &&
    !isSubmitting;

  if (submitSuccess) {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 12.75l6 6 9-13.5"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-[#212223] mb-2">
          Submission Received
        </h2>
        <p className="text-gray-600 mb-6">
          Thank you for your submission to {competition.title}. You will receive
          a confirmation email at {user.email}.
        </p>
        <a
          href="/how-to-enter"
          className="text-sm text-gray-500 hover:text-[#212223] transition-colors"
        >
          Back to competition info
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-[#212223]">
            Submit Your Entry
          </h2>
          <p className="text-sm text-gray-500">
            Signed in as {user.email}
          </p>
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
                Job / Occupation
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

          <div>
            <label
              htmlFor="schoolGrade"
              className="block text-sm font-medium text-[#212223] mb-1"
            >
              School & Grade <span className="text-red-500">*</span>
            </label>
            <input
              id="schoolGrade"
              type="text"
              value={schoolGrade}
              onChange={(e) => setSchoolGrade(e.target.value)}
              required
              placeholder="e.g. Lincoln High School, 11th Grade"
              className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 text-[#212223] placeholder-gray-400"
            />
          </div>
        </div>
      </fieldset>

      {/* Photo Uploads */}
      <fieldset className="mb-8">
        <legend className="text-sm font-semibold text-[#212223] uppercase tracking-wide mb-3">
          Photos ({photos.length}/{selectedDivision.maxPhotos})
        </legend>

        {photos.map((photo, index) => (
          <div
            key={index}
            className="border border-gray-200 p-4 mb-4"
          >
            <div className="flex gap-4">
              <div className="shrink-0 w-24 h-24 bg-gray-100 relative">
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
            <span className="text-gray-400 font-normal normal-case">(optional)</span>
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
      {error && (
        <p className="text-sm text-red-600 mb-4">{error}</p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full px-4 py-3 text-sm font-medium text-white bg-[#212223] hover:bg-[#3a3a3a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Submitting..." : "Submit Entry"}
      </button>

      <p className="text-xs text-gray-400 text-center mt-3">
        Once submitted, your entry is final and the ${selectedDivision.entryFee}{" "}
        fee is non-refundable.
      </p>
    </form>
  );
}
