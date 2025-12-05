from pydantic import BaseModel
from typing import List, Optional


class Contact(BaseModel):
    email: Optional[str] = None
    phone: Optional[str] = None
    linkedin: Optional[str] = None
    location: Optional[str] = None


class EducationEntry(BaseModel):
    school: str
    degree: str
    major: Optional[str] = None            # e.g. "Computer Science"
    graduation_date: Optional[str] = None  # e.g. "May 2026"
    gpa: Optional[str] = None              # e.g. "3.8/4.0"
    location: Optional[str] = None


class Experience(BaseModel):
    title: str
    company: str
    location: Optional[str] = None
    start_date: Optional[str] = None       # e.g. "Jun 2024"
    end_date: Optional[str] = None         # e.g. "Present"
    bullets: List[str]


class Project(BaseModel):
    name: str
    role: Optional[str] = None
    semester: Optional[str] = None  # e.g. "Fall 2025"
    bullets: List[str]


class VolunteerWork(BaseModel):
    organization: str
    role: Optional[str] = None
    location: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    bullets: List[str] = []


class Award(BaseModel):
    title: str
    organization: Optional[str] = None
    date: Optional[str] = None
    description: Optional[str] = None


class Publication(BaseModel):
    title: str
    authors: Optional[str] = None
    venue: Optional[str] = None  # journal, conference, etc.
    date: Optional[str] = None
    url: Optional[str] = None


class AdditionalInfo(BaseModel):
    computer_skills: Optional[str] = None
    technical_skills: Optional[str] = None  # Alternative to computer_skills for non-tech roles
    certifications: List[str] = []
    languages: List[str] = []
    work_eligibility: Optional[str] = None
    professional_memberships: List[str] = []  # e.g., "IEEE", "ACM", "AMA"
    other: Optional[str] = None            # anything extra if you want


class Resume(BaseModel):
    name: str
    contact: Optional[Contact] = None
    headline: Optional[str] = None
    summary: Optional[str] = None

    # Internal skills list – this powers tailoring.
    # On the final resume, we’ll show these under "Computer Skills" in Additional Info.
    skills: List[str] = []

    education: List[EducationEntry] = []
    experience: List[Experience] = []
    projects: List[Project] = []
    volunteer_work: List[VolunteerWork] = []
    awards: List[Award] = []
    publications: List[Publication] = []
    additional_info: Optional[AdditionalInfo] = None