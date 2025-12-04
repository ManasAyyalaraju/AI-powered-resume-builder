from fastapi import FastAPI
from routers.tailor_routes import router as tailor_router

app = FastAPI(
    title="Auto Resume Tailoring API",
    version="1.0"
)

# include routes
app.include_router(tailor_router)