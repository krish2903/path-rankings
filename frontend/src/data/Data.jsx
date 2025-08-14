import {
  Briefcase,
  CircleDollarSign,
  MapPinHouse,
  Globe2,
  Zap,
  Factory,
  HeartPulse,
  Banknote,
  Cpu,
  Megaphone,
  Store,
  BookOpenText,
  Computer,
  Atom,
  LibraryBig,
  BriefcaseBusiness,
  Users,
  BookOpen,
  BriefcaseMedical,
  BookOpenCheck,
  School
} from "lucide-react";

// API BASE
export const API_BASE = "https://path-rankings-backend.onrender.com";

// Industries
export const INDUSTRIES = [
  "Energy & Utilities",
  "Materials & Manufacturing",
  "Healthcare & Life Sciences",
  "Banking, Finance & Real-Estate",
  "Information Technology (IT)",
  "Communication Services & Public Relations (PR)",
  "Consumer Goods & Retail",
  "Public Sector, Education & Research"
];

// Disciplines
export const DISCIPLINES = [
  "Engineering & Technology",
  "Life Sciences & Medicine",
  "Natural Sciences",
  "Arts & Humanities",
  "Business, Economics & Management",
  "Social Sciences & Law",
  "Teaching & Education"
];

export const iconMap = {
  // Metric group icons
  "Career Advancement Prospects": Briefcase,
  "Financial Considerations": CircleDollarSign,
  "Quality of Life & Long-term Settlement": MapPinHouse,
  "Government & Policy Environment": Globe2,
  "Academic Excellence & Research": BookOpenCheck,
  "Student Experiences & Campus Life": School,

  // Industry-specific icons
  "Energy & Utilities": Zap,
  "Materials & Manufacturing": Factory,
  "Healthcare & Life Sciences": HeartPulse,
  "Banking, Finance & Real-Estate": Banknote,
  "Information Technology (IT)": Cpu,
  "Communication Services & Public Relations (PR)": Megaphone,
  "Consumer Goods & Retail": Store,
  "Public Sector, Education & Research": BookOpenText,

  // Discipline-specific icons
  "Engineering & Technology": Computer,
  "Life Sciences & Medicine": BriefcaseMedical,
  "Natural Sciences": Atom,
  "Arts & Humanities": LibraryBig,
  "Business, Economics & Management": BriefcaseBusiness,
  "Social Sciences & Law": Users,
  "Teaching & Education": BookOpen,
};
