from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine, Base
from app.core.security import get_password_hash
from app.models.models import User

def init_db():
    """Initialize database with default admin user"""
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Check if admin exists
        admin = db.query(User).filter(User.username == "admin").first()
        if not admin:
            admin = User(
                username="admin",
                email="admin@example.com",
                hashed_password=get_password_hash("admin"),
                role="admin",
                is_active=True
            )
            db.add(admin)
            db.commit()
            print("Admin user created: username=admin, password=admin")
        else:
            print("Admin user already exists")
    finally:
        db.close()

if __name__ == "__main__":
    init_db()
