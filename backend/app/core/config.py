from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "Aircraft Manuals Manager"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Database
    DATABASE_URL: str = "postgresql://manuals_user:manuals_pass@db:5432/manuals_db"
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-this-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480  # 8 hours
    
    # Nginx
    NGINX_CONFIG_PATH: str = "/etc/nginx/conf.d/manuals-proxy.conf"
    
    # CORS
    BACKEND_CORS_ORIGINS: list = [
        "http://localhost:3000",
        "http://localhost",
        "http://manuals.ats-technic.com",
        "https://manuals.ats-technic.com",
    ]
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
