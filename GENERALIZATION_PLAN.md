# Resume App Generalization Plan

## Current State Analysis

### What's Already Generic ✅
- **Resume Model Structure**: The Pydantic models are fairly flexible
- **PDF Parsing**: Uses LLM to extract structured data from any PDF
- **Template**: HTML template is ATS-friendly and works with the model structure
- **API Endpoint**: Already accepts any PDF upload

### What Needs Generalization ⚠️

1. **Hardcoded Skills List** (`keyword_extractor.py`)
   - Currently limited to tech/ML/DS skills
   - Should work for any domain (healthcare, finance, marketing, etc.)

2. **Domain-Specific Tailoring** (`llm_client.py`)
   - Hardcoded domains (Data Analyst, ML, SWE, etc.)
   - Should dynamically detect and adapt to any domain

3. **Resume Structure Assumptions**
   - Assumes "projects" section exists
   - Assumes specific date formats
   - May not handle all resume variations

4. **Skills Extraction Logic**
   - Relies on hardcoded `KNOWN_SKILLS` list
   - Should extract skills dynamically from resume content

---

## Recommended Approaches

### Option 1: LLM-Powered Dynamic Extraction (Recommended)
**Pros**: Most flexible, works for any domain, minimal maintenance
**Cons**: Slightly higher API costs, requires good prompts

**Implementation**:
- Replace hardcoded skills list with LLM-based skill extraction
- Use LLM to detect domain from job description
- Let LLM identify relevant skills from both resume and JD
- Make tailoring prompts domain-agnostic

### Option 2: Hybrid Approach (Balanced)
**Pros**: Fast for common cases, flexible for edge cases
**Cons**: More complex logic

**Implementation**:
- Keep a broad skills database (expandable)
- Use LLM as fallback for unknown domains
- Cache common skill extractions

### Option 3: Configuration-Based (Simplest)
**Pros**: Easy to understand, fast
**Cons**: Requires manual updates for new domains

**Implementation**:
- Create domain-specific config files
- Allow users to select domain or auto-detect
- Expand skills lists per domain

---

## Detailed Recommendations

### 1. Dynamic Skill Extraction

**Current**: Hardcoded `KNOWN_SKILLS` list
**New**: LLM extracts skills from resume text

```python
def extract_skills_from_resume(resume_text: str, domain: str = None) -> List[str]:
    """
    Use LLM to extract all skills, tools, technologies from resume.
    Works for any domain (tech, healthcare, finance, etc.)
    """
    prompt = f"""
    Extract all skills, tools, technologies, and competencies mentioned in this resume.
    Include: programming languages, software, frameworks, methodologies, certifications, etc.
    
    Resume text: {resume_text}
    
    Return a JSON array of skill strings.
    """
    # LLM call...
```

### 2. Domain-Agnostic Tailoring

**Current**: Hardcoded domain-specific instructions
**New**: LLM infers domain and adapts automatically

```python
def rewrite_resume_sections(resume_json: dict, job_json: dict) -> str:
    """
    Generic tailoring that works for any domain.
    LLM infers domain from JD and adapts language accordingly.
    """
    prompt = f"""
    Analyze the job description to determine:
    1. Industry/domain (tech, healthcare, finance, marketing, etc.)
    2. Key competencies required
    3. Preferred language/style
    
    Then tailor the resume to match, using domain-appropriate terminology.
    ...
    """
```

### 3. Flexible Resume Structure

**Enhancements**:
- Make "projects" optional (not all resumes have projects)
- Support alternative sections (volunteer work, publications, etc.)
- Handle missing fields gracefully
- Support different date formats more robustly

### 4. Improved Resume Parsing

**Enhancements**:
- Better handling of non-standard formats
- Support for multiple resume styles (chronological, functional, hybrid)
- Extract skills from anywhere in resume (not just "Computer Skills" section)
- Handle various section names (e.g., "Technical Skills" vs "Computer Skills")

### 5. ATS Optimization Features

**Add**:
- Keyword density analysis
- Section ordering optimization
- Format validation (font sizes, margins, etc.)
- ATS compatibility scoring

---

## Implementation Priority

### Phase 1: Core Generalization (High Priority)
1. ✅ Replace hardcoded skills with LLM extraction
2. ✅ Make tailoring domain-agnostic
3. ✅ Make projects section optional
4. ✅ Improve resume parsing robustness

### Phase 2: Enhanced Features (Medium Priority)
1. Add support for additional resume sections
2. Improve date format handling
3. Add ATS compatibility checks
4. Better error handling for edge cases

### Phase 3: Advanced Features (Low Priority)
1. Resume format detection (chronological vs functional)
2. Multi-language support
3. Resume quality scoring
4. Custom template selection

---

## Specific Code Changes Needed

### 1. `keyword_extractor.py`
- Remove `KNOWN_SKILLS` constant
- Add LLM-based skill extraction function
- Extract skills from both resume and JD dynamically

### 2. `llm_client.py` (rewrite_resume_sections)
- Remove hardcoded domain list
- Make prompt domain-agnostic
- Let LLM infer domain and adapt

### 3. `resume_models.py`
- Make `projects` optional (already is, but ensure handling)
- Consider adding optional sections (volunteer, publications, etc.)

### 4. `pdf_resume_parser.py`
- Improve prompt to handle various formats
- Better skill extraction from anywhere in resume
- Handle missing sections gracefully

### 5. `tailor_routes.py`
- Remove dependency on hardcoded skills
- Improve skill normalization logic

---

## Testing Strategy

1. **Test with diverse resumes**:
   - Tech (current)
   - Healthcare
   - Finance
   - Marketing
   - Education
   - Non-technical roles

2. **Test edge cases**:
   - Resumes without projects
   - Resumes with unusual sections
   - Resumes with missing contact info
   - Very short/long resumes

3. **Validate ATS compatibility**:
   - Test with real ATS systems
   - Check keyword extraction accuracy
   - Verify formatting compatibility

