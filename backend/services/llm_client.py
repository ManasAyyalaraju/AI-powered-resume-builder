import json
from openai import OpenAI
from core.config import settings
from services.domain_detector import detect_domain
from services.domain_prompts import get_domain_prompt

client = OpenAI(api_key=settings.openai_api_key)

# Simple in-memory cache for domain detection (to avoid duplicate API calls)
_domain_cache = {}


def rewrite_resume_sections(resume_json: dict, job_json: dict) -> str:
    """
    Call the LLM to strongly tailor the resume to any job description:
    - Rewrite summary (if present)
    - Rewrite ALL bullets in experience, projects, and volunteer work
    - Keep the SAME number of bullets per entry
    - Adapt to any domain (tech, healthcare, finance, marketing, etc.)
    """

    # Stage 1: Detect domain (with caching to avoid duplicate calls)
    jd_title = job_json.get("title", "")
    cache_key = jd_title.lower()[:50]  # Use first 50 chars of title as cache key
    
    if cache_key in _domain_cache:
        domain_info = _domain_cache[cache_key]
    else:
        domain_info = detect_domain(job_json)
        _domain_cache[cache_key] = domain_info
    
    industry = domain_info.get("industry", "General / Hybrid")
    sub_domain = domain_info.get("sub_domain", "General Business")
    confidence = domain_info.get("confidence", "medium")
    
    # Stage 2: Load domain-specific prompt
    domain_config = get_domain_prompt(industry, sub_domain)
    
    # Build a simple focus string from JD skills
    must = job_json.get("must_have_skills", []) or []
    nice = job_json.get("nice_to_have_skills", []) or []
    focus_skills = ", ".join(must + nice)

    # Build domain-specific guidance section
    if domain_config:
        domain_guidance = f"""
=========================================
DOMAIN-SPECIFIC TAILORING GUIDANCE
=========================================

DETECTED DOMAIN: {industry} > {sub_domain} (Confidence: {confidence})

**EMPHASIS AREAS:**
{chr(10).join(f"- {item}" for item in domain_config.get("emphasis", []))}

**LANGUAGE PATTERNS:**
Use these action verbs and phrases where appropriate:
{", ".join(domain_config.get("language_patterns", []))}

**METRICS TO HIGHLIGHT:**
{chr(10).join(f"- {item}" for item in domain_config.get("metrics", []))}

**SKILL PRIORITIES:**
- HIGH PRIORITY: {", ".join(domain_config.get("skill_priorities", {}).get("high", []))}
- MEDIUM PRIORITY: {", ".join(domain_config.get("skill_priorities", {}).get("medium", []))}
- LOW PRIORITY (de-emphasize): {", ".join(domain_config.get("skill_priorities", {}).get("low", []))}

**INDUSTRY TERMINOLOGY:**
Use these terms naturally where relevant:
{", ".join(domain_config.get("terminology", []))}

**TAILORING INSTRUCTIONS:**
- Rewrite bullets to emphasize the areas listed above
- Use the language patterns provided to match industry expectations
- Highlight metrics that are relevant to this domain
- Prioritize skills from the HIGH PRIORITY list when they appear in the resume
- De-emphasize or omit skills from the LOW PRIORITY list unless clearly required
- Use industry terminology naturally throughout the resume
"""
    else:
        # Fallback for unknown domains
        domain_guidance = f"""
=========================================
DOMAIN-SPECIFIC TAILORING GUIDANCE
=========================================

DETECTED DOMAIN: {industry} > {sub_domain} (Confidence: {confidence})

**GENERAL ADAPTATION:**
- Analyze the job description to identify key requirements and terminology
- Use industry-standard language and concepts
- Emphasize relevant skills and experiences
- Match the tone and style expected in this field
"""

    prompt = f"""
You are an expert resume tailoring assistant. Your task is to rewrite my resume to align with the specific job description provided.

=========================================
INPUTS
=========================================

RESUME (JSON):
{json.dumps(resume_json, indent=2)}

JOB DESCRIPTION (JSON):
{json.dumps(job_json, indent=2)}

MY SKILLS (use ONLY when relevant and truthful):
{resume_json.get("skills", [])}

FOCUS SKILLS EXTRACTED FROM JD (prioritize these when relevant and truthful):
{focus_skills}

{domain_guidance}

=========================================
CORE OBJECTIVE
=========================================

Your job is to:
1. **Rewrite resume content** using the domain-specific guidance provided above.
2. **Integrate relevant skills naturally** but ONLY when truthful and supported by the resume.
3. **Preserve structure and accuracy** — no fabricated experience, dates, or responsibilities.
4. **Follow the emphasis areas, language patterns, and terminology** for the detected domain.

=========================================
SKILL USAGE RULES (IMPORTANT)
=========================================

- You may ONLY use skills that appear in the resume's skills list.
- NEVER introduce or reference tools, technologies, or methodologies the resume does not support.
- Prioritize skills that match the JD requirements.
- Use skills contextually within bullet points, not just as a list.
- De-emphasize or omit skills that are irrelevant to the role.
- Skill usage should be:
  - Truthful (only skills actually in the resume)
  - Contextual (mentioned where relevant in descriptions)
  - Non-forced (natural integration, not forced mentions)
  - Domain-aligned (relevant to the job requirements)  

=========================================
IMPACT & METRICS (IMPORTANT)
=========================================

- Prefer bullets that show concrete outcomes or impact (e.g., time saved, % improvement, scale, reliability).
- When the ORIGINAL resume bullet already contains numbers or measurable results, KEEP or slightly refine those metrics (you may rephrase but do not contradict them).
- You MAY introduce reasonable, conservative quantification ONLY when it is clearly implied by the original text (e.g., "thousands of records" → "1,000+ records") and never fabricate unrealistic results.
- Do NOT invent projects, companies, responsibilities, or wildly new metrics that are not supported by the original bullets.
- Not every bullet needs numbers; prioritize metrics where they make sense (performance, scale, accuracy, revenue/efficiency, adoption, etc.).

=========================================
STRUCTURE RULES
=========================================

- KEEP EXACTLY the same number of bullets per job and per project.
- Do NOT change job titles, companies, dates, or locations.
- You MAY adjust project role titles (e.g., "Machine Learning Engineer" → "Analytics Engineer / Data Analyst") depending on the JD.
- Preserve the JSON structure exactly.
- Rewrite wording strongly, but remain 100% truthful.

=========================================
BULLET POINT FORMATTING (CRITICAL)
=========================================

- **WRITE COMPREHENSIVE, FULL-LINE BULLETS**: Each bullet should be detailed and substantive, ideally filling 2-3 complete lines of text on the page (approximately 150-250 characters per bullet). Do NOT write short, half-line bullets.
- **TARGET LENGTH**: Aim for bullets that are 150-250 characters long, which typically fills 2-3 complete lines on a standard resume format. Add context, metrics, technologies used, and impact details to reach this length naturally.
- **ADD RELEVANT DETAIL**: Expand each bullet with:
  * Specific technologies, tools, or methodologies used (from the skills list)
  * Quantifiable metrics and outcomes (scale, impact, performance improvements)
  * Context about the work (team size, scope, stakeholders, business impact)
  * Actions taken AND results achieved
- **CRITICAL: Never create short third lines** - If a bullet wraps to a third line, that line MUST be substantial (more than half the page width, typically 60+ characters). NEVER end with just 2-3 words on a third line.
- **AVOID ENDING WITH SHORT PHRASES** - Do NOT end bullets with short prepositional phrases like "for stakeholders", "for future reference", "the DFW region", etc. These create awkward short third lines.
- **If approaching a short third line, you MUST:**
  a) **Expand the content significantly** - Add more detail, context, metrics, or outcomes to make the third line substantial (60+ characters minimum), OR
  b) **Condense and integrate** - Rewrite to fit into 2 complete lines by integrating phrases earlier in the bullet
- **Integration strategy** - Integrate short phrases earlier (e.g., "analyzed DFW region data to identify trends" instead of "analyzed data to identify trends in the DFW region").
- **Examples of good bullet length**:
  * TOO SHORT: "Developed Python scripts for data analysis" (44 chars - only half a line)
  * GOOD: "Developed Python scripts using pandas and NumPy to automate data analysis workflows, reducing manual processing time by 60% and enabling daily analysis of 10,000+ customer records" (187 chars - 2 full lines)
- **Key principle**: Write detailed, comprehensive bullets that showcase the full scope of work and impact. Each bullet should fill at least 2 complete lines. Be generous with relevant details while staying truthful.

=========================================
OUTPUT FORMAT
=========================================

Return ONLY valid JSON representing the entire rewritten resume.
No commentary. No markdown. No explanation.
"""

    system_message = f"You are an expert resume editor and ATS optimization specialist specializing in {industry} roles, specifically {sub_domain}. You use domain-specific terminology, emphasis, and language patterns to create highly tailored resumes."
    
    response = client.chat.completions.create(
        model="gpt-4o-mini",  # or "gpt-4o" / "gpt-3.5-turbo"
        messages=[
            {"role": "system", "content": system_message},
            {"role": "user", "content": prompt},
        ],
        temperature=0.6,  # slightly higher to encourage stronger rewrites
    )

    content = response.choices[0].message.content
    return content