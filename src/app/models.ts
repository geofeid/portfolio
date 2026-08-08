// Shape of /OnlineCV/content.json — owned by the Online_CV repo.

export interface Stat {
  value: string;
  label: string;
}

export interface Skill {
  name: string;
  percent: string;
}

export interface TimelineEntry {
  type: 'job' | 'cert' | 'internship' | 'education';
  date: string;
  title: string;
  org: string;
  body: string;
}

export interface Project {
  name: string;
  image: string;
  description: string | null;
  github: string | null;
  live: string | null;
  youtube: string | null;
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
