#!/bin/bash

# Backend package installation
if [ ! -d "backend/node_modules" ]; then
    echo "Installing backend packages..."
    cd backend
    npm install
    cd ..
fi

# Frontend package installation
if [ ! -d "frontend/node_modules" ]; then
    echo "Installing frontend packages..."
    cd frontend
    npm install
    cd ..
fi