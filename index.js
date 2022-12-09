import mailer from 'nodemailer';
import Fastify from 'fastify';
import 'dotenv/config';

const fastify = Fastify({});

const transporter = mailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 25,
  secure: !!process.env.SMTP_SECURE,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

fastify.post('/', async (req, res) => {
  const { name, email, subject, message } = req.body;
  const data = await transporter.sendMail({
    from: `${name} <${email}>`,
    to: 'contact@krzu.me',
    subject,
    text: message
  }).catch(err => err);

  await transporter.sendMail({
    from: 'Ricardo Moreno <contact@krzu.me>',
    to: email,
    subject: 'Thank you for contacting me',
    text: `Hi ${name},\n\nThank you for contacting me. I will get back to you as soon as possible.\n\nBest regards,\n~ Ricardo.`
  }).catch(() => { });

  res.status(data.response && data.response.includes('250') ? 204 : 500).send();
});


fastify.listen({ port: process.env.PORT || 3000 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  console.log(`Mailer server started @ ${address}`);
});