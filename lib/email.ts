interface SendEmailOptions {
  to: string
  subject: string
  html: string
  attachments?: Array<{ filename: string; content: string; contentType: string }>
}

export async function sendEmail({ to, subject, html, attachments }: SendEmailOptions) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL,
      to,
      subject,
      html,
      attachments,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Email send failed: ${JSON.stringify(error)}`)
  }

  return response.json()
}
