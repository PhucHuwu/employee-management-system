# Employee Management System

Full-stack employee management system with NestJS backend, Next.js frontend, PostgreSQL, and Prisma.

## Tech Stack
- Backend: NestJS + TypeScript
- Frontend: Next.js (App Router) + React
- Database: PostgreSQL
- ORM: Prisma

## Prerequisites
- Node.js 20+
- npm
- Docker Desktop (for PostgreSQL/MinIO)

## Run Locally

### 1) Start infrastructure
From project root:

```bash
docker compose up -d postgres
```

Optional (if you want S3-compatible document storage):

```bash
docker compose up -d minio
```

### 2) Configure backend environment
Create `.env` from `.env.example` at project root.

Example values:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/employee_management_system?schema=public
FRONTEND_URL=http://localhost:3001
JWT_SECRET=replace-with-strong-secret
JWT_EXPIRES_IN=1h

STORAGE_DRIVER=local
```

If port `5432` is already used on your machine, change `DATABASE_URL` accordingly.

### 3) Install backend dependencies

```bash
npm install
```

### 4) Prepare database

```bash
npm run prisma:generate
npx prisma db push --force-reset
npm run db:seed
```

### 5) Start backend

```bash
npm run start:dev
```

Backend base URL: `http://localhost:3000/api`

CORS origin for frontend is configured by `FRONTEND_URL`.

Health check: `GET http://localhost:3000/api/health`

### 6) Configure and start frontend
Open a new terminal:

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

Run frontend:

```bash
npm run dev -- --port 3001
```

Frontend URL: `http://localhost:3001`

## Default Seed Accounts
- Admin: `admin@ems.local` / `admin123`
- Engineering Manager: `manager.engineering@ems.local` / `manager123`
- Business Manager: `manager.business@ems.local` / `manager123`

## Useful Commands
- Regenerate Prisma client: `npm run prisma:generate`
- Open Prisma Studio: `npm run prisma:studio`
- Reseed database: `npm run db:seed`

## Documentation
- `docs/project.md`
- `docs/system-analysis-design.md`
- `docs/frontend-implementation-plan.md`
