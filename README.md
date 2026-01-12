# Aircraft Manuals Manager

A web application for managing and accessing aircraft maintenance manual applications with dynamic nginx reverse proxy configuration.

## Features

- **User Management**: Admin and regular user roles with JWT authentication
- **Customer Management**: Organize manuals by customer/airline
- **Aircraft Management**: Group manuals by aircraft type
- **Manual Apps Management**: Configure reverse proxy for web applications running on different ports
- **Dynamic Nginx Configuration**: Automatically generates and reloads nginx configuration
- **Responsive UI**: Clean, modern interface built with React

## Architecture

- **Backend**: FastAPI (Python)
- **Frontend**: React
- **Database**: PostgreSQL
- **Reverse Proxy**: Nginx
- **Containerization**: Docker & Docker Compose

## Prerequisites

- Docker
- Docker Compose
- Ports 80, 3000, 8000, and 5432 available on your host

## Quick Start

### 1. Clone or extract the project

```bash
cd aircraft-manuals-manager
```

### 2. Start the application

```bash
docker-compose up -d
```

This will:
- Start PostgreSQL database
- Start FastAPI backend (port 8000)
- Start React frontend (port 3000)
- Start Nginx reverse proxy (port 80)
- Create default admin user

### 3. Access the application

Open your browser and go to: **http://localhost**

**Default Login Credentials:**
- Username: `admin`
- Password: `admin`

**⚠️ Important**: Change the admin password after first login in production!

### 4. Check the logs

```bash
docker-compose logs -f
```

## Usage Guide

### For Regular Users

1. **Login** with your credentials
2. **Browse Customers** - See all available customers on the home page
3. **Select Aircraft** - Click on a customer to view their aircraft
4. **Access Manuals** - Click on an aircraft to see available manual applications
5. **Open Manual App** - Click on a manual to open the web application in a new tab

### For Administrators

1. **Login** as admin
2. **Go to Admin Dashboard** - Click "Admin" in the navigation
3. **Add Customers** - Create new customers/airlines
4. **Add Aircraft** - Add aircraft types for each customer
5. **Add Manual Apps** - Configure manual applications:
   - Specify the title (e.g., "Maintenance Manual")
   - Enter the backend port where the app is running (e.g., 8080)
   - Enter the backend host (default: localhost)
   - The system will automatically:
     - Generate a URL path (e.g., `/manuals/ats-aviation/boeing-737/maintenance/`)
     - Update nginx configuration
     - Reload nginx

## How It Works

### Reverse Proxy Configuration

When you add a manual app with:
- Customer: "ATS Aviation"
- Aircraft: "Boeing 737-800"
- Title: "Maintenance Manual"
- Port: 8080

The system automatically:

1. **Generates URL path**: `/manuals/ats-aviation/boeing-737-800/maintenance-manual/`
2. **Creates nginx location**: Proxies requests to `http://localhost:8080`
3. **Updates configuration**: Writes to `/etc/nginx/conf.d/manuals-proxy.conf`
4. **Reloads nginx**: Applies changes without downtime

Users can then access the manual at: `http://your-server/manuals/ats-aviation/boeing-737-800/maintenance-manual/`

### Example Manual Apps

Your manual apps can be any web application running on a port:
- Static HTML sites
- PHP applications
- Node.js/Express apps
- Python/Flask apps
- Java/Spring Boot apps
- Any HTTP server

## Project Structure

```
aircraft-manuals-manager/
├── backend/                  # FastAPI backend
│   ├── app/
│   │   ├── api/             # API routes
│   │   ├── core/            # Configuration & security
│   │   ├── models/          # Database models
│   │   ├── schemas/         # Pydantic schemas
│   │   └── services/        # Business logic (nginx manager)
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── contexts/        # React contexts (Auth)
│   │   ├── pages/           # Page components
│   │   └── services/        # API services
│   ├── Dockerfile
│   └── package.json
├── nginx/
│   └── conf.d/              # Nginx configuration files
├── docker-compose.yml        # Docker compose configuration
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` - Login and get JWT token
- `GET /api/v1/auth/me` - Get current user info

