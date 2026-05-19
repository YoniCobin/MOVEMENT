import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createPaymentForm } from '@/lib/green-invoice'
import { z } from 'zod'

const bookingSchema = z.object({
  lessonId: z.string().uuid(),
  name: z.string().min(2),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().min(9),
})

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const parsed = bookingSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { lessonId, name, email, phone } = parsed.data
  const admin = createAdminClient()

  // Upsert user profile
  await admin.from('users').upsert({
    id: user.id,
    name,
    phone,
    email: email || null,
    role: 'student',
  })

  // Fetch lesson details for payment
  const { data: lesson, error: lessonError } = await admin
    .from('lessons')
    .select('*')
    .eq('id', lessonId)
    .single()

  if (lessonError || !lesson) {
    return NextResponse.json({ error: 'שיעור לא נמצא' }, { status: 404 })
  }

  if (lesson.status === 'cancelled') {
    return NextResponse.json({ error: 'השיעור בוטל' }, { status: 400 })
  }

  // Create booking with RPC (handles race conditions + waitlist)
  const { data: rpcResult, error: rpcError } = await admin.rpc('create_booking', {
    p_lesson_id: lessonId,
    p_user_id: user.id,
  })

  if (rpcError) {
    return NextResponse.json({ error: 'שגיאה ביצירת ההזמנה' }, { status: 500 })
  }

  const { booking_id: bookingId, result_status: resultStatus } = rpcResult[0]

  if (resultStatus === 'waitlisted') {
    return NextResponse.json({ status: 'waitlisted' })
  }

  // Create payment record
  await admin.from('payments').insert({
    booking_id: bookingId,
    amount: lesson.price,
    status: 'pending',
  })

  // Generate Green Invoice payment URL
  const origin = request.headers.get('origin') ?? process.env.NEXT_PUBLIC_APP_URL ?? ''
  const paymentForm = await createPaymentForm({
    bookingId,
    studentName: name,
    studentEmail: email || '',
    studentPhone: phone,
    lessonTitle: lesson.title,
    amount: lesson.price,
    successUrl: `${origin}/payment/return?bookingId=${bookingId}&status=success`,
    failureUrl: `${origin}/payment/return?bookingId=${bookingId}&status=failed`,
  })

  return NextResponse.json({
    status: 'pending_payment',
    bookingId,
    paymentUrl: paymentForm.url,
  })
}
