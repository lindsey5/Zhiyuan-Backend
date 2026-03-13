## Quick install (recommended)

1. Clone repository

```bash
git clone https://github.com/lindsey5/Zhiyuan-Backend
```

2. Install dependencies (pnpm recommended)

```bash
npm install
```

3. Create .env
   Copy `.env.example` (if present) or create `.env` and set required values:

```bash
cp .env.example .env
```

4. Setup database
```bash
   Create `database.sqlite` file
```

6. Setup database roles and user

```bash
npm run setup-roles
npm run create-user
```

6. Start the server

```bash
# development
npm run dev

# production
npm start
```
