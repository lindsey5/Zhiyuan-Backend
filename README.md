# Zhiyuan Backend
A backend service for managing users, roles, permissions, categories, products, orders, user reviews and audit logs. Includes full Swagger API documentation, Cloudinary Integration and ZOD validation.

## Technologies:
- Node.js
- Typescript
- Express.js
- Sequelize
- SQLite
- Zod
- Cloudinary API

## Features
- User management
- Role and permission management
- Category and product management
- Order management
- Audit logs
- JWT authentication and authorization
- Full API documentation via Swagger at `/docs`
- Supports SQLite for easy setup
- Cloudinary integration for image/media uploads
- All API endpoints are validated using Zod

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
|
├── database/
│    └── migrations/ # Sequelize migration files
|          ├── 20260322171226-create-audit-logs.js
|          ├── 20260322171325-create-permissions.js
|          ├── 20260322171348-create-products.js
|          ├── 20260322171423-create-roles.js   
|          ├── 20260322171446-create-users.js
|          ├── 20260322171513-create-variants.js
|          └── 20260326092231-create-categories.js
|
│   └── models/ # Sequelize models
|          ├── AuditLog.ts
|          ├── Category.ts
|          ├── index.ts
|          ├── Permission.ts
|          ├── Product.ts
|          ├── Role.ts
|          ├── User.ts
|          └── Variant.ts
|
│   └── seeders/ # Database seed scripts
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
|    ├── automate-create-user.ts
|    ├── create-user.ts
|    └── setup-roles.ts
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
|    ├── auth.ts
|    ├── cloudinary.ts
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

## 5. Run database migrations (auto-creates database.sqlite)
```bash
npx sequelize-cli db:migrate
```

## 6. Setup database roles and initial user
```bash
npm run setup-roles
npm run create-user
```

## 7. Start the server
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

# Database
SQLITE_PATH=your_sqlite_file_path

# Cloudinary API KEYS
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Access API documentation
#### Open in browser: http://localhost:PORT/docs
