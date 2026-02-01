import dotenv from "dotenv";

dotenv.config();

export const JWT_SECRET = process.env.JWT_SECRET || "bhandarx_secret";  // JWT secret from .env
export const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/bhandarx";  // MongoDB URI from .env
export const PORT = process.env.PORT || 5050;  // Port from .env





// src
// ├── config
// │   └── index.ts (done)
// ├── controllers
// │   └── auth.controller.ts (done)
// ├── database
// │   └── mongodb.ts (done)
// ├── dtos
// │   └── user.dto.ts (done)
// ├── errors
// │   └── http-error.ts (done)
// ├── models
// │   └── user.model.ts (done)
// ├── repositories
// │   └── user.repository.ts (done)
// ├── routes
// │   └── auth.route.ts (done)
// ├── services
// │   └── user.service.ts (done)
// ├── types
// │   └── user.type.ts (done)
// └── index.ts.  (done)
// 
//  now give me the full code for my backend of my project BhandarX