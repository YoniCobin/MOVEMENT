import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  const { count } = await supabase
    .from('bookings')
    .update({ status: 'no_show' })
    .eq('status', 'confirmed')
    .lt('lessons.date', cutoff)

  return new Response(JSON.stringify({ ok: true, updated: count }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
