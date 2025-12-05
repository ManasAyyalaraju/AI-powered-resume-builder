from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import tailor_routes

app = FastAPI(title="Auto Resume Tailor")

# CORS middleware to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Local development
        "https://*.vercel.app",   # All Vercel deployments (preview & production)
        # Add your custom domain here when you set it up:
        # "https://your-custom-domain.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register router
app.include_router(tailor_routes.router, prefix="/api")

@app.get("/")
def root():
    return {
        "message": "Auto Resume Tailor API",
        "status": "running",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "docs": "/docs",
            "api": "/api"
        }
    }

@app.get("/health")
def health_check():
    return {"status": "ok"}
