# BhandarX Inventory Management System - Backend

A production-ready backend API for inventory management built with Node.js, Express, and MongoDB following Clean Architecture principles.

## Architecture

This project follows Clean Architecture with clear separation of concerns:

```
src/
├── config/          # Configuration files
├── modules/         # Feature modules (Clean Architecture)
│   ├── auth/
│   ├── users/       # User Management
│   ├── products/
│   ├── categories/
│   ├── suppliers/
│   └── transactions/
├── shared/          # Shared utilities
│   ├── middleware/  # Express middleware
│   ├── utils/       # Utility functions
│   └── constants/   # Application constants
├── uploads/         # File uploads
│   ├── profiles/    # Profile images
│   ├── products/    # Product images
│   └── documents/   # Documents
└── server.js        # Application entry point
```

### Each Module Structure:
```
module/
├── dtos/           # Data Transfer Objects
├── models/         # Mongoose Models
├── repositories/   # Data Access Layer
├── services/       # Business Logic Layer
├── controllers/    # Request Handlers
└── routes.js       # API Routes
```

## Features

- ✅ User Authentication & Authorization
- ✅ User Management (CRUD operations)
- ✅ Profile Image Upload (Multer)
- ✅ Product/Inventory Management
- ✅ Product Variants (Size, Color, Attributes)
- ✅ Stock Alerts (Low Stock, Out of Stock, Expiry)
- ✅ Stock Ledger & Movement Tracking
- ✅ Inventory Valuation & Analytics
- ✅ Category Management
- ✅ Supplier Management
- ✅ Customer Management
- ✅ Sales & Invoicing
- ✅ Purchase Order Management
- ✅ Stock Transaction Tracking
- ✅ Reporting & Analytics
- ✅ Real-Time Updates (Socket.io)
- ✅ Notification System (Email, Push, WebSocket)
- ✅ Activity Logs & Audit Trail
- ✅ Role-Based Access Control (RBAC)
- ✅ Input Validation
- ✅ Error Handling
- ✅ Security Best Practices
- ✅ API Rate Limiting
- ✅ File Upload & Management
- ✅ Logging
- ✅ Comprehensive API Documentation (Swagger)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Update `.env` with your configuration

4. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

## API Documentation

The API is fully documented using **Swagger/OpenAPI 3.0**. Once the server is running, you can access the interactive API documentation at:

🔗 **http://localhost:5000/api-docs**

The documentation includes:
- 📚 All 77+ API endpoints organized by modules
- 🔐 Authentication requirements for each endpoint
- 📝 Request/Response schemas with examples
- ✅ Validation rules and error responses
- 🧪 Interactive testing interface (Try it out!)

### API Modules

- **Authentication** - Register, login, profile management, password reset
- **Users** - User management and administration
- **Products** - Product CRUD, inventory management, variants, search
- **Categories** - Hierarchical category management
- **Suppliers** - Supplier management
- **Customers** - Customer management and analytics
- **Sales** - Sales orders, invoicing, payment tracking
- **Purchases** - Purchase orders, receiving, supplier management
- **Transactions** - Stock movements and history
- **Reports** - Dashboard, analytics, trends
- **Notifications** - Notification management and delivery
- **Activity Logs** - Audit trail and system activity

### Quick Start Examples

```bash
# Register a new user
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'

# Get products (with authentication)
curl -X GET http://localhost:5000/api/v1/products \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

For detailed documentation of all endpoints, please visit the Swagger UI at `/api-docs`.

## Environment Variables

See `.env.example` for all required environment variables.

## Security Features

- Helmet.js for security headers
- CORS configuration
- Rate limiting
- MongoDB sanitization
- JWT authentication
- bcrypt password hashing
- Input validation

## License

MIT
