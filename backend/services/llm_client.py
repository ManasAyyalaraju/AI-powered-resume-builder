import json
from openai import OpenAI
from core.config import settings

client = OpenAI(api_key=settings.openai_api_key)


def rewrite_resume_sections(resume_json: dict, job_json: dict) -> str:
    """
    Call the LLM to strongly tailor the resume:
    - Rewrite summary (if present)
    - Rewrite ALL bullets in experience and projects
    - Keep the SAME number of bullets per entry
    - Aggressively emphasize AI/ML-related responsibilities and tools that are honestly supported
    """

    # Build a simple focus string from JD skills to shove in front of the model's face
    must = job_json.get("must_have_skills", []) or []
    nice = job_json.get("nice_to_have_skills", []) or []
    focus_skills = ", ".join(must + nice)

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

=========================================
CORE OBJECTIVE
=========================================

Your job is to:
1. **Infer the job domain** from the job description.
2. **Rewrite every resume bullet** to match that domain's expectations.
3. **Integrate skills naturally** but ONLY when truthful and supported.
4. **Use domain-appropriate language and concepts** without exaggeration.
5. **Preserve structure and accuracy** — no fabricated experience.

=========================================
DOMAIN CLASSIFICATION
=========================================

First, classify the job description into ONE of the following domains:

- Data Analyst / Business Intelligence  
- Analytics Engineer / Data Engineering  
- Machine Learning / AI / Data Science  
- Software Engineering  
- Cloud / DevOps  
- Product / Business  
- General Technical / Hybrid  

Your rewriting MUST adapt to this domain.
The system should not bias toward any single domain globally — 
the JD determines the domain.

=========================================
DOMAIN-SPECIFIC WRITING BEHAVIOR
=========================================

### 1. If the domain is DATA ANALYST / BI:
Emphasize:
- SQL, querying, data cleaning, validation  
- KPIs, dashboards, Tableau, Power BI  
- EDA, trends, anomalies, metric design  
- storytelling, stakeholder communication  
- business insights, reporting, interpretation  

Rewrite using language like:
- “analyzed”, “validated”, “cleaned”, “evaluated”
- “built dashboards”, “constructed KPIs”
- “generated insights that informed decisions”
- “translated business questions into analytical findings”

### 2. If the domain is ANALYTICS ENGINEER / DATA ENGINEERING:
Emphasize:
- data transformation (Pandas/SQL)  
- structured datasets, reproducible workflows  
- data quality checks, documentation  
- metric definitions, modeling concepts  
- pipelines and end-to-end data flows  

Use phrasing like:
- “built transformation steps”, “structured datasets”
- “validated data quality”, “created clean analytical tables”
- “documented data logic for reproducibility”

### 3. If the domain is MACHINE LEARNING / AI:
Emphasize:
- model development (scikit-learn, XGBoost)  
- feature engineering, preprocessing  
- evaluation metrics (ROC-AUC, precision, recall)  
- experiments, iterations, diagnostics  
- FastAPI inference (if present in resume)

If the JD mentions AI, Data Science, or predictive modeling:
- Reframe existing experience to highlight:
  - scripting and automation (Python, SQL)
  - working with structured/unstructured data
  - cleaning, validating, and analyzing data
  - building or supporting predictive models or analytical tools
- Prefer to de-emphasize front-end technologies (HTML, CSS, TypeScript, Next.js) unless clearly required.

### 4. If the domain is SOFTWARE ENGINEERING:
Emphasize:
- backend logic, APIs, scalable components  
- debugging, testing, version control  
- performance, modular design  
- when the JD mentions it: C/C++ programming, data structures & algorithms, multi-threading, concurrency, and low-level/system performance  

If the JD mentions C, C++, systems, networking, multi-threading, or performance:
- Reframe existing experience to highlight:
  - implementation details (data structures, algorithms, memory/performance considerations)
  - debugging complex issues and improving reliability
  - optimizing throughput, latency, or resource usage where applicable
  - any work that approximates systems thinking (IoT networks, backend performance, large data volumes)

