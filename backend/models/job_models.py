from pydantic import BaseModel
from typing import List, Optional


class JobDescription(BaseModel):
    title: Optional[str] = None
    company: Optional[str] = None
    must_have_skills: List[str] = []
    nice_to_have_skills: List[str] = []
    responsibilities: List[str] = []
    keywords: List[str] = []
    raw_text: str