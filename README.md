# 1724NotesShareApp

## How to set up backend
To run the backend first naviaget to backend folder by `cd backend` then run `npm install` to install required packages. Make sure there is .env file under backend include environmente virables. then run `npx prisma generate`, `npx prisma migrate dev` to set up da schema, then run `npx prisma db seed` to import seed data. Run `npm run dev` to start backend on port 3000.

## How setup properly to send request to digitalocean

Create a folder backend/src/services/spaceClient.ts

Copy and Paste this into spaceClient.ts

```
import { S3Client } from "@aws-sdk/client-s3";

export const s3 = new S3Client({
endpoint: process.env.DIGITALOCEAN_BASE,
region: "tor1",
credentials: {
accessKeyId: Your accessKeyId,
secretAccessKey: Your secretAccessKey
}
});
```

In .env file, change DIGITALOCEAN_BASE to this

`DIGITALOCEAN_BASE = "https://tor1.digitaloceanspaces.com/"`

To test the endpoint of creating a file, first create a file in your project directory and run

curl -X POST http://localhost:3000/api/files -F file=@your_file_name -F courseId=course_id -F ownerId=owner_id

replace your_file_name, course_id, and owner_id with the value you want
