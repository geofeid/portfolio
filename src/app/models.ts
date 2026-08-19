// Shape of /OnlineCV/content.json — owned by the Online_CV repo.

export interface Stat {
  value: string;
  label: string;
}

export interface Skill {
  name: string;
  percent: string;
  category: 'frontend' | 'backend' | 'devops' | 'other';
}

export interface TimelineSection {
  title: string;
  items: string[];
}

export interface TimelineEntry {
  type: 'job' | 'cert' | 'internship' | 'education';
  /** Sortable start date, "YYYY-MM". Set in content so nothing parses `date` at runtime. */
  start: string;
  date: string;
  title: string;
  org: string;
  /** Always visible, kept to a similar length across entries so cards stay even. */
  summary: string;
  /** Revealed by "See more"; empty when the summary says it all. */
  sections: TimelineSection[];
  link?: { label: string; url: string };
}

export interface CaseStudy {
  /** Quick facts a recruiter scans before reading anything else. */
  facts?: { team: string; status: string };
  headline: string;
  context: string;
  goal: string;
  role: string;
  approach: string[];
  /** What made the work hard — the part interviewers actually ask about. */
  challenges?: string[];
  /** What the client actually received. Set on advisory work, where the
   *  deliverable is the document rather than the running feature. */
  deliverables?: string[];
  results: string[];
}

export interface Project {
  name: string;
  /** URL segment for the detail page; absent means the card has no case study yet. */
  slug?: string;
  caseStudy?: CaseStudy;
  /** corporate = employed client work, freelance = my own clients,
   *  personal = my own products, academy = coursework */
  type: 'corporate' | 'freelance' | 'personal' | 'academy';
  /** Set when a project is not launched yet; suppresses the live link. */
  inDevelopment?: boolean;
  year: string;
  org?: string;
  description: string;
  tech: string[];
  /** Heading for the stack list. Defaults to "Built with"; set it when the
   *  stack is someone else's code that I reviewed rather than wrote. */
  techLabel?: string;
  highlights: string[];
  image?: string | null;
  github: string | null;
  live: string | null;
}

export interface Blog {
  title: string;
  image: string;
  link: string;
  description: string;
}

export interface ContactItem {
  icon: string;
  label: string;
  value: string;
  href: string | null;
}

export interface VCard {
  name: string;
  phone: string;
  email: string;
  org: string;
  title: string;
  bday: string;
  url: string;
  linkedin?: string;
}

export interface PortfolioContent {
  home: { greeting: string; name: string; title: string; intro: string };
  about: { heading: string; infoTitle: string; paragraphs: string[]; stats: Stat[] };
  skills: Skill[];
  timeline: TimelineEntry[];
  projects: Project[];
  blogs: Blog[];
  contact: {
    heading: string;
    intro?: string;
    items: ContactItem[];
    socials: { icon: string; href: string }[];
    formAction: string;
    formRedirect: string;
    vcard: VCard;
    qrImage?: string;
  };
}

export interface SiteContent {
  cv: Record<string, string>;
  portfolio: PortfolioContent;
}
