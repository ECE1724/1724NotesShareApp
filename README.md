# 1724NotesShareApp

## How to set up backend
To run the backend first naviaget to backend folder by `cd backend` then run `npm install` to install required packages. Make sure there is .env file under backend include environmente virables. then run `npx prisma generate`, `npx prisma migrate dev` to set up da schema, then run `npx prisma db seed` to import seed data. Run `npm run dev` to start backend on port 3000.