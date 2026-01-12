from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import Base, engine
from app.api import auth, customers, aircraft, manual_apps

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(customers.router, prefix=f"{settings.API_V1_STR}/customers", tags=["customers"])
app.include_router(aircraft.router, prefix=f"{settings.API_V1_STR}/aircraft", tags=["aircraft"])
app.include_router(manual_apps.router, prefix=f"{settings.API_V1_STR}/manual-apps", tags=["manual-apps"])

@app.get("/")
def read_root():
    return {"message": "Aircraft Manuals Manager API", "version": settings.VERSION}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
