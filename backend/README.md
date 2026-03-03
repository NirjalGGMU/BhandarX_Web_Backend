# BhandarX Backend

BhandarX Backend is the server-side API for the BhandarX Inventory Management System. It handles authentication, product and stock management, supplier and customer records, sales and purchase workflows, reporting, notifications, and system activity tracking.

This backend is designed for an inventory-based business where users need a central API to manage products, monitor stock movement, record transactions, and support role-based access across the system.

## What This Project Is Used For

This backend is built to support:

- user authentication and authorization
- inventory and stock tracking
- product, category, supplier, and customer management
- sales, purchases, and transaction history
- reports and dashboard analytics
- notifications and activity logging
- API-based integration with the frontend dashboard

## Main Backend Features

- JWT-based authentication
- role-based access control
- product and product variant management
- category management
- supplier and customer management
- purchase order management
- sales and invoice flow
- stock ledger and transaction history
- dashboard and reporting endpoints
- activity logs and audit trail
- real-time updates with Socket.IO
- email and notification support
- Swagger API documentation

## Technologies Used

### Core

- Node.js
- Express.js
- MongoDB
- Mongoose

### Security and Validation

- `jsonwebtoken` for auth tokens
- `bcryptjs` for password hashing
- `helmet` for security headers
- `cors` for cross-origin access control
- `express-validator` for request validation
- `express-rate-limit` for API throttling
- `express-mongo-sanitize` for input hardening

### File and Media Handling

- `multer` for file uploads
- `cloudinary` and `multer-storage-cloudinary` for media storage

### Documentation, Logging, and Realtime

- `swagger-jsdoc` and `swagger-ui-express` for API docs
- `winston` and `morgan` for logging
- `socket.io` for real-time updates
- `nodemailer` for email delivery

### Development Tools

- `nodemon`
- `eslint`
- `jest`
- `supertest`

## Project Structure

```text
backend/
├── scripts/                 # Utility scripts such as database seeding
├── src/
│   ├── app/                 # App setup and middleware registration
│   ├── config/              # Environment, DB, logger, swagger, uploads
│   ├── modules/             # Feature modules
│   │   ├── activityLogs/
│   │   ├── auth/
│   │   ├── categories/
│   │   ├── customers/
│   │   ├── notifications/
│   │   ├── products/
│   │   ├── purchases/
│   │   ├── reports/
│   │   ├── sales/
│   │   ├── suppliers/
│   │   ├── transactions/
│   │   └── users/
│   ├── routes/              # Root route registration
│   ├── shared/              # Shared middleware, utils, services, constants
│   └── server.js            # Entry point
├── .env.example             # Example environment variables
├── package.json
└── README.md
```

## Module Pattern

Most feature modules follow a service-oriented structure:

- `model` for MongoDB schema definition
- `dto` for input shaping
- `repository` for database access
- `service` for business logic
- `controller` for request handling
- `routes` for endpoint registration

## API Overview

The backend exposes REST APIs under:

```text
/api/v1
```

Main API areas include:

- `/auth`
- `/users`
- `/products`
- `/categories`
- `/suppliers`
- `/customers`
- `/sales`
- `/purchases`
- `/transactions`
- `/reports`
- `/notifications`
- `/activity-logs`

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create environment file

```bash
cp .env.example .env
```

Then update the values for MongoDB, JWT secrets, email settings, and port.

### 3. Run the backend

Development:

```bash
npm run dev
```

Production:

```bash
npm start
```

## Default Development URL

If you use the current local setup, the backend runs at:

```text
http://localhost:5001
```

Base API URL:

```text
http://localhost:5001/api/v1
```

## API Documentation

Swagger documentation is available at:

```text
http://localhost:5001/api-docs
```

It can be used to inspect endpoints, request payloads, responses, and auth requirements.

## Example Use Cases

- authenticate admin or employee users
- create and manage products and categories
- track stock in and stock out movements
- record purchases from suppliers
- record sales and customer activity
- generate dashboard data and reports
- audit system activity through logs

## Environment Notes

Important environment values include:

- `NODE_ENV`
- `PORT`
- `MONGODB_URI`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `CORS_ORIGIN`
- `FRONTEND_URL`

See [`.env.example`](/Users/nirjal/ims/backend/.env.example) for the full list.

## Scripts

```bash
npm run dev
npm start
npm test
npm run lint
npm run lint:fix
```

## Summary

This backend provides the full API foundation for the BhandarX system. It is built with Node.js, Express, and MongoDB, and supports the complete inventory workflow from authentication to reporting.
