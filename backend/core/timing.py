import time
from contextlib import contextmanager


@contextmanager
def timed_stage(name: str, timings: dict):
    """Record how long a pipeline stage took, in milliseconds, into `timings[name]`."""
    start = time.perf_counter()
    try:
        yield
    finally:
        timings[name] = round((time.perf_counter() - start) * 1000)
