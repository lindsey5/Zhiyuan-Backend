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
- Automatically backup and restore SQLite database

## Backup Feature
The system can upload a copy of your SQLite database file to Cloudinary as a raw file.

## Restore Feature
The system can restore the database by downloading the backup file from Cloudinary and replacing the current SQLite database.

Required Environment Variables (Backup & Restore):

```bash
# SQLite DB file path
SQLITE_PATH=your_database_path_here

# Backup file name in Cloudinary
SQLITE_DB_SAVE_AS=your_backup_path_here

# Cloudinary backup reference
PUBLIC_ID=your_public_id_here
CLOUDINARY_DB_FOLDER=your_cloudinary_folder_here
```

## Automatic Backup Watcher (Optional)

If enabled, the system can automatically watch the SQLite file for changes and upload a backup.

Enable watcher:
```bash
ENABLE_WATCHER=true
```
Disable watcher:
```bash
ENABLE_WATCHER=false
```

## NPM Scripts

This project includes useful scripts for development, production build, database setup, and automation.
```bash
"scripts": {
    "dev": "cross-env NODE_ENV=development nodemon --watch . --exec ts-node server.ts",
    "build": "npm install && ts-node scripts/download-db.ts && npx sequelize-cli db:migrate && ts-node scripts/setup-roles.ts && ts-node scripts/automate-create-user.ts && ts-node scripts/insert-products.ts && tsc",
    "start": "cross-env NODE_ENV=production node dist/server.js",
    "setup-roles": "ts-node scripts/setup-roles.ts",
    "create-user": "ts-node scripts/create-user.ts",
    "insert-products": "ts-node scripts/insert-products.ts",
    "automate-create-user": "ts-node scripts/automate-create-user.ts",
    "download-backup" : "ts-node scripts/download-db.ts"
}
```

## Script Descriptions
- npm run dev

Runs the backend in development mode.
- npm run build

Builds the project for production. It installs dependencies, downloads the database backup, runs migrations, sets up roles, creates the default admin user, inserts demo products, and compiles TypeScript.

- npm start

    Starts the backend server in production mode using the compiled output in dist/.

- npm run setup-roles

    Creates default roles and permissions.

- npm run create-user

    Creates a user manually via terminal input.

    Add these to your .env file:
    ```bash
    FIRSTNAME=user_firstname
    LASTNAME=user_lastname
    EMAIL=user_email
    PASSWORD=user_password
    ```

- npm run automate-create-user

    Automatically creates the default admin user.

- npm run insert-products

    Inserts demo products into the database.
  
- npm run download-backup

    Downloads database backup from Cloudinary.
  

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
|    ├── automate-create-user.ts  # Automatically creates the default admin user (used during build/setup)
|    ├── create-user.ts           # Creates a user manually via terminal input (interactive)
|    ├── download-db.ts           # Downloads/restores the SQLite database backup from Cloudinary before server startup
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
|    ├── backup.ts       # Handles SQLite database backup
|    ├── cloudinary.ts   # Cloudinary utility functions (upload and delete helpers)
|    ├── permissions.ts  
|    ├── roles.ts        
|    └── watchDB.ts      # Watches SQLite file changes and automatically triggers database backup
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

# SQLite DB file path
SQLITE_PATH=your_database_path_here

# Backup file name in Cloudinary
SQLITE_DB_SAVE_AS=your_backup_path_here

# Cloudinary backup reference
PUBLIC_ID=your_public_id_here
CLOUDINARY_DB_FOLDER=your_cloudinary_folder_here

# Enable watcher for automatic backup and restore
ENABLE_WATCHER=true

# Cloudinary API KEYS
CLOUD_NAME=
CLOUD_API_KEY=
CLOUD_API_SECRET=
```

## Access API documentation
#### Open in browser: http://localhost:PORT/docs
