"""
Domain detection module for identifying industry and sub-domain from job descriptions.
"""
import json


def detect_domain(job_json: dict) -> dict:
    """
    Analyze job description to detect industry and sub-domain.
    
    Returns:
        {
            "industry": "Technology",
            "sub_domain": "Data Analyst",
            "confidence": "high"
        }
    """
    
    jd_text = job_json.get("raw_text", "")
    jd_title = job_json.get("title", "")
    
    prompt = f"""
You are a job classification expert. Analyze the following job description and classify it into an industry and specific sub-domain.

INDUSTRIES:
- Technology
- Finance
- Healthcare
- Marketing
- Education
- Operations
- Consulting
- General / Hybrid

TECHNOLOGY SUB-DOMAINS:
- Software Engineering (SWE)
- Data Analyst / Business Intelligence
- Analytics Engineer / Data Engineering
- Machine Learning / AI / Data Science
- Cloud / DevOps
- Frontend Development
- Backend Development
- Full-Stack Development
- Mobile Development
- QA / Testing

FINANCE SUB-DOMAINS:
- Commercial Banking
- Investment Banking
- Corporate Finance
- Risk Management
- Financial Analysis
- Accounting
- Wealth Management

HEALTHCARE SUB-DOMAINS:
- Clinical (Nursing, Physician, etc.)
- Healthcare Administration
- Medical Research
- Public Health
- Healthcare IT

MARKETING SUB-DOMAINS:
- Digital Marketing
- Content Marketing
- Brand Management
- Marketing Analytics
- Product Marketing

EDUCATION SUB-DOMAINS:
- Teaching (K-12, Higher Ed)
- Educational Administration
- Curriculum Development
- Educational Technology

OPERATIONS SUB-DOMAINS:
- Operations Management
- Supply Chain
- Process Improvement
- Quality Assurance

CONSULTING SUB-DOMAINS:
- Management Consulting
- Technology Consulting
- Financial Consulting

GENERAL / HYBRID:
- Project Management
- Business Analysis
- General Business

Return a JSON object with this structure:
{{
    "industry": "Technology",
    "sub_domain": "Data Analyst",
    "confidence": "high"
}}

Confidence levels:
- "high": Clear indicators, specific role type
- "medium": Some indicators, but could be multiple domains
- "low": Unclear or very general role

JOB TITLE: {jd_title}

JOB DESCRIPTION:
\"\"\"{jd_text}\"\"\"

Return ONLY valid JSON. No markdown, no explanations.
"""

    try:
        # Lazy import to avoid circular dependency
        from services.llm_client import client
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0,
        )

        raw_content = response.choices[0].message.content.strip()
        
        # Handle possible markdown code blocks
        if raw_content.startswith("```"):
            first_newline = raw_content.find("\n")
            last_fence = raw_content.rfind("```")
            if first_newline != -1 and last_fence != -1:
                raw_content = raw_content[first_newline + 1:last_fence].strip()

        parsed = json.loads(raw_content)
        
        # Validate structure
        result = {
            "industry": parsed.get("industry", "General / Hybrid"),
            "sub_domain": parsed.get("sub_domain", "General Business"),
            "confidence": parsed.get("confidence", "medium")
        }
        
        return result
        
    except (json.JSONDecodeError, KeyError, Exception) as e:
        # Fallback to general domain
        return {
            "industry": "General / Hybrid",
            "sub_domain": "General Business",
            "confidence": "low"
        }

