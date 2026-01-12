from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.schemas.schemas import AircraftCreate, AircraftUpdate, AircraftResponse, AircraftWithCustomer
from app.models.models import User, Aircraft, Customer
from app.api.deps import get_current_user, get_current_admin
import re

router = APIRouter()

def create_slug(name: str) -> str:
    """Create URL-friendly slug from name"""
    slug = name.lower()
    slug = re.sub(r'[^a-z0-9]+', '-', slug)
    slug = slug.strip('-')
    return slug

@router.get("/", response_model=List[AircraftWithCustomer])
def list_aircraft(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    aircraft = db.query(Aircraft).all()
    return aircraft

@router.get("/customer/{customer_id}", response_model=List[AircraftResponse])
def list_aircraft_by_customer(
    customer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    aircraft = db.query(Aircraft).filter(Aircraft.customer_id == customer_id).all()
    return aircraft

@router.get("/{aircraft_id}", response_model=AircraftWithCustomer)
def get_aircraft(
    aircraft_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    aircraft = db.query(Aircraft).filter(Aircraft.id == aircraft_id).first()
    if not aircraft:
        raise HTTPException(status_code=404, detail="Aircraft not found")
    return aircraft

@router.post("/", response_model=AircraftResponse, status_code=status.HTTP_201_CREATED)
def create_aircraft(
    aircraft_data: AircraftCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    # Verify customer exists
    customer = db.query(Customer).filter(Customer.id == aircraft_data.customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    slug = create_slug(aircraft_data.name)
    
    # Check if slug already exists for this customer
    existing = db.query(Aircraft).filter(
        Aircraft.customer_id == aircraft_data.customer_id,
        Aircraft.slug == slug
    ).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail=f"Aircraft with similar name already exists for this customer"
        )
    
    aircraft = Aircraft(
        name=aircraft_data.name,
        slug=slug,
        customer_id=aircraft_data.customer_id
    )
    db.add(aircraft)
    db.commit()
    db.refresh(aircraft)
    return aircraft

@router.put("/{aircraft_id}", response_model=AircraftResponse)
def update_aircraft(
    aircraft_id: int,
    aircraft_data: AircraftUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    aircraft = db.query(Aircraft).filter(Aircraft.id == aircraft_id).first()
    if not aircraft:
        raise HTTPException(status_code=404, detail="Aircraft not found")
    
    if aircraft_data.name:
        aircraft.name = aircraft_data.name
        aircraft.slug = create_slug(aircraft_data.name)
    
    db.commit()
    db.refresh(aircraft)
    return aircraft

@router.delete("/{aircraft_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_aircraft(
    aircraft_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    aircraft = db.query(Aircraft).filter(Aircraft.id == aircraft_id).first()
    if not aircraft:
        raise HTTPException(status_code=404, detail="Aircraft not found")
    
    db.delete(aircraft)
    db.commit()
    return None
