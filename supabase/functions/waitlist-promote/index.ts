import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const { waitlist_id, lesson_id, user_id } = await req.json()
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const { data: entry } = await supabase
    .from('waitlist')
    .select('*, users(name, phone), lessons(title, date, start_time, price)')
    .eq('id', waitlist_id)
    .single()

  if (!entry) return new Response('Not found', { status: 404 })

  const student = (entry as Record<string, unknown>).users as { name: string; phone: string }
  const lesson = (entry as Record<string, unknown>).lessons as { title: string; date: string; start_time: string; price: number }

  const origin = Deno.env.get('NEXT_PUBLIC_APP_URL') ?? ''
  const paymentUrl = `${origin}/book/${lesson_id}?waitlist=${waitlist_id}`

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
    <Message>שלום ${student.name}! התפנה מקום בשיעור "${lesson.title}" ב-${lesson.date}. יש לך 12 שעות להשלים את ההרשמה: ${paymentUrl}</Message>
  </Content>
  <Recipients><PhoneNumber>${phone}</PhoneNumber></Recipients>
  <Settings><Sender>${Deno.env.get('INFORU_SENDER_ID')}</Sender></Settings>
</Inforu>`,
    }),
  })

  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
