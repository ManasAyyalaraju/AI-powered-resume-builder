from fastapi import FastAPI
from routers import tailor_routes

app = FastAPI(title="Auto Resume Tailor")

# Register router
app.include_router(tailor_routes.router, prefix="/api")

@app.get("/health")
def health_check():
    return {"status": "ok"}
