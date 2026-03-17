import { ReactNode } from "react";

export type Judge = {
  id: string;
  name: string;
  title: string;
  bio: ReactNode;
  image: string;
};

export const judges: Judge[] = [
  {
    id: "denis-antoine",
    name: "Denis Antoine",
    title: "Former Ambassador of Grenada to the U.S. & United Nations",
    bio: (
      <>
        Dr. Denis G. Antoine is a distinguished diplomat and former Ambassador of
        Grenada to China, the United Nations, and the United States, where he
        also served as Vice President of the 69th United Nations General
        Assembly. With decades of experience in international relations,
        education, and public service, he has held leadership roles at the
        University of the District of Columbia and numerous nonprofit
        organizations. He is the author of{" "}
        <em>Effective Diplomacy {"\u2013"} A Practitioner{"\u2019"}s Guide</em>{" "}
        and <em>Voice of Representation</em>, and his work has been recognized
        with the Martin Luther King Jr. Legacy Award for his contributions to
        diplomacy and global engagement.
      </>
    ),
    image: "/images/judges/antoine-denis.png",
  },
  {
    id: "amy-austin",
    name: "Amy Austin",
    title: "President & CEO, Theatre Washington",
    bio: (
      <>
        Amy Austin is the president and CEO of Theatre Washington. She is the
        Publisher Emeritus of <em>Washington City Paper</em>, an influential,
        award-winning local alternative news outlet known for long-form local
        journalism and in-depth arts coverage. She is a member of the Leadership
        Greater Washington, former board chair of The Theatre Lab, serves on the
        board of Destination DC, and received the John Conyers Jr. Advocacy Award
        from the DC Jazz Festival. She is committed to theatre arts and education
        as essential to the human experience, fostering shared empathy,
        understanding, and joy.
      </>
    ),
    image: "/images/judges/austin-amy.png",
  },
  {
    id: "raymone-bain",
    name: "Raymone Bain",
    title: "PR & Crisis Management Expert",
    bio: 'Raymone K. Bain is a renowned public relations and crisis management expert who has represented some of the world\u2019s most influential figures in entertainment and sports, including Michael Jackson, Janet Jackson, Kenny "Babyface" Edmonds, BoyzIIMen, Steve Harvey, Serena Williams, Muhammad Ali, Deion Sanders, and Mike Tyson. With extensive experience across media, corporate, and public affairs sectors, she has also served as Spokesperson for the late Washington, D.C. Mayor Marion S. Barry, Jr. Her contributions to media and communications have earned her numerous honors, including recognition as the 2024 Women\u2019s HERstory Month DC Star Public Relations Expert.',
    image: "/images/judges/bain-raymone.png",
  },
  {
    id: "taryn-carroll",
    name: "Taryn Carroll",
    title: "Senate Media Photographer, Maryland Senate",
    bio: "Taryn Carroll is a photographer and media professional currently serving as a Senate Media Photographer with the Maryland Senate. Her work focuses on visual storytelling within public service and government settings. She holds a Bachelor of Arts in Communication from Clemson University, where she graduated cum laude and was a scholarship student-athlete and captain of the NCAA Division I women\u2019s rowing team. Her interdisciplinary background reflects a strong commitment to both visual communication and public impact.",
    image: "/images/judges/carroll-taryn.png",
  },
  {
    id: "nell-chennault",
    name: "Nell Chennault",
    title: "President & CEO, Chennault Aviation & Military Museum",
    bio: "Nell Chennault Calloway is President and CEO of the Chennault Aviation and Military Museum, where she has led the institution since 2016 following her earlier role as Museum Director. As the granddaughter of General Claire Chennault, founder of the Flying Tigers, she is deeply committed to preserving and advancing his legacy through museum leadership, public education, and international outreach. A dedicated advocate for World War II veterans and their families, she works closely with veteran organizations and cultural institutions across the United States and Asia to promote historical understanding and strengthen cross-cultural connections.",
    image: "/images/judges/chennault-nell.png",
  },
  {
    id: "guy-djoken",
    name: "Guy Djoken",
    title: "Executive Director of the UNESCO Center for Peace",
    bio: "Guy Djoken is the Chairman of the U.S. National Commission for UNESCO Clubs, Centers and Associations and Executive Director of the UNESCO Center for Peace in Washington, D.C. A social entrepreneur and civil rights advocate, he is internationally recognized for his leadership in promoting human rights, cultural understanding, and global dialogue. His work has earned numerous honors, including the Gandhi Peace Award, the Nikola Tesla Global Forum White Dove Award, the Citibank Community Partner Award, and the Justice Thurgood Marshall Award.",
    image: "/images/judges/djoken-guy.png",
  },
  {
    id: "jan-du-plain",
    name: "Jan Du Plain",
    title: "CEO & President, Du Plain Global Enterprises",
    bio: "Jan Du Plain is CEO and President of Du Plain Global Enterprises, Inc., a global public relations and special events firm representing media, cultural, and diplomatic organizations. With decades of experience in public relations, broadcasting, and international cultural programming, she has held leadership roles with CBS Cinema Center Films, Ford\u2019s Theatre, and WETA TV and Radio. She has played a key role in major international initiatives in Washington, D.C., including Passport DC and Winternational, and is widely recognized for her contributions to cultural diplomacy and global engagement. Her honors include the National Press Club\u2019s Bernie Krug Award and the Alice Paul Award for leadership and public service.",
    image: "/images/judges/du-plain-jan.png",
  },
  {
    id: "stan-herd",
    name: "Stan Herd",
    title: "Crop Artist & Painter",
    bio: "Stan Herd is an American crop artist and painter who creates images, or earthworks, on large areas of land, especially in Kansas. His work is sometimes referred to as living sculpture. He plots his designs and then executes them by planting, mowing, and sometimes burning or plowing the land. He is associated with the Prairie Renaissance Movement. Two of Herd's first Kansas installations were the 160-acre (0.65 km\u00B2) portraits of Kiowa War Chief Satanta (1981) and Will Rogers (1983). These artworks are featured in Herd's 1994 book on crop art. Herd's website includes photos of his work and a list of media coverage of his projects, including an article in Smithsonian magazine and an article in National Geographic's World magazine (1988).",
    image: "/images/judges/herd-stan.png",
  },
  {
    id: "lisa-ishii",
    name: "Lisa Ishii",
    title: "SVP Operations, Johns Hopkins Health System",
    bio: "Dr. Lisa Ishii is Senior Vice President of Operations at Johns Hopkins Health System and Professor of Otolaryngology\u2013Head and Neck Surgery. A specialist in facial plastic and reconstructive surgery, she has clinical expertise in rhinoplasty, facial rejuvenation, reconstructive procedures, and minimally invasive facial augmentation. She is the first facial plastic surgeon to receive a prestigious National Institutes of Health K12 Award for research in the field and holds a Master of Health Sciences from the Johns Hopkins Bloomberg School of Public Health. Her work integrates clinical excellence with research-driven innovation to advance best practices in facial plastic surgery.",
    image: "/images/judges/ishii-lisa.png",
  },
  {
    id: "madeline-lawson",
    name: "Madeline Lawson",
    title: "Founder & CEO, Institute for Multicultural Minority Medicine",
    bio: "Madeline Y. Lawson is the founder and CEO of the Institute for the Advancement of Multicultural Minority Medicine and Founder and Chair of the International Salute to Dr. Martin Luther King, Jr., an annual program dedicated to honoring Dr. King\u2019s legacy. A recognized leader in advancing equity and reducing health disparities, she has held senior leadership roles with organizations including St. Jude Children\u2019s Research Hospital, the National Medical Association, Howard University, the U.S. Department of Health and Human Services, and the U.S. Food and Drug Administration. Her work focuses on education, advocacy, and strengthening multicultural and underserved communities.",
    image: "/images/judges/lawson-madeline.png",
  },
  {
    id: "terry-lierman",
    name: "Terry Lierman",
    title: "Former Chief of Staff to House Majority Leader & Senate Appropriations Staff Director",
    bio: "Terry Lierman is a founding partner of Summit Global Ventures, LLC, and a senior advisor with more than 35 years of experience in communications, public affairs, and government relations. He previously served as Chief of Staff to U.S. House Majority Leader Steny Hoyer and as Staff Director of the U.S. Senate Appropriations Committee. Throughout his career, he has advised businesses, universities, and public institutions and has held leadership roles on numerous nonprofit and healthcare boards, contributing to national initiatives in public policy, health, and research.",
    image: "/images/judges/lierman-terry.png",
  },
  {
    id: "renee-mcphatter",
    name: "Renee McPhatter",
    title: "AVP Government & Community Relations, George Washington University",
    bio: "Renee McPhatter is the Associate Vice President for Government and Community Relations at George Washington University, where she leads strategic engagement with federal, state, and local government, as well as community and business partnerships. With a background in law and public policy, she has held leadership roles in the District of Columbia government, including serving as General Counsel for the Department of Employment Services and as Deputy Director of Policy and Legislative Affairs in the Mayor\u2019s office. Her work focuses on public affairs, policy development, and strengthening connections between institutions and the communities they serve.",
    image: "/images/judges/mcphatter-renee.png",
  },
  {
    id: "philip-qiu",
    name: "Philip Qiu",
    title: "Founder & Chairman, Chinese American Museum DC",
    bio: "Dr. Philip Qiu is the founder and chairman of the Chinese American Museum in Washington, D.C., and chairman of the Hong Kong Wah Hing Charitable Foundation. A cultural leader and philanthropist, he has dedicated his work to promoting cross-cultural dialogue, supporting underserved communities, and advancing arts and education. He also established the Philip Qiu & Family Foundation in the United States to support children with autism and ADHD through programs in cultural exchange, arts, and music. Through his leadership, philanthropy, and support of exhibitions, scholarships, and public programs, Dr. Qiu has made significant contributions to fostering cultural understanding and community development internationally.",
    image: "/images/judges/qiu-philip.png",
  },
  {
    id: "derrick-rutledge",
    name: "Derrick Rutledge",
    title: "Celebrity Stylist & Makeup Artist",
    bio: (
      <>
        Derrick Edwin Rutledge is a renowned celebrity stylist, makeup artist,
        singer, and entrepreneur based in Washington, D.C. Best known as the
        longtime makeup artist to Oprah Winfrey and former First Lady Michelle
        Obama, he has worked with leading figures in entertainment, including
        Beyonc{"\u00e9"}, Patti LaBelle, and Chaka Khan. His work has been
        featured on the covers of major publications such as <em>Essence</em>,{" "}
        <em>AARP</em>, and <em>O, The Oprah Magazine</em>, establishing him as a
        respected voice in beauty, media, and visual presentation.
      </>
    ),
    image: "/images/judges/rutledge-derrick.png",
  },
  {
    id: "annie-whatley",
    name: "Annie Whatley",
    title: "AVP External Relations, University of the District of Columbia",
    bio: "Ann Whatley is Assistant Vice President of External Relations at the University of the District of Columbia, where she leads initiatives focused on strategic partnerships, public engagement, and institutional outreach. Through her work in the Office of External Relations, she plays a key role in strengthening connections between the university, government agencies, and the broader community. Her expertise centers on relationship building, communications, and advancing collaborative programs that support education and community impact.",
    image: "/images/judges/whatley-annie.png",
  },
];
