from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.schemas.schemas import CustomerCreate, CustomerUpdate, CustomerResponse
from app.models.models import User, Customer
from app.api.deps import get_current_user, get_current_admin
import re

router = APIRouter()

def create_slug(name: str) -> str:
    """Create URL-friendly slug from name"""
    slug = name.lower()
    slug = re.sub(r'[^a-z0-9]+', '-', slug)
    slug = slug.strip('-')
    return slug

@router.get("/", response_model=List[CustomerResponse])
def list_customers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    customers = db.query(Customer).all()
    return customers

@router.get("/{customer_id}", response_model=CustomerResponse)
def get_customer(
    customer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer

@router.post("/", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED)
def create_customer(
    customer_data: CustomerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    slug = create_slug(customer_data.name)
    
    # Check if slug already exists
    existing = db.query(Customer).filter(Customer.slug == slug).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail=f"Customer with similar name already exists"
        )
    
    customer = Customer(name=customer_data.name, slug=slug)
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer

@router.put("/{customer_id}", response_model=CustomerResponse)
def update_customer(
    customer_id: int,
    customer_data: CustomerUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    if customer_data.name:
        customer.name = customer_data.name
        customer.slug = create_slug(customer_data.name)
    
    db.commit()
    db.refresh(customer)
    return customer

@router.delete("/{customer_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_customer(
    customer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    db.delete(customer)
    db.commit()
    return None
