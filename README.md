# Zhiyuan Backend
A backend service for managing users, roles, permissions, categories, products, orders, user reviews and audit logs. Built with Node.js, Typescript, Express, Sequelize, and SQLite. Includes full Swagger API documentation.

## Features

- User management
- Role and permission management
- Category and product management
- Order management
- Audit logs
- JWT authentication and authorization
- Full API documentation via Swagger at `/docs`
- Supports SQLite for easy setup

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
npm start
```

## 8. Access API documentation
#### Open in browser: http://localhost:PORT/docs
