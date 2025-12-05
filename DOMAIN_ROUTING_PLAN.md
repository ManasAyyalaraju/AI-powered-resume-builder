# Domain-Specific Prompt Routing System

## Overview

Two-stage system:
1. **Domain Detection**: LLM analyzes JD → identifies industry + sub-domain
2. **Domain-Specific Tailoring**: Routes to detailed prompt for that specific sub-domain

## Architecture

```
Job Description
    ↓
[Stage 1: Domain Detection]
    ↓
Detected: Industry="Technology", SubDomain="Data Analyst"
    ↓
[Stage 2: Route to Domain-Specific Prompt]
    ↓
Load "Technology > Data Analyst" prompt template
    ↓
Tailor Resume with detailed, sub-domain-specific guidance
```

## Implementation Plan

### Phase 1: Domain Detection Module

**File**: `backend/services/domain_detector.py`

**Function**: `detect_domain(job_json: dict) -> dict`

Returns:
```python
{
    "industry": "Technology",  # Technology, Finance, Healthcare, Marketing, etc.
    "sub_domain": "Data Analyst",  # SWE, Data Analyst, AI/ML, Commercial Banking, etc.
    "confidence": "high"  # high, medium, low
}
```

**Supported Industries & Sub-Domains**:

1. **Technology**
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

2. **Finance**
   - Commercial Banking
   - Investment Banking
   - Corporate Finance
   - Risk Management
   - Financial Analysis
   - Accounting
   - Wealth Management

3. **Healthcare**
   - Clinical (Nursing, Physician, etc.)
   - Healthcare Administration
   - Medical Research
   - Public Health
   - Healthcare IT

4. **Marketing**
   - Digital Marketing
   - Content Marketing
   - Brand Management
   - Marketing Analytics
   - Product Marketing

5. **Education**
   - Teaching (K-12, Higher Ed)
   - Educational Administration
   - Curriculum Development
   - Educational Technology

6. **General / Hybrid**
   - Operations
   - Project Management
   - Business Analysis
   - Consulting

### Phase 2: Domain-Specific Prompt Registry

**File**: `backend/services/domain_prompts.py`

**Structure**: Dictionary of prompt templates

```python
DOMAIN_PROMPTS = {
    "Technology": {
        "Software Engineering": {
            "emphasis": [...],
            "language_patterns": [...],
            "metrics": [...],
            "skill_priorities": [...]
        },
        "Data Analyst": {
            "emphasis": [...],
            "language_patterns": [...],
            ...
        },
        ...
    },
    "Finance": {
        "Commercial Banking": {...},
        "Investment Banking": {...},
        ...
    },
    ...
}
```

### Phase 3: Updated Tailoring Function

**File**: `backend/services/llm_client.py`

**New Flow**:
1. Call `detect_domain(job_json)` → get industry + sub_domain
2. Load domain-specific prompt template
3. Merge with base prompt (structure rules, formatting, etc.)
4. Call LLM with combined prompt

## Detailed Prompt Structure

### Base Prompt (Common to All)
- Structure rules (bullet counts, dates, etc.)
- Formatting rules (line length, etc.)
- Truthfulness requirements
- JSON output format

### Domain-Specific Sections
- **Emphasis Areas**: What to highlight (metrics, tools, outcomes)
- **Language Patterns**: Industry-specific action verbs and phrases
- **Skill Priorities**: Which skills to emphasize/de-emphasize
- **Metrics Focus**: What types of metrics matter (revenue, performance, scale, etc.)
- **Terminology**: Industry-standard terms and jargon
- **Common Pitfalls**: What to avoid for this domain

## Example: Technology > Data Analyst Prompt

```python
{
    "emphasis": [
        "SQL querying and data extraction",
        "Data cleaning and validation",
        "KPIs and dashboard creation",
        "Business insights and storytelling",
        "Stakeholder communication",
        "EDA and trend analysis"
    ],
    "language_patterns": [
        "analyzed", "validated", "cleaned", "evaluated",
        "built dashboards", "constructed KPIs",
        "generated insights that informed decisions",
        "translated business questions into analytical findings"
    ],
    "metrics": [
        "Query performance improvements",
        "Dashboard adoption rates",
        "Time saved through automation",
        "Accuracy improvements",
        "Business impact (revenue, cost savings)"
    ],
    "skill_priorities": {
        "high": ["SQL", "Python", "Pandas", "Tableau", "Power BI", "Excel"],
        "medium": ["NumPy", "Matplotlib", "Seaborn", "Jupyter"],
        "low": ["Frontend technologies", "System administration"]
    },
    "terminology": [
        "KPIs", "metrics", "dashboards", "data pipelines",
        "ETL", "data validation", "stakeholder reporting"
    ]
}
```

## Example: Finance > Investment Banking Prompt

```python
{
    "emphasis": [
        "Financial modeling and analysis",
        "Deal execution and transaction support",
        "Client relationship management",
        "Market research and due diligence",
        "Regulatory compliance",
        "Valuation methodologies"
    ],
    "language_patterns": [
        "executed transactions", "performed due diligence",
        "built financial models", "analyzed market trends",
        "supported M&A transactions", "prepared pitch materials"
    ],
    "metrics": [
        "Deal value ($)",
        "Transaction volume",
        "Client acquisition",
        "Revenue generation",
        "Time to close"
    ],
    "skill_priorities": {
        "high": ["Excel", "Financial Modeling", "Valuation", "Bloomberg"],
        "medium": ["Python", "SQL", "PowerPoint"],
        "low": ["Web development", "Design tools"]
    },
    "terminology": [
        "DCF", "LBO", "M&A", "IPO", "due diligence",
        "pitch book", "comparable company analysis"
    ]
}
```

## Implementation Steps

1. **Create `domain_detector.py`**
   - Domain detection function
   - Returns industry + sub_domain

2. **Create `domain_prompts.py`**
   - Prompt registry structure
   - Add detailed prompts for each sub-domain
   - Start with Tech sub-domains, then expand

3. **Update `llm_client.py`**
   - Add domain detection step
   - Load domain-specific prompt
   - Merge with base prompt
   - Execute tailoring

4. **Testing**
   - Test with various JDs
   - Verify correct domain detection
   - Verify domain-specific tailoring quality

## Benefits

✅ **Precision**: Detailed guidance for each sub-domain
✅ **Flexibility**: Easy to add new industries/sub-domains
✅ **Maintainability**: Centralized prompt management
✅ **Quality**: Better tailoring for specific roles
✅ **Scalability**: Can expand to any industry

## Future Enhancements

- Add more industries (Legal, Real Estate, etc.)
- Add more sub-domains per industry
- Allow manual domain override
- Domain-specific ATS optimization rules
- Industry-specific resume format preferences

