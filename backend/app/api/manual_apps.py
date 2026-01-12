from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.schemas.schemas import ManualAppCreate, ManualAppUpdate, ManualAppResponse, ManualAppWithAircraft, NginxReloadResponse
from app.models.models import User, ManualApp, Aircraft
from app.api.deps import get_current_user, get_current_admin
from app.services.nginx_manager import nginx_manager
import re
import requests

router = APIRouter()

def create_slug(name: str) -> str:
    """Create URL-friendly slug from name"""
    slug = name.lower()
    slug = re.sub(r'[^a-z0-9]+', '-', slug)
    slug = slug.strip('-')
    return slug

@router.get("/", response_model=List[ManualAppWithAircraft])
def list_manual_apps(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    apps = db.query(ManualApp).all()
    return apps

@router.get("/aircraft/{aircraft_id}", response_model=List[ManualAppResponse])
def list_manual_apps_by_aircraft(
    aircraft_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    apps = db.query(ManualApp).filter(ManualApp.aircraft_id == aircraft_id).all()
    return apps

@router.get("/{app_id}", response_model=ManualAppWithAircraft)
def get_manual_app(
    app_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    app = db.query(ManualApp).filter(ManualApp.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Manual app not found")
    return app

@router.post("/", response_model=ManualAppResponse, status_code=status.HTTP_201_CREATED)
def create_manual_app(
    app_data: ManualAppCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    # Verify aircraft exists
    aircraft = db.query(Aircraft).filter(Aircraft.id == app_data.aircraft_id).first()
    if not aircraft:
        raise HTTPException(status_code=404, detail="Aircraft not found")
    
    # Generate URL path
    customer_slug = aircraft.customer.slug
    aircraft_slug = aircraft.slug
    manual_slug = create_slug(app_data.title)
    url_path = f"/manuals/{customer_slug}/{aircraft_slug}/{manual_slug}/"
    
    # Check if URL path already exists
    existing = db.query(ManualApp).filter(ManualApp.url_path == url_path).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail=f"Manual app with similar title already exists"
        )
    
    manual_app = ManualApp(
        title=app_data.title,
        backend_port=app_data.backend_port,
        backend_host=app_data.backend_host,
        aircraft_id=app_data.aircraft_id,
        url_path=url_path,
        is_active=True
    )
    db.add(manual_app)
    db.commit()
    db.refresh(manual_app)
    
    # Update nginx configuration
    all_apps = db.query(ManualApp).filter(ManualApp.is_active == True).all()
    success, message = nginx_manager.update_nginx(all_apps)
    
    if not success:
        # Log warning but don't fail the request
        print(f"Warning: Nginx update failed: {message}")
    
    return manual_app

@router.put("/{app_id}", response_model=ManualAppResponse)
def update_manual_app(
    app_id: int,
    app_data: ManualAppUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    manual_app = db.query(ManualApp).filter(ManualApp.id == app_id).first()
    if not manual_app:
        raise HTTPException(status_code=404, detail="Manual app not found")
    
    if app_data.title:
        manual_app.title = app_data.title
        # Regenerate URL path
        aircraft = manual_app.aircraft
        customer_slug = aircraft.customer.slug
        aircraft_slug = aircraft.slug
        manual_slug = create_slug(app_data.title)
        manual_app.url_path = f"/manuals/{customer_slug}/{aircraft_slug}/{manual_slug}/"
    
    if app_data.backend_port:
        manual_app.backend_port = app_data.backend_port
    
    if app_data.backend_host:
        manual_app.backend_host = app_data.backend_host
    
    if app_data.is_active is not None:
        manual_app.is_active = app_data.is_active
    
    db.commit()
    db.refresh(manual_app)
    
    # Update nginx configuration
    all_apps = db.query(ManualApp).filter(ManualApp.is_active == True).all()
    nginx_manager.update_nginx(all_apps)
    
    return manual_app

@router.delete("/{app_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_manual_app(
    app_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    manual_app = db.query(ManualApp).filter(ManualApp.id == app_id).first()
    if not manual_app:
        raise HTTPException(status_code=404, detail="Manual app not found")
    
    db.delete(manual_app)
    db.commit()
    
    # Update nginx configuration
    all_apps = db.query(ManualApp).filter(ManualApp.is_active == True).all()
    nginx_manager.update_nginx(all_apps)
    
    return None

@router.get("/{app_id}/test")
def test_manual_app(
    app_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    manual_app = db.query(ManualApp).filter(ManualApp.id == app_id).first()
    if not manual_app:
        raise HTTPException(status_code=404, detail="Manual app not found")
    
    try:
        test_url = f"http://{manual_app.backend_host}:{manual_app.backend_port}"
        response = requests.get(test_url, timeout=5)
        return {
            "success": True,
            "status_code": response.status_code,
            "message": "Backend is reachable"
        }
    except Exception as e:
        return {
            "success": False,
            "message": str(e)
        }

@router.post("/nginx/reload", response_model=NginxReloadResponse)
def reload_nginx_config(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    all_apps = db.query(ManualApp).filter(ManualApp.is_active == True).all()
    success, message = nginx_manager.update_nginx(all_apps)
    return {"success": success, "message": message}
