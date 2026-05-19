import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email'

// Scheduled via vercel.json: "0 8 * * 0" (Sunday 08:00)
export async function GET() {
  const supabase = createAdminClient()

  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const weekAgoStr = weekAgo.toISOString().split('T')[0]
  const todayStr = new Date().toISOString().split('T')[0]

  // Revenue this week
  const { data: payments } = await supabase
    .from('payments')
    .select('amount, paid_at, bookings(lessons(title, date))')
    .eq('status', 'paid')
    .gte('paid_at', weekAgo.toISOString())

  const totalRevenue = payments?.reduce((sum, p) => sum + Number(p.amount), 0) ?? 0

  // Cancellations this week
  const { count: cancellations } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'cancelled')
    .gte('cancelled_at', weekAgo.toISOString())

  // Upcoming lessons next week
  const nextWeek = new Date()
  nextWeek.setDate(nextWeek.getDate() + 7)
  const { data: upcomingLessons } = await supabase
    .from('lessons')
    .select('*, bookings(count)')
    .in('status', ['open', 'full'])
    .gte('date', todayStr)
    .lte('date', nextWeek.toISOString().split('T')[0])
    .order('date')

  const upcomingHtml = upcomingLessons
    ?.map(
      (l) =>
        `<tr>
          <td>${l.title}</td>
          <td>${l.date}</td>
          <td>${((l as Record<string, unknown>).bookings as unknown[] | null)?.length ?? 0}/${l.max_students}</td>
          <td>₪${Number(l.price).toLocaleString('he-IL')}</td>
        </tr>`
    )
    .join('') ?? ''

  const adminEmails = process.env.ADMIN_EMAIL
  if (!adminEmails) return NextResponse.json({ ok: true, skipped: true })

  await sendEmail({
    to: adminEmails,
    subject: `סיכום שבועי MOVEMENT – ${weekAgoStr} עד ${todayStr}`,
    html: `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px">
        <h2>סיכום שבועי – MOVEMENT</h2>
        <p><strong>הכנסות השבוע:</strong> ₪${totalRevenue.toLocaleString('he-IL')}</p>
        <p><strong>ביטולים:</strong> ${cancellations ?? 0}</p>
        <h3>שיעורים קרובים:</h3>
        <table border="1" cellpadding="8" style="border-collapse:collapse;width:100%">
          <thead>
            <tr>
              <th>שם שיעור</th><th>תאריך</th><th>נרשמים</th><th>מחיר</th>
            </tr>
          </thead>
          <tbody>${upcomingHtml}</tbody>
        </table>
      </div>
    `,
  })

  return NextResponse.json({ ok: true, revenue: totalRevenue })
}