### Customers
- `GET /api/v1/customers/` - List all customers
- `POST /api/v1/customers/` - Create customer (admin only)
- `DELETE /api/v1/customers/{id}` - Delete customer (admin only)

### Aircraft
- `GET /api/v1/aircraft/` - List all aircraft
- `GET /api/v1/aircraft/customer/{customer_id}` - List aircraft by customer
- `POST /api/v1/aircraft/` - Create aircraft (admin only)
- `DELETE /api/v1/aircraft/{id}` - Delete aircraft (admin only)

### Manual Apps
- `GET /api/v1/manual-apps/` - List all manual apps
- `GET /api/v1/manual-apps/aircraft/{aircraft_id}` - List apps by aircraft
- `POST /api/v1/manual-apps/` - Create manual app (admin only)
- `PUT /api/v1/manual-apps/{id}` - Update manual app (admin only)
- `DELETE /api/v1/manual-apps/{id}` - Delete manual app (admin only)
- `GET /api/v1/manual-apps/{id}/test` - Test backend connection
- `POST /api/v1/manual-apps/nginx/reload` - Manually reload nginx

## Configuration

### Environment Variables

Edit `docker-compose.yml` to configure:

**Database:**
```yaml
POSTGRES_USER: manuals_user
POSTGRES_PASSWORD: manuals_pass
POSTGRES_DB: manuals_db
```

**Backend:**
```yaml
DATABASE_URL: postgresql://manuals_user:manuals_pass@db:5432/manuals_db
SECRET_KEY: change-this-to-a-random-secret-key-in-production
```

### Ports

Change ports in `docker-compose.yml`:
```yaml
ports:
  - "80:80"      # Nginx (main entry point)
  - "3000:3000"  # Frontend (development)
  - "8000:8000"  # Backend API
```

## Maintenance

### View Logs
```bash
docker-compose logs -f [service_name]
```

### Restart Services
```bash
docker-compose restart [service_name]
```

### Stop All Services
```bash
docker-compose down
```

### Stop and Remove Data
```bash
docker-compose down -v
```

### Backup Database
```bash
docker exec manuals-db pg_dump -U manuals_user manuals_db > backup.sql
```

### Restore Database
```bash
docker exec -i manuals-db psql -U manuals_user manuals_db < backup.sql
```

## Security Considerations

1. **Change default credentials** immediately in production
2. **Use strong SECRET_KEY** - Generate with: `openssl rand -hex 32`
3. **Use HTTPS** in production - Configure SSL certificates in nginx
4. **Restrict database access** - Don't expose port 5432 externally
5. **Regular backups** - Set up automated database backups
6. **Update dependencies** - Keep Docker images and packages updated

## Troubleshooting

### Port Already in Use
If port 80 is already in use, change it in `docker-compose.yml`:
```yaml
ports:
  - "8080:80"  # Access via http://localhost:8080
```

### Nginx Configuration Errors
Check nginx logs:
```bash
docker-compose logs nginx
```

Manually test nginx config:
```bash
docker exec manuals-nginx nginx -t
```

### Backend Not Starting
Check if database is ready:
```bash
docker-compose ps
docker-compose logs db
```

### Frontend Build Issues
Clear node_modules and rebuild:
```bash
docker-compose down
docker-compose up --build
```

## Development

### Backend Development
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend Development
```bash
cd frontend
npm install
npm start
```

## Production Deployment

For production deployment:

1. **Use production builds** for React
2. **Set proper SECRET_KEY** in environment
3. **Configure SSL/TLS** in nginx
4. **Set up database backups**
5. **Use proper logging and monitoring**
6. **Restrict admin access** by IP or VPN
7. **Consider using Docker secrets** for sensitive data

## Support

For issues or questions, check the logs and configuration files. Common issues are usually related to:
- Port conflicts
- Network connectivity between containers
- Nginx configuration syntax
- Backend port availability

## License

This project is provided as-is for managing aircraft maintenance manual applications.

---

**Built with FastAPI + React + PostgreSQL + Nginx**
