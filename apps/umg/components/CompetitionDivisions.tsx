import { currentCompetition } from "@/lib/competitions/current";
import { DivisionCard } from "./DivisionCard";

const competition = currentCompetition;

export function CompetitionDivisions() {
  return (
    <section className="bg-gray-50 border-y border-gray-200">
      <div className="max-w-280 mx-auto px-6 py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-[#212223] mb-10">
          Divisions
        </h2>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {competition.divisions.map((division) => (
            <DivisionCard key={division.id} divisionId={division.id} />
          ))}
        </div>
      </div>
    </section>
  );
}
