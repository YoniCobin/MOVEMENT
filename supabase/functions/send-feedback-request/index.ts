import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const now = new Date()
  const { data: bookings } = await supabase
    .from('bookings')
    .select('id, users(name, phone), lessons(title, date, start_time, duration_min)')
    .in('status', ['confirmed', 'attended'])
    .is('feedback_request_sent_at', null)

  let sent = 0
  for (const booking of bookings ?? []) {
    const lesson = (booking as Record<string, unknown>).lessons as { title: string; date: string; start_time: string; duration_min: number }
    const endTime = new Date(`${lesson.date}T${lesson.start_time}`)
    endTime.setMinutes(endTime.getMinutes() + lesson.duration_min + 180)

    if (now >= endTime) {
      const student = (booking as Record<string, unknown>).users as { name: string; phone: string }
      const phone = student.phone.replace(/\D/g, '').replace(/^0/, '972')
      const origin = Deno.env.get('NEXT_PUBLIC_APP_URL') ?? ''

      await fetch('https://api.inforu.co.il/SendMessageXml.ashx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          InforuXML: `<?xml version="1.0" encoding="UTF-8"?>
<Inforu>
  <User><Username>${Deno.env.get('INFORU_USERNAME')}</Username><ApiToken>${Deno.env.get('INFORU_API_TOKEN')}</ApiToken></User>
  <Content Type="sms"><Message>שלום ${student.name}! קיוינו שהשיעור "${lesson.title}" היה נהדר 😊 נשמח לדירוג: ${origin}/feedback/${booking.id}</Message></Content>
  <Recipients><PhoneNumber>${phone}</PhoneNumber></Recipients>
  <Settings><Sender>${Deno.env.get('INFORU_SENDER_ID')}</Sender></Settings>
</Inforu>`,
        }),
      })

      await supabase
        .from('bookings')
        .update({ feedback_request_sent_at: new Date().toISOString() })
        .eq('id', booking.id)

      sent++
    }
  }

  return new Response(JSON.stringify({ ok: true, sent }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
