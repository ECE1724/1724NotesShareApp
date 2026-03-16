import { S3Client } from "@aws-sdk/client-s3";

export const s3 = new S3Client({
  endpoint: process.env.DIGITALOCEAN_BASE,
  region: process.env.DIGITALOCEAN_REGION || "tor1",
  credentials: {
    accessKeyId: process.env.DIGITALOCEAN_KEY || "",
    secretAccessKey: process.env.DIGITALOCEAN_SECRET || "",
  },
});
