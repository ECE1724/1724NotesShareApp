import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS,
    },
});

async function sendTestEmail(reciever: any, title: any, content: any) {
  await transporter.sendMail({
    from: '"Note for All" <no-reply@note4all.com>',
    to: reciever,
    subject: title,
    text: content,
  });
}

export default sendTestEmail;
