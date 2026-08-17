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

export interface Project {
  name: string;
  /** corporate = client work, personal = shipped and maintained by me, academy = coursework */
  type: 'corporate' | 'personal' | 'academy';
  year: string;
  org?: string;
  description: string;
  tech: string[];
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
