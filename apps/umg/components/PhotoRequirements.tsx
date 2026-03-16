import { currentCompetition } from "@/lib/competitions/current";

const competition = currentCompetition;

export function PhotoRequirements() {
  return (
    <section className="max-w-280 mx-auto px-6 py-12 md:py-16">
      <h2 className="text-2xl md:text-3xl font-bold text-center text-[#212223] mb-10">
        Photo Requirements
      </h2>
      <div className="max-w-2xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="text-center p-4">
            <p className="text-sm text-gray-500 uppercase tracking-wide mb-1">
              Format
            </p>
            <p className="text-lg font-semibold text-[#212223]">
              {competition.acceptedFormats.join(" / ")}
            </p>
          </div>
          <div className="text-center p-4">
            <p className="text-sm text-gray-500 uppercase tracking-wide mb-1">
              Color Mode
            </p>
            <p className="text-lg font-semibold text-[#212223]">
              {competition.colorMode}
            </p>
          </div>
          <div className="text-center p-4">
            <p className="text-sm text-gray-500 uppercase tracking-wide mb-1">
              Min Resolution
            </p>
            <p className="text-lg font-semibold text-[#212223]">
              {competition.minResolutionPx.toLocaleString()}px
            </p>
            <p className="text-xs text-gray-400">longest side</p>
          </div>
          <div className="text-center p-4">
            <p className="text-sm text-gray-500 uppercase tracking-wide mb-1">
              Max File Size
            </p>
            <p className="text-lg font-semibold text-[#212223]">
              {competition.maxFileSizeMB} MB
            </p>
            <p className="text-xs text-gray-400">per image</p>
          </div>
        </div>
        <p className="text-center text-gray-500 mt-6 text-sm">
          Allowed devices:{" "}
          {competition.allowedDevices
            .map((d) => d.charAt(0).toUpperCase() + d.slice(1))
            .join(", ")}
        </p>
      </div>
    </section>
  );
}
