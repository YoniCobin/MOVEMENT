import { NextRequest, NextResponse } from 'next/server'
import { verifyWebhookSignature } from '@/lib/green-invoice'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendSms } from '@/lib/sms'
import { sendEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const signature = request.headers.get('x-green-invoice-signature') ?? ''

  if (!verifyWebhookSignature(rawBody, signature)) {
    return new NextResponse('Invalid signature', { status: 401 })
  }

  const payload = JSON.parse(rawBody)
  const eventId = payload.id as string
  const eventType = payload.eventType as string

  const supabase = createAdminClient()

  // Idempotency check
  const { data: existing } = await supabase
    .from('webhook_events')
    .select('id')
    .eq('id', eventId)
    .single()

  if (existing) {
    return NextResponse.json({ ok: true, skipped: true })
  }

  // Store event first
  await supabase.from('webhook_events').insert({ id: eventId, payload })

  const bookingId = payload.custom as string | undefined

  try {
    switch (eventType) {
      case 'document.paid':
        await handlePaymentPaid(supabase, bookingId!, payload)
        break
      case 'document.failed':
        await handlePaymentFailed(supabase, bookingId!, payload)
        break
      case 'document.refunded':
        await handlePaymentRefunded(supabase, bookingId!, payload)
        break
    }

    await supabase
      .from('webhook_events')
      .update({ processed_at: new Date().toISOString() })
      .eq('id', eventId)
  } catch (err) {
    console.error('Webhook processing error:', err)
    // Still return 200 to avoid retries for non-retryable errors
  }

  return NextResponse.json({ ok: true })
}

async function handlePaymentPaid(
  supabase: ReturnType<typeof createAdminClient>,
  bookingId: string,
  payload: Record<string, unknown>
) {
  // Update payment
  await supabase
    .from('payments')
    .update({
      status: 'paid',
      paid_at: new Date().toISOString(),
      green_invoice_doc_id: payload.documentId as string,
      green_invoice_doc_url: payload.documentUrl as string,
    })
    .eq('booking_id', bookingId)

  // Confirm booking
  await supabase
    .from('bookings')
    .update({ status: 'confirmed' })
    .eq('id', bookingId)

  // Fetch booking + student + lesson for notifications
  const { data: booking } = await supabase
    .from('bookings')
    .select('*, users(name, phone, email), lessons(title, date, start_time, location)')
    .eq('id', bookingId)
    .single()

  if (!booking) return

  const { users: student, lessons: lesson } = booking as Record<string, unknown> as {
    users: { name: string; phone: string; email: string }
    lessons: { title: string; date: string; start_time: string; location: string }
  }

  // SMS confirmation
  await sendSms({
    to: student.phone,
    message: `שלום ${student.name}! ההזמנה שלך לשיעור "${lesson.title}" ב-${lesson.date} אושרה. נתראה ב-${lesson.location}!`,
  })

  // Email with PDF receipt link
  if (student.email) {
    await sendEmail({
      to: student.email,
      subject: `אישור הזמנה – ${lesson.title}`,
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif">
          <h2>ההזמנה שלך אושרה!</h2>
          <p>שלום ${student.name},</p>
          <p>ההזמנה שלך לשיעור <strong>${lesson.title}</strong> ב-${lesson.date} התקבלה בהצלחה.</p>
          <p>מיקום: ${lesson.location}</p>
          <p><a href="${payload.documentUrl}">לצפייה בקבלה לחצי כאן</a></p>
        </div>
      `,
    })
  }

  // Notify admin
  if (process.env.ADMIN_PHONE) {
    await sendSms({
      to: process.env.ADMIN_PHONE,
      message: `הזמנה חדשה! ${student.name} נרשמה לשיעור "${lesson.title}" ב-${lesson.date}.`,
    })
  }
}

async function handlePaymentFailed(
  supabase: ReturnType<typeof createAdminClient>,
  bookingId: string,
  _payload: Record<string, unknown>
) {
  await supabase
    .from('payments')
    .update({ status: 'failed' })
    .eq('booking_id', bookingId)

  const { data: booking } = await supabase
    .from('bookings')
    .select('*, users(name, phone)')
    .eq('id', bookingId)
    .single()

  if (!booking) return
  const student = (booking as Record<string, unknown>).users as { name: string; phone: string }

  await sendSms({
    to: student.phone,
    message: `שלום ${student.name}, התשלום עבור ההזמנה שלך נכשל. לחצי כאן להשלמה: ${process.env.NEXT_PUBLIC_SUPABASE_URL}/book/${bookingId}`,
  })
}

async function handlePaymentRefunded(
  supabase: ReturnType<typeof createAdminClient>,
  bookingId: string,
  _payload: Record<string, unknown>
) {
  await supabase
    .from('payments')
    .update({ status: 'refunded', refunded_at: new Date().toISOString() })
    .eq('booking_id', bookingId)

  await supabase
    .from('bookings')
    .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
    .eq('id', bookingId)
}
