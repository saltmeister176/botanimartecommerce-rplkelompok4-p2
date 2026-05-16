import nodemailer from 'nodemailer'

// Email notification
export async function sendEmailNotification({
  to,
  subject,
  message,
}: {
  to: string
  subject: string
  message: string
}) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })

  await transporter.sendMail({
    from: `"BotaniMart" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: auto;">
        <h2 style="color: #16a34a;">BotaniMart</h2>
        <p>${message}</p>
        <hr />
        <small style="color: gray;">This is an automated message from BotaniMart.</small>
      </div>
    `,
  })
}

// WhatsApp notification via Fonnte
export async function sendWhatsAppNotification({
  phone,
  message,
}: {
  phone: string
  message: string
}) {
  await fetch('https://api.fonnte.com/send', {
    method: 'POST',
    headers: {
      Authorization: process.env.FONNTE_TOKEN!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      target: phone,
      message,
    }),
  })
}