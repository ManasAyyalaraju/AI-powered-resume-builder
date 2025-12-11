import json
from openai import OpenAI
from core.config import settings
from services.domain_detector import detect_domain
from services.domain_prompts import get_domain_prompt

# Validate API key on import
try:
    settings.validate_api_key()
except ValueError as e:
    import warnings
    warnings.warn(str(e), UserWarning)

client = OpenAI(api_key=settings.openai_api_key) if settings.openai_api_key else None

# Simple in-memory cache for domain detection (to avoid duplicate API calls)
_domain_cache = {}


def rewrite_resume_sections(resume_json: dict, job_json: dict) -> str:
    """
    Call the LLM to strongly tailor the resume to any job description:
    - Rewrite summary (if present)
    - Rewrite ALL bullets in experience, projects, and volunteer work
    - Keep the SAME number of bullets per entry
    - Match original bullet lengths character-for-character
    - Adapt to any domain (tech, healthcare, finance, marketing, etc.)
    """

    # Calculate original resume structure and bullet lengths
    experience_bullet_counts = [len(exp.get("bullets", [])) for exp in resume_json.get("experience", [])]
    project_bullet_counts = [len(proj.get("bullets", [])) for proj in resume_json.get("projects", [])]
    leadership_bullet_counts = [len(lead.get("bullets", [])) for lead in resume_json.get("leadership", [])]
    volunteer_bullet_counts = [len(vol.get("bullets", [])) for vol in resume_json.get("volunteer_work", [])]
    
    # Get all bullets with their lengths for the prompt
    bullet_examples = []
    for exp in resume_json.get("experience", []):
        for bullet in exp.get("bullets", []):
            bullet_examples.append(f"Original ({len(bullet)} chars): \"{bullet}\"")
    for proj in resume_json.get("projects", []):
        for bullet in proj.get("bullets", []):
            bullet_examples.append(f"Original ({len(bullet)} chars): \"{bullet}\"")
    for lead in resume_json.get("leadership", []):
        for bullet in lead.get("bullets", []):
            bullet_examples.append(f"Original ({len(bullet)} chars): \"{bullet}\"")
    
    # Show first 5 as examples
    bullet_examples_str = "\n".join(bullet_examples[:5])
    
    # Calculate bullet lengths
    all_bullets = []
    for exp in resume_json.get("experience", []):
        all_bullets.extend(exp.get("bullets", []))
    for proj in resume_json.get("projects", []):
        all_bullets.extend(proj.get("bullets", []))
    for lead in resume_json.get("leadership", []):
        all_bullets.extend(lead.get("bullets", []))
    
    bullet_lengths = [len(bullet) for bullet in all_bullets if bullet]
    avg_bullet_length = sum(bullet_lengths) / len(bullet_lengths) if bullet_lengths else 150
    
    total_bullets = sum(experience_bullet_counts + project_bullet_counts + leadership_bullet_counts + volunteer_bullet_counts)
    
    # Use compact_mode from the resume object (already calculated in tailor_engine.py)
    # This determines whether we need tight spacing AND short bullets
    is_compact = resume_json.get("compact_mode", False)
    
    # Stage 1: Detect domain (with caching to avoid duplicate calls)
    jd_title = job_json.get("title", "")
    cache_key = jd_title.lower()[:50]
    
    if cache_key in _domain_cache:
        domain_info = _domain_cache[cache_key]
    else:
        domain_info = detect_domain(job_json)
        _domain_cache[cache_key] = domain_info
    
    industry = domain_info.get("industry", "General / Hybrid")
    sub_domain = domain_info.get("sub_domain", "General Business")
    
    # Build a simple focus string from JD skills
    must = job_json.get("must_have_skills", []) or []
    nice = job_json.get("nice_to_have_skills", []) or []
    focus_skills = ", ".join(must + nice)

    # Build examples and instructions based on resume type
    if is_compact:
        # Adaptive compression target based on original bullet length
        # Don't compress too aggressively - respect user's original content
        if avg_bullet_length >= 200:
            target_range = "170-190 characters"
            target_desc = "moderately compressed"
            compression_note = "Original bullets are very long (200+ chars). Compress them to ~180 chars to save space while preserving key details."
        elif avg_bullet_length >= 170:
            target_range = "150-170 characters"
            target_desc = "slightly compressed"
            compression_note = "Original bullets are moderately long (170-200 chars). Compress them to ~160 chars to fit better on one page."
        else:
            target_range = "130-160 characters"
            target_desc = "kept concise"
            compression_note = "Original bullets are already concise. Keep them short at 130-160 chars."
        
        primary_rule = f"""
=========================================
⚠️ PRIMARY RULE: COMPRESS BULLETS FOR ONE-PAGE FIT ⚠️
=========================================

RESUME TYPE: COMPACT/ONE-PAGE - Need SHORT bullets to fit on one page

ORIGINAL AVERAGE BULLET LENGTH: {avg_bullet_length:.0f} characters
TARGET RANGE: {target_range}

**YOUR PRIMARY JOB:**
Compress bullets to fit on one page while preserving key information.
{compression_note}

**HOW TO COMPRESS BULLETS:**
✅ GOOD: Use concise, powerful action verbs
✅ GOOD: Remove redundant words and filler phrases ("comprehensive", "various", "diverse")
✅ GOOD: Keep core metrics and key technologies
✅ GOOD: Eliminate unnecessary context and explanations
✅ GOOD: Integrate JD keywords by REPLACING verbose descriptions
❌ BAD: Removing important metrics or achievements
❌ BAD: Making bullets too short and losing substance
❌ BAD: Writing bullets that wrap to 3 lines

**Example Compression:**
Original (240 chars): "Spread client financials by meticulously analyzing tax returns, reviewing supporting schedules, and preparing comprehensive income statements, balance sheets, and key financial metrics, which supported thorough valuation and transaction analysis for multiple clients"
✅ Compressed (185 chars): "Analyzed client financials by reviewing tax returns, supporting schedules, and preparing income statements, balance sheets, and key metrics to support valuation and transaction analysis for clients"
"""
        examples_header = f"**COMPACT RESUME - Compress bullets to {target_range}:**"
        example1 = '✅ Good (185 chars): "Analyzed client financials by reviewing tax returns, supporting schedules, and preparing income statements, balance sheets, and key metrics to support valuation and transaction analysis for clients"'
        example2 = '✅ Good (178 chars): "Performed competitor analysis for two client engagements with $10-15M revenue, identifying 8+ comparable companies to benchmark valuations and align pricing expectations for target businesses"'
        headline_summary_instruction = ""
    else:
        primary_rule = """
=========================================
⚠️ PRIMARY RULE: EXPAND CONTENT TO FILL PAGE ⚠️
=========================================

RESUME TYPE: SPARSE - EXPAND bullets and ADD headline/summary

**YOUR PRIMARY JOB:**
1. **ADD HEADLINE**: Create a professional headline (one impactful sentence, 50-80 chars)
2. **ADD SUMMARY**: Write a compelling 2-3 sentence summary (150-250 chars total)
3. **EXPAND BULLETS**: Make each bullet MORE detailed and comprehensive
   - Target 180-250 characters per bullet (2.5-3 lines)
   - Add context, technologies, methodologies, and impact
   - Include stakeholder information where relevant
   - Describe scope, team size, and business outcomes
   - Use metrics and quantifiable results

**HOW TO EXPAND BULLETS:**
✅ GOOD: Add specific technologies and tools used
✅ GOOD: Include team size, scope, and stakeholders
✅ GOOD: Add business context and outcomes
✅ GOOD: Expand on methodologies and approaches
✅ GOOD: Include comprehensive metrics and impact details
✅ GOOD: Make bullets fill 2.5-3 complete lines on the page

**Example of GOOD expansion:**
Original (120 chars): "Supervised sorting and packaging of donated meals and essentials"
✅ Expanded (210 chars): "Supervised and coordinated a team of 10+ volunteers in the efficient sorting, packaging, and distribution of donated meals and essential supplies, ensuring timely delivery to 15+ local charities and hunger relief programs across the Dallas-Fort Worth region"
"""
        examples_header = "**SPARSE RESUME - EXPAND with detail:**"
        example1 = '✅ Good (230 chars): "Developed and engineered 5+ comprehensive IT mobile applications and catalog items using modern frameworks including React Native and TypeScript, resulting in a significant 15% increase in user engagement metrics, positive user ratings, and enhanced customer satisfaction across multiple platforms"'
        example2 = '✅ Good (195 chars): "Supported and facilitated technical sales cycles across 10+ national accounts, collaborating with cross-functional teams to align secure data integration and governance solutions with client business objectives"'
        headline_summary_instruction = """
**HEADLINE AND SUMMARY GENERATION (REQUIRED FOR SPARSE RESUMES):**
- **headline**: Write ONE impactful sentence (50-80 chars) that captures the candidate's value proposition
  Example: "Information Systems Student | Cybersecurity Enthusiast | Tech Leader"
- **summary**: Write 2-3 sentences (150-250 chars) highlighting key strengths, skills, and career focus
  Example: "Information Technology student with hands-on experience in cybersecurity education and community impact initiatives. Skilled in WatsonX AI, data analysis, and volunteer leadership. Passionate about leveraging technology to solve real-world challenges in food security and information systems."
"""

    prompt = f"""
You are an expert resume tailoring assistant. Tailor this resume to the job description.

{primary_rule}

ORIGINAL BULLETS (with character counts):
{bullet_examples_str}
... (showing first 5 bullets as examples)

AVERAGE BULLET LENGTH: {avg_bullet_length:.0f} characters
TOTAL BULLETS: {total_bullets}

=========================================
JOB DESCRIPTION FOCUS
=========================================

TITLE: {job_json.get("title", "N/A")}
INDUSTRY: {industry} > {sub_domain}
KEY SKILLS: {focus_skills if focus_skills else "General"}

=========================================
TAILORING RULES
=========================================

1. **KEEP EXACT BULLET COUNT** - Same number of bullets per job/project as original
2. {"**MATCH CHARACTER COUNTS** - Each tailored bullet should be within ±15 chars of original" if is_compact else "**EXPAND BULLETS** - Each bullet should be 180-250 characters (2.5-3 lines)"}
3. {"**SWAP, DON'T ADD** - Replace generic terms with JD-specific keywords" if is_compact else "**ADD DETAIL** - Include technologies, context, metrics, and impact"}
4. **PRESERVE STRUCTURE** - Do NOT change job titles, companies, dates, or locations
5. **KEEP METRICS** - Preserve all numbers and percentages from original bullets
6. **STAY TRUTHFUL** - Only use skills from the resume's skills list

{headline_summary_instruction}

**SKILLS AVAILABLE** (use ONLY these):
{resume_json.get("skills", [])}

=========================================
EXAMPLES OF GOOD TAILORING
=========================================

{examples_header}

Original (112 chars): "Developed 5+ IT mobile applications resulting in 15% increase in user engagement and positive ratings"
{example1}

Original (95 chars): "Supported technical sales cycles across 10+ national accounts helping align solutions"
{example2}

=========================================
OUTPUT FORMAT
=========================================

Return ONLY valid JSON with the rewritten resume. No commentary, no markdown, no explanation.

RESUME JSON:
{json.dumps(resume_json, indent=2)}

JOB DESCRIPTION JSON:
{json.dumps(job_json, indent=2)}
"""

    system_message = f"You are a resume editor specializing in {industry}. Your PRIMARY goal: tailor content while matching original bullet lengths character-for-character."
    
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": system_message},
            {"role": "user", "content": prompt},
        ],
        temperature=0.3,  # Lower temperature for more consistent length matching
    )

    content = response.choices[0].message.content
    return content


def generate_headline_summary(resume_json: dict) -> dict:
    """
    Generate ONLY a headline and summary from existing resume content.
    - No JD context
    - Do NOT alter bullets or any other fields
    - Keep it concise and truthful to provided data
    """
    if not client:
        return {"headline": None, "summary": None}

    system_message = (
        "You are a resume editor. Only produce a short headline and 2-3 sentence "
        "summary using existing resume details. Do not invent facts. Do not rewrite "
        "bullets or any other fields. Keep it concise and professional."
    )

    prompt = f"""
Resume JSON (truth source):
{json.dumps(resume_json, indent=2)}

Instructions:
- Only output JSON with keys: headline, summary
- Use ONLY information present above (roles, education, skills, bullets)
- No new achievements or skills; do not change wording of bullets
- Keep headline 50-80 characters; summary 2-3 sentences, ~120-220 chars total
- If information is insufficient, return null for that field
"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": prompt},
            ],
            temperature=0.3,
        )
        content = response.choices[0].message.content
        data = json.loads(content)
        return {
            "headline": data.get("headline") or None,
            "summary": data.get("summary") or None,
        }
    except Exception:
        return {"headline": None, "summary": None}