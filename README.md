# OnRuf Central Control Panel (Scaffold)

This is an initial scaffold for the OnRuf Central Control Panel composed of:

- Backend: Express + TypeScript + Prisma (PostgreSQL)
- Frontend: Next.js 14 (App Router) + React 18

## Requirements (Assumed)
Because the BRD `.docx` file content couldn't be parsed in this environment, the following assumptions were made:
- User & Role Management (Admin assigns roles)
- Authentication (email/password, JWT access/refresh)
- Multi-tenant or organizational accounts (to be added)
- Audit logging, basic analytics (future)
- Module areas: Users, Accounts/Organizations, Packages/Plans, Billing, Reports Dashboard

Please replace or expand these once you provide the actual BRD text excerpts.

## Backend
Location: `admin-panel/backend`

### Env Vars
```
PORT=4000
DATABASE_URL=postgresql://user:pass@localhost:5432/onruf
JWT_SECRET=change-me
CORS_ORIGIN=http://localhost:3000
```

### Commands
```
npm install
npm run prisma:generate
npm run dev
```

### Prisma
Edit `prisma/schema.prisma` then run migrations:
```
npm run prisma:migrate -- --name init
```

## Frontend
Location: `admin-panel/frontend`
```
npm install
npm run dev
```
Visit: http://localhost:3000

## Roadmap
1. Flesh out real domain entities from BRD
2. Add Role/Permission tables & middleware
3. Implement Organizations & user membership
4. Add auditing (request log + domain events)
5. Build UI modules (Users, Orgs, Billing, Reports)
6. Add e2e & integration tests, CI

## Contributing
Open an issue with real BRD sections to adjust data model.
