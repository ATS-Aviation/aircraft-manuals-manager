from sqlalchemy.orm import Session
from sqlalchemy import text, inspect
from app.core.database import SessionLocal, engine, Base
from app.core.security import get_password_hash
from app.models.models import User

def run_migrations():
    """Run database migrations for schema changes"""
    inspector = inspect(engine)

    # Check if manual_apps table exists
    if 'manual_apps' in inspector.get_table_names():
        columns = [col['name'] for col in inspector.get_columns('manual_apps')]

        # Add iframe_url column if it doesn't exist
        if 'iframe_url' not in columns:
            with engine.connect() as conn:
                conn.execute(text('ALTER TABLE manual_apps ADD COLUMN iframe_url VARCHAR(500)'))
                conn.commit()
                print("Migration: Added iframe_url column to manual_apps table")

        # Make backend_port nullable
        with engine.connect() as conn:
            conn.execute(text('ALTER TABLE manual_apps ALTER COLUMN backend_port DROP NOT NULL'))
            conn.commit()
            print("Migration: Made backend_port nullable")

    print("Migrations completed")

def init_db():
    """Initialize database with default admin user"""
    Base.metadata.create_all(bind=engine)

    # Run migrations for existing databases
    run_migrations()

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
