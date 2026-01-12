from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

# User Schemas
class UserBase(BaseModel):
    username: str
    email: EmailStr
    role: str = "user"

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    username: Optional[str] = None

# Customer Schemas
class CustomerBase(BaseModel):
    name: str

class CustomerCreate(CustomerBase):
    pass

class CustomerUpdate(BaseModel):
    name: Optional[str] = None

class CustomerResponse(CustomerBase):
    id: int
    slug: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# Aircraft Schemas
class AircraftBase(BaseModel):
    name: str
    customer_id: int

class AircraftCreate(AircraftBase):
    pass

class AircraftUpdate(BaseModel):
    name: Optional[str] = None

class AircraftResponse(AircraftBase):
    id: int
    slug: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class AircraftWithCustomer(AircraftResponse):
    customer: CustomerResponse

# Manual App Schemas
class ManualAppBase(BaseModel):
    title: str
    backend_port: int = Field(..., ge=1024, le=65535)
    backend_host: str = "localhost"
    aircraft_id: int

class ManualAppCreate(ManualAppBase):
    pass

class ManualAppUpdate(BaseModel):
    title: Optional[str] = None
    backend_port: Optional[int] = Field(None, ge=1024, le=65535)
    backend_host: Optional[str] = None
    is_active: Optional[bool] = None

class ManualAppResponse(ManualAppBase):
    id: int
    url_path: str
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class ManualAppWithAircraft(ManualAppResponse):
    aircraft: AircraftWithCustomer

# Login Schema
class LoginRequest(BaseModel):
    username: str
    password: str

# Nginx Reload Response
class NginxReloadResponse(BaseModel):
    success: bool
    message: str
