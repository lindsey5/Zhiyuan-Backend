# Zhiyuan Backend
A backend service for managing users, roles, permissions, categories, products, orders and more. Includes full Swagger API documentation, Cloudinary Integration and ZOD validation.

## Technologies:
- Node.js
- Typescript
- Express.js
- Mongoose (MongoDB)
- Zod
- Cloudinary API

## Features
- User management
- Role and permission management
- Audit logs
- JWT authentication and authorization
- Full API documentation via Swagger at `/docs`
- Cloudinary integration for image/media uploads
- All API endpoints are validated using Zod

## NPM Scripts

This project includes useful scripts for development, production build, database setup, and automation.
```bash
    "dev": "cross-env NODE_ENV=development nodemon --watch . --exec ts-node server.ts",
    "build": "npm install && ts-node scripts/setup-roles.ts && ts-node scripts/automate-create-user.ts && ts-node scripts/insert-products.ts && tsc",
    "start": "cross-env NODE_ENV=production node dist/server.js",
    "setup-roles": "ts-node scripts/setup-roles.ts",
    "create-user": "ts-node scripts/create-user.ts",
    "insert-products": "ts-node scripts/insert-products.ts",
    "automate-create-user": "ts-node scripts/automate-create-user.ts"
```

## Script Descriptions
```bash
npm run dev #Runs the backend in development mode.
```

```bash
npm run build # Builds the project for production. It installs dependencies, sets up roles, creates the default admin user, inserts demo products, and compiles TypeScript.
```
```bash
npm start # Starts the backend server in production mode using the compiled output in dist/.
```

```bash
npm run setup-roles # Creates default roles and permissions.
```
    
```bash
npm run create-user # Creates a user manually via terminal input.

    # Add these to your .env file:
    FIRSTNAME=user_firstname
    LASTNAME=user_lastname
    EMAIL=user_email
    PASSWORD=user_password
```
    
```bash
npm run automate-create-user # Automatically creates the default admin user.
```
    
```bash
npm run insert-products # Inserts demo products into the database.
```

## File Structure
```bash
├── config/ # Configuration files
|    ├── cloudinaryConfig.ts
|    ├── config.js
|    ├── db.ts
│    └── swagger.ts
|
├── controllers/ # Route controllers
|    ├── auditController.ts
|    ├── authController.ts
|    ├── categoryController.ts
|    ├── productController.ts
|    ├── roleController.ts
|    ├── userController.ts
|    └── variantController.ts
├── models/ # Mongoose models
|    ├── AuditLog.ts
|    ├── Category.ts
|    ├── index.ts
|    ├── Permission.ts
|    ├── Product.ts
|    ├── Role.ts
|    ├── User.ts
|    └── Variant.ts
|
├── docs/
│   └── paths/ # Swagger path definitions
|          ├── audit.docs.ts
|          ├── auth.docs.ts
|          ├── category.docs.ts
|          ├── product.docs.ts
|          ├── role.docs.ts
|          └── user.docs
|
│   └── schemas/ # Swagger schema definitions
|          ├── audit.schema.ts
|          ├── auth.schema.ts
|          ├── category.schema.ts
|          ├── product.schema.ts
|          ├── role.schema.ts
|          └── user.schema.ts
|
├── middlewares/ # Custom middlewares
|    ├── authMiddleware.ts
|    ├── errorHandler.ts
|    ├── multer.ts
|    └── validateBody.ts
|
├── routes/ # API route definitions
|    ├── auditRoutes.ts
|    ├── authRoutes.ts
|    ├── categoryRoutes.ts
|    ├── productRoutes.ts
|    ├── roleRoutes.ts
|    ├── userRoutes.ts
|    └── variantRoutes.ts
|
├── schema/ # Zod validation schemas
|    ├── categorySchema.ts
|    ├── loginSchema.ts
|    ├── productSchema.ts
|    ├── roleSchema.ts
|    └── userSchema.ts
|
├── scripts/ # Utility scripts
|    ├── automate-create-user.ts  # Automatically creates the default admin user
|    ├── create-user.ts           # Creates a user manually via terminal input (interactive)
|    ├── insert-products.ts       # Inserts demo/sample products into the database
|    └── setup-roles.ts           # Creates default roles and permissions required by the system
|
├── services/ # Business logic / service layer
|    └── AuditLogService.ts
|
├── types/ # TypeScript type definitions
|    ├── auth.ts
|    ├── image.ts
|    └── model-attributes.ts
|
└── utils/ # Helper functions
|    ├── auth.ts         # JWT helper functions
|    ├── cloudinary.ts   # Cloudinary utility functions (upload and delete helpers)
|    ├── permissions.ts  
|    └── roles.ts        
```

## Quick Install (Recommended)

## 1. Clone the repository
```bash
git clone https://github.com/lindsey5/Zhiyuan-Backend.git
```

## 2. Install dependencies
```bash
npm install
```

## 3. Create .env file
```bash
cp .env.example .env
```

## 4. Setup database roles and initial user
```bash
npm run setup-roles
npm run create-user
```

## 5. Start the server
```bash
# For development
npm run dev

# For production
npm build
npm start
```

## Environment Variables
```bash
PORT=3000

# JWT SECRET KEYS
JWT_ACCESS_SECRET=your_access_secret_key
JWT_REFRESH_SECRET=your_refresh_secret_key
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

MONGO_URI=your_mongodb_uri

# Cloudinary API KEYS
CLOUD_NAME=your_cloudinary_cloud_name_here
CLOUD_API_KEY=your_cloudinary_api_key_here
CLOUD_API_SECRET=your_cloudinary_api_secret_here
```

## Access API documentation
#### Open in browser: http://localhost:PORT/docs
