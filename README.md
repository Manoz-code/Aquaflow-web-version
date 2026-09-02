# AquaFlow — Water Supply Management System

A full-stack web application built for managing the day-to-day operations of a water supply business.

AquaFlow provides a centralized system for managing customers, deliveries, drivers, payments, users, and business reports.

## Features

* Secure JWT-based authentication
* Role-based access control
* Admin and staff functionality
* Business dashboard
* Customer management
* Customer details
* Delivery management
* Driver management
* Payment tracking
* Business reports and summaries
* User management
* Security alert management
* REST API integration
* PostgreSQL database
* Responsive React interface

## Tech Stack

### Frontend

* React
* JavaScript
* React Router
* CSS
* Vite

### Backend

* Node.js
* Express.js
* REST APIs
* JWT
* bcrypt
* Multer

### Database

* PostgreSQL
* node-postgres (`pg`)

## Project Structure

```text
aquaflow-mobile/
│
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── services/
│   └── ...
│
├── server/                 # Node.js / Express backend
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── routes/
│       └── utils/
│
└── README.md
```

## Main Application Areas

### Dashboard

Provides an overview of business activity and important operational information.

### Customers

Allows authorized users to manage customer records and view individual customer details.

### Deliveries

Provides functionality for recording and managing water deliveries.

### Payments

Tracks customer payments and payment-related information.

### Reports

Provides business summaries and reporting information to help monitor operations.

### Authentication & Authorization

The application uses JWT authentication and role-based authorization to protect application features and administrative functionality.

## Architecture

AquaFlow follows a client-server architecture:

```text
React Client
     │
     │ HTTP / REST API
     ▼
Node.js + Express Server
     │
     │ PostgreSQL queries
     ▼
PostgreSQL Database
```

## Running Locally

### 1. Clone the repository

```bash
git clone https://github.com/Manoz-code/Aquaflow-web-version.git
cd Aquaflow-web-version
```

### 2. Install backend dependencies

```bash
cd server
npm install
```

Create a `.env` file containing the required database and authentication configuration.

Example:

```env
DB_USER=your_database_user
DB_HOST=localhost
DB_NAME=your_database_name
DB_PASSWORD=your_database_password
DB_PORT=5432
JWT_SECRET=your_jwt_secret
```

Never commit `.env` or expose database credentials and JWT secrets publicly.

### 3. Start the backend

```bash
npm run dev
```

The backend runs on the configured port.

### 4. Install frontend dependencies

Open another terminal:

```bash
cd client
npm install
```

### 5. Start the frontend

```bash
npm run dev
```

Open the local URL provided by Vite in your browser.

## What I Built

This project involved developing both the frontend and backend of a business management application.

The work included:

* Designing React pages and reusable components
* Building REST API endpoints
* Connecting the application to PostgreSQL
* Implementing authentication
* Implementing role-based authorization
* Creating CRUD operations
* Building business dashboards
* Managing customer, delivery, driver, and payment workflows
* Implementing reporting functionality
* Debugging and integrating the complete client-server system

## Purpose

AquaFlow was created to provide a practical digital management system for a small water supply business, replacing fragmented manual processes with a centralized web application.

## Status

The application is currently functional as a full-stack web application and is being refined for production-quality presentation and deployment.

## Author

**Manoz**

GitHub: https://github.com/Manoz-code
