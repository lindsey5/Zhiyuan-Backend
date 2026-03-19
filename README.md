## Quick install (recommended)

1. Clone repository

```bash
   git clone https://github.com/lindsey5/Zhiyuan-Backend.git
```

2. Install dependencies

```bash
   npm install
```

3. Create .env

```bash
   # Copy `.env.example` (if present) or create `.env` and set required values:
   cp .env.example .env
```

```

4. Setup database roles and user

```bash
npm run setup-roles
npm run create-user
```

5. Start the server

```bash
# development
npm run dev

# production
npm start
```
