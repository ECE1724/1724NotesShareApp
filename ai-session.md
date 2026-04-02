## Session 1 (File uploading feature and storation with Digital Ocean)
 
### Prompt
 
```
How to call digitalocean api to upload file and return file url?
```
 
### AI Response
 
```
Create Spaces Client
 
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  endpoint: "https://nyc3.digitaloceanspaces.com",
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.DO_SPACES_KEY,
    secretAccessKey: process.env.DO_SPACES_SECRET
  }
});

Upload FIle API route

import multer from "multer";
import { PutObjectCommand } from "@aws-sdk/client-s3";

const upload = multer();

app.post("/upload", upload.single("file"), async (req, res) => {
  const file = req.file;

  const key = Date.now() + "-" + file.originalname;

  const command = new PutObjectCommand({
    Bucket: "your-bucket-name",
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: "public-read"
  });

  await s3.send(command);

  const fileUrl = `https://your-bucket-name.nyc3.digitaloceanspaces.com/${key}`;

  res.json({ url: fileUrl });
});

```
 
### What Your Team Did With It
 
- The AI response for uploading files to DigitalOcean and return the file URL greatly helped us setup file upload to DigitalOcean and store the file URL in Postgresql.

- When we test for the endpoint to upload a file to DigitalOcean, it shows that the endpoint did not work by using the http file in Intellij IDEA. However, although the AI suggested some possible solutions, the endpoint was still not working.

- In the end, we used the curl command in the terminal in Intellij IDEA instead of the http file to upload the file successfully. Then, we verified the file URL returned by DigitalOcean by pasting the URL in a browser and see if the correct file showed up.


## Session 2 (Diagnosing MailTrap connection)
 
### Prompt
 
```
Why the connection with MailTrap doesn't work and my backend is crushed now?
terminals/30.txt:586-613

```
 
### AI Response
 
```
The reason has been found. `nodemailer.createTransport()` is executed at the top level of `mailer.ts`, but it doesn't import `dotenv/config`...
And AI change the code:
Add line: import "dotenv/config";
```
 
### What Your Team Did With It
 
- The AI response helps us to locate the issue with the configurations of mailtrap.

- AI thinks there is a missing import issue, which is incorrect.

- We agree with the AI response that there may be some configuration problems. However, we disagree with AI’s modifications and we think the most likely issue is because of the .env file: the added configurations are not executed properly. We save the file again and restart the IDE, and then it works.