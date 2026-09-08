class TailoringGenerationError(Exception):
    """Raised when the LLM tailoring call fails or returns an unusable result.

    Callers must not fall back to silently returning the untailored resume -
    this exists so that failure is a visible, catchable signal instead.
    """
    pass
