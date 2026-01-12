#!/bin/bash

echo "================================================"
echo "  Aircraft Manuals Manager - Quick Start"
echo "================================================"
echo ""
echo "Starting services..."
echo ""

docker-compose up -d

echo ""
echo "Waiting for services to be ready..."
sleep 10

echo ""
echo "================================================"
echo "  Services Started Successfully!"
echo "================================================"
echo ""
echo "Access the application at: http://localhost"
echo ""
echo "Default Login Credentials:"
echo "  Username: admin"
echo "  Password: admin"
echo ""
echo "To view logs:"
echo "  docker-compose logs -f"
echo ""
echo "To stop services:"
echo "  docker-compose down"
echo ""
echo "================================================"
