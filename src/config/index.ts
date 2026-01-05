import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT || 5050,
  mongoUri: process.env.MONGODB_URI as string,
  jwtSecret: process.env.JWT_SECRET as string,
};



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