// Resume data types matching the backend models

export interface Contact {
  email: string;
  phone: string;
  linkedin?: string;
  location?: string;
  github?: string;
  website?: string;
}

export interface Education {
  school: string;
  degree: string;
  graduation_date: string;
  gpa?: string;
  location?: string;
  coursework?: string[];
}

export interface Experience {
  title: string;
  company: string;
  location: string;
  start_date: string;
  end_date: string;
  bullets: string[];
}

export interface Project {
  name: string;
  role?: string;
  bullets: string[];
  technologies?: string[];
  link?: string;
}

export interface AdditionalInfo {
  certifications?: string[];
  languages?: string[];
  work_eligibility?: string;
  computer_skills?: string;
  technical_skills?: string;
  other?: string;
}

export interface Resume {
  name: string;
  contact: Contact;
  headline?: string;
  summary?: string;
  skills: string[];
  education: Education[];
  experience: Experience[];
  projects: Project[];
  additional_info: AdditionalInfo;
}

export interface TailorResponse {
  resume: Resume;
  matchScore?: number;
  skillsMatched?: number;
  totalSkills?: number;
  keywordsAdded?: number;
}

