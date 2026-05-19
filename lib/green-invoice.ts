import crypto from 'crypto'

const BASE_URL = 'https://api.greeninvoice.co.il/api/v1'

interface CreatePaymentFormOptions {
  bookingId: string
  studentName: string
  studentEmail: string
  studentPhone: string
  lessonTitle: string
  amount: number
  successUrl: string
  failureUrl: string
}

export async function createPaymentForm(options: CreatePaymentFormOptions) {
  const token = await getAccessToken()

  const response = await fetch(`${BASE_URL}/payments/form`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      description: options.lessonTitle,
      currency: 'ILS',
      income: [
        {
          description: options.lessonTitle,
          quantity: 1,
          price: options.amount,
          currency: 'ILS',
        },
      ],
      client: {
        name: options.studentName,
        emails: [options.studentEmail],
        phone: options.studentPhone,
      },
      successUrl: options.successUrl,
      failureUrl: options.failureUrl,
      custom: options.bookingId,
    }),
  })

  if (!response.ok) {
    const err = await response.json()
    throw new Error(`Green Invoice error: ${JSON.stringify(err)}`)
  }

  const data = await response.json()
  return data as { url: string; id: string }
}

async function getAccessToken(): Promise<string> {
  const response = await fetch(`${BASE_URL}/account/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: process.env.GREEN_INVOICE_API_KEY,
      secret: process.env.GREEN_INVOICE_API_SECRET,
    }),
  })

  if (!response.ok) throw new Error('Failed to get Green Invoice token')
  const data = await response.json()
  return data.token
}

export function verifyWebhookSignature(payload: string, signature: string): boolean {
  const expected = crypto
    .createHmac('sha256', process.env.GREEN_INVOICE_WEBHOOK_SECRET!)
    .update(payload)
    .digest('hex')
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
}
