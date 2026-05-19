import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = tomorrow.toISOString().split('T')[0]

  const { data: lessons } = await supabase
    .rpc('get_lessons_with_availability')

  const lowSeatLessons = (lessons ?? []).filter(
    (l: Record<string, unknown>) => l.date === tomorrowStr && Number(l.seats_left) > 0 && Number(l.seats_left) <= 3
  )

  if (lowSeatLessons.length === 0) {
    return new Response(JSON.stringify({ ok: true, message: 'no low-seat lessons tomorrow' }))
  }

  const adminPhone = Deno.env.get('ADMIN_PHONE')
  if (!adminPhone) return new Response(JSON.stringify({ ok: true }))

  const phone = adminPhone.replace(/\D/g, '').replace(/^0/, '972')
  const summary = lowSeatLessons
    .map((l: Record<string, unknown>) => `"${l.title}" – ${l.seats_left} מקומות`)
    .join(', ')

  await fetch('https://api.inforu.co.il/SendMessageXml.ashx', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      InforuXML: `<?xml version="1.0" encoding="UTF-8"?>
<Inforu>
  <User><Username>${Deno.env.get('INFORU_USERNAME')}</Username><ApiToken>${Deno.env.get('INFORU_API_TOKEN')}</ApiToken></User>
  <Content Type="sms"><Message>שיעורים מחר עם מקומות מועטים: ${summary}</Message></Content>
  <Recipients><PhoneNumber>${phone}</PhoneNumber></Recipients>
  <Settings><Sender>${Deno.env.get('INFORU_SENDER_ID')}</Sender></Settings>
</Inforu>`,
    }),
  })

  return new Response(JSON.stringify({ ok: true, notified: lowSeatLessons.length }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
