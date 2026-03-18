# Better Auth - Quick Setup

## 1. Get Code
```bash
git checkout better-auth
git pull origin better-auth
```

## 2. Install & Setup Database
```bash
# Backend
cd backend
npm install
npx prisma migrate deploy
npx prisma db seed

# Frontend  
cd ../frontend
npm install
```

## 3. Run Servers
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev
```

## 4. Test
- Open http://localhost:5173
- Test `/auth`, `/login`, `/register`

---

**Done!** `.env` already configured. No extra setup needed.
