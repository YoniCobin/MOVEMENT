import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // Fetch bookings that need 24h reminder
  const { data: bookings } = await supabase
    .from('bookings')
    .select('id, users(name, phone), lessons(title, date, start_time, location)')
    .eq('status', 'confirmed')
    .is('reminder_sent_at', null)

  const now = new Date()
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000)

  let sent = 0
  for (const booking of bookings ?? []) {
    const lesson = (booking as Record<string, unknown>).lessons as { title: string; date: string; start_time: string; location: string }
    const lessonTime = new Date(`${lesson.date}T${lesson.start_time}`)

    if (lessonTime > now && lessonTime <= in24h) {
      const student = (booking as Record<string, unknown>).users as { name: string; phone: string }
      const phone = student.phone.replace(/\D/g, '').replace(/^0/, '972')

      await fetch('https://api.inforu.co.il/SendMessageXml.ashx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          InforuXML: `<?xml version="1.0" encoding="UTF-8"?>
<Inforu>
  <User>
    <Username>${Deno.env.get('INFORU_USERNAME')}</Username>
    <ApiToken>${Deno.env.get('INFORU_API_TOKEN')}</ApiToken>
  </User>
  <Content Type="sms">
    <Message>שלום ${student.name}! תזכורת: שיעור "${lesson.title}" מחר ב-${lesson.start_time.slice(0,5)} ב-${lesson.location}</Message>
  </Content>
  <Recipients><PhoneNumber>${phone}</PhoneNumber></Recipients>
  <Settings><Sender>${Deno.env.get('INFORU_SENDER_ID')}</Sender></Settings>
</Inforu>`,
        }),
      })

      await supabase
        .from('bookings')
        .update({ reminder_sent_at: new Date().toISOString() })
        .eq('id', booking.id)

      sent++
    }
  }

  return new Response(JSON.stringify({ ok: true, sent }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
