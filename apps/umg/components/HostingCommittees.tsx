import Image from "next/image";

const committees = [
  {
    src: "/umg-logo.svg",
    alt: "United Media Group",
    label: "United Media\nGroup",
  },
  {
    src: "/images/sponsors/unesco-center-for-peace.jpg",
    alt: "UNESCO Center for Peace",
    label: "UNESCO Center\nFor Peace",
  },
  {
    src: "/images/sponsors/chennault-foundation.png",
    alt: "Chennault Foundation",
    label: "Chennault\nFoundation",
  },
  {
    src: "/images/sponsors/international-salute.png",
    alt: "MLK, Jr. International Salute Committee",
    label: "MLK, Jr. International\nSalute Committee",
  },
];

export function HostingCommittees() {
  return (
    <section className="max-w-280 mx-auto px-6 py-12 md:py-16">
      <h2 className="text-2xl md:text-3xl font-bold text-center text-[#212223] mb-10">
        Hosting Committees
      </h2>
      <div className="grid grid-cols-2 place-items-center gap-10 md:gap-16 max-w-2xl mx-auto">
        {committees.map((committee) => (
          <div key={committee.alt} className="flex flex-col items-center text-center w-36 md:w-44">
            <Image
              src={committee.src}
              alt={committee.alt}
              width={180}
              height={80}
              className="object-contain h-16 md:h-20 w-auto"
            />
            <p className="text-sm md:text-base font-semibold text-[#212223] mt-3 whitespace-pre-line">
              {committee.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
