import Image from "next/image";
import { judges } from "@/lib/competitions/judges";

export default function JudgesPanelPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Banner */}
      <section className="w-full bg-linear-to-r from-[#7EC8E3] via-[#A8D5E8] to-[#C5B8D9] px-6 py-16 md:py-24">
        <div className="max-w-280 mx-auto flex justify-center">
          <h1 className="font-(family-name:--font-libre-franklin) font-semibold uppercase leading-[0.95] inline-grid">
            <span className="block text-4xl md:text-7xl lg:text-8xl text-[#1565A0]">
              My Hometown
            </span>
            <span className="flex items-end justify-between mt-1">
              <span className="text-4xl md:text-7xl lg:text-8xl text-white">
                My Lens
              </span>
              <span className="text-[8px] md:text-base lg:text-2xl normal-case font-normal leading-tight text-right mb-2">
                <span className="text-[#1565A0]">International Youth</span>
                <br />
                <span className="text-white">Photography Competition</span>
              </span>
            </span>
          </h1>
        </div>
      </section>

      {/* Judges Bios */}
      <section className="max-w-280 mx-auto px-6 py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-[#212223] mb-10">
          Meet the Judges
        </h2>
        <div className="flex flex-wrap justify-center gap-8 max-w-6xl mx-auto">
          {judges.map((judge) => (
            <div
              key={judge.name}
              className="w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.34rem)] rounded-xl shadow-md border border-gray-100 p-6 md:p-8 text-center"
            >
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden bg-gray-100 border border-gray-200 mx-auto relative">
                <Image
                  src={judge.image}
                  alt={judge.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 96px, 112px"
                />
              </div>
              <h3 className="text-lg font-bold text-[#212223] mt-4">
                {judge.name}
              </h3>
              <p className="text-sm font-medium text-[#1565A0] mt-1">
                {judge.title}
              </p>
              <p className="text-sm text-gray-600 leading-relaxed mt-4">
                {judge.bio}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
