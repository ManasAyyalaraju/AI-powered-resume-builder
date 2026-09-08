"""
Deterministic truthfulness guardrail for tailored bullets. No LLM calls here.

Scope is intentionally narrow: general fabrication detection is unbounded and
fuzzy. What actually happens in practice is the model borrowing a JD-desired
skill the candidate doesn't have, to inflate the match - so that's the one
thing this checks for: does a tailored bullet introduce a JD skill that
wasn't in the original bullet and isn't anywhere in the candidate's own
skill lists?
"""
import re
from functools import lru_cache
from typing import Dict, List


@lru_cache(maxsize=512)
def _skill_pattern(skill: str) -> re.Pattern:
    """
    Build a match pattern for a skill string that's safe for symbol-heavy
    names like "C++", "Node.js", "C#" - re.escape() so those symbols aren't
    treated as regex metacharacters, and custom alphanumeric-only boundaries
    since \\b doesn't reliably anchor around trailing +/./#. Allows a simple
    trailing s/es plural.
    """
    escaped = re.escape(skill.strip())
    return re.compile(
        rf"(?<![A-Za-z0-9]){escaped}(?:s|es)?(?![A-Za-z0-9])",
        re.IGNORECASE,
    )


def _contains_skill(text: str, skill: str) -> bool:
    if not skill or not skill.strip() or not text:
        return False
    return bool(_skill_pattern(skill).search(text))


def find_unauthorized_terms(
    original_bullet: str,
    tailored_bullet: str,
    jd_skills: List[str],
    resume_skills: List[str],
    resume_technical_skills: List[str],
) -> List[str]:
    """
    Return the JD skills that appear in `tailored_bullet` but not in
    `original_bullet` nor anywhere in the candidate's own skill lists.
    """
    allowed_text = " ".join([*resume_skills, *resume_technical_skills])
    flagged = []

    for skill in jd_skills:
        if not skill or not skill.strip():
            continue
        if not _contains_skill(tailored_bullet, skill):
            continue  # not introduced in the tailored version
        if _contains_skill(original_bullet, skill):
            continue  # was already there - not a new claim
        if _contains_skill(allowed_text, skill):
            continue  # candidate actually lists this skill elsewhere
        flagged.append(skill)

    return flagged


def verify_bullets(
    original_bullets: List[str],
    tailored_bullets: List[str],
    jd_skills: List[str],
    resume_skills: List[str],
    resume_technical_skills: List[str],
) -> Dict[int, List[str]]:
    """
    Check each tailored bullet against its original. Returns a map of
    bullet index -> flagged JD-skill terms, for bullets with a violation.
    """
    violations: Dict[int, List[str]] = {}

    for i, (original, tailored) in enumerate(zip(original_bullets, tailored_bullets)):
        flagged = find_unauthorized_terms(
            original, tailored, jd_skills, resume_skills, resume_technical_skills
        )
        if flagged:
            violations[i] = flagged

    return violations
