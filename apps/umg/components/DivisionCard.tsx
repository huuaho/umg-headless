import { currentCompetition } from "@/lib/competitions/current";

const competition = currentCompetition;

export function DivisionCard({ divisionId }: { divisionId: string }) {
  const division = competition.divisions.find((d) => d.id === divisionId);
  if (!division) return null;

  return (
    <div className="bg-white border border-gray-200 p-6 md:p-8">
      <h3 className="text-xl font-bold text-[#212223] mb-1">
        {division.name}
      </h3>
      <p className="text-gray-500 mb-4">Ages {division.ageRange}</p>

      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Entry Fee</span>
          <span className="font-semibold text-[#212223]">
            ${division.entryFee}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Max Photos</span>
          <span className="font-semibold text-[#212223]">
            {division.maxPhotos}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Description Limit</span>
          <span className="font-semibold text-[#212223]">
            {division.maxDescriptionWords} words
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Biography</span>
          <span className="font-semibold text-[#212223]">
            {division.biographyRequired ? "Required" : "Optional"}
          </span>
        </div>
      </div>

      <h4 className="text-sm font-semibold text-[#212223] uppercase tracking-wide mb-3">
        Requirements
      </h4>
      <ul className="space-y-2 text-sm text-gray-600">
        {division.requirements.map((req, i) => (
          <li key={i} className="flex items-start">
            <span className="text-gray-400 mr-2 mt-0.5">&bull;</span>
            <span>{req}</span>
          </li>
        ))}
      </ul>

      {competition.divisionJudgingNotes[division.id] && (
        <>
          <h4 className="text-sm font-semibold text-[#212223] uppercase tracking-wide mb-2 mt-6">
            Division-Specific Notes
          </h4>
          <p className="text-sm text-gray-600">
            {competition.divisionJudgingNotes[division.id]}
          </p>
        </>
      )}
    </div>
  );
}