### 5. If the domain is CLOUD / DEVOPS:
Emphasize:
- pipelines, automation, deployments  
- monitoring, logs, containers (ONLY if in skills list)  

### 6. If the domain is PRODUCT / BUSINESS:
Emphasize:
- stakeholder alignment  
- business metrics  
- experimentation  
- clear communication, outcomes  

=========================================
SKILL USAGE RULES (IMPORTANT)
=========================================

- You may ONLY use skills that appear in the skills list.
- NEVER introduce or reference tools the resume does not support.
- Use skills selectively based on the JD domain:
  - Data Analyst → SQL, Pandas, NumPy, BI tools, visualization
  - Analytics Engineer → SQL, Pandas, NumPy, transformation logic, data modeling concepts
  - ML → Pandas, NumPy, scikit-learn, XGBoost, FastAPI
  - SWE → C, C++, Python, SQL, PostgreSQL, Git (avoid frontend unless relevant)
- Avoid listing irrelevant skills for the domain (e.g., avoid front-end skills for DA roles).

Skill usage should be:
- Truthful  
- Contextual  
- Non-forced  
- Domain-aligned  

=========================================
IMPACT & METRICS (IMPORTANT)
=========================================

- Prefer bullets that show concrete outcomes or impact (e.g., time saved, % improvement, scale, reliability).
- When the ORIGINAL resume bullet already contains numbers or measurable results, KEEP or slightly refine those metrics (you may rephrase but do not contradict them).
- You MAY introduce reasonable, conservative quantification ONLY when it is clearly implied by the original text (e.g., “thousands of records” → “1,000+ records”) and never fabricate unrealistic results.
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
BULLET POINT FORMATTING (IMPORTANT)
=========================================

- Write bullets to be SUBSTANTIALLY LONGER to fill the entire line width of the resume page.
- Aim for bullets that are approximately 80-120 characters per line, utilizing the full width available.
- If a bullet wraps to a second line, ensure the second line also fills the available space.
- **CRITICAL: Avoid short third lines** - If a bullet wraps to a third line, the third line MUST be substantial (more than half the page width, typically 60+ characters). Never end with just 2-3 words on a third line.
- **AVOID ENDING WITH SHORT PHRASES** - Do NOT end bullets with short prepositional phrases or brief clauses like "for stakeholders", "for future reference", "the DFW region", "service delivery", "community support", "actionable insights", etc. These create awkward short third lines.
- **Prefer 2 full lines over 3 lines with a short third line** - If you can convey the information effectively in 2 full lines, do so. Only use 3+ lines when the content naturally requires it AND the final line will be substantial (more than half page width, 60+ characters).
- **If you find yourself about to create a third line with only 2-3 words, you MUST:**
  a) **Expand the content significantly** - Add more detail, context, metrics, or outcomes to make the third line substantial (60+ characters), OR
  b) **Condense to 2 lines** - Remove or integrate the short ending phrase earlier in the bullet to fit into 2 full lines instead
- **Integration strategy** - If you have a short phrase like "for stakeholders" or "in the DFW region", integrate it earlier in the bullet (e.g., "analyzed DFW region data" instead of ending with "the DFW region").
- Add more detail, context, specific examples, metrics, or outcomes to expand shorter bullets naturally.
- Prioritize making bullets comprehensive and full rather than concise, but avoid awkward line breaks.
- The goal is to maximize information density while maintaining readability, truthfulness, and professional formatting.
- **Before finalizing each bullet, mentally check: If this wraps to a third line, will that third line be at least 60 characters? If not, revise immediately.**

=========================================
OUTPUT FORMAT
=========================================

Return ONLY valid JSON representing the entire rewritten resume.
No commentary. No markdown. No explanation.
"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",  # or "gpt-4o" / "gpt-3.5-turbo"
        messages=[
            {"role": "system", "content": "You are an expert resume editor and ATS optimization specialist for AI/ML roles."},
            {"role": "user", "content": prompt},
        ],
        temperature=0.6,  # slightly higher to encourage stronger rewrites
    )

    content = response.choices[0].message.content
    return content