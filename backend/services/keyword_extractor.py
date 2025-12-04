from typing import List, Tuple

KNOWN_SKILLS = [
    # Programming
    "python",
    "sql",
    "java",
    "c++",
    "javascript",
    "html",
    "css",
    "Ruby",
    "Ruby on Rails",
    "typescript",

    # Core ML / DS
    "machine learning",
    "deep learning",
    "neural networks",
    "supervised learning",
    "unsupervised learning",
    "reinforcement learning",
    "statistics",
    "probability",
    "linear algebra",
    "calculus",

    # ML libraries
    "scikit-learn",
    "sklearn",
    "pandas",
    "numpy",
    "xgboost",
    "tensorflow",
    "pytorch",
    "jax",
    "mlflow",

    # Data / viz
    "matplotlib",
    "seaborn",
    "plotly",
    "jupyter",

    # Cloud / tools
    "aws",
    "gcp",
    "azure",
    "git",
    "docker",
    "spark",

    # SQL / db
    "postgresql",
    "mysql",
]

def extract_skills_and_keywords(text: str) -> Tuple[List[str], List[str], List[str]]:
    """
    Very simple extraction:
    - must_have_skills: any KNOWN_SKILLS that appear in the text
    - nice_to_have_skills: empty for now
    - keywords: empty for now (we'll improve later)
    """
    text_lower = text.lower()

    must_have = [skill for skill in KNOWN_SKILLS if skill in text_lower]
    nice_to_have: List[str] = []
    keywords: List[str] = []

    return must_have, nice_to_have, keywords
