'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

function PaymentReturnContent() {
  const searchParams = useSearchParams()
  const bookingId = searchParams.get('bookingId')
  const urlStatus = searchParams.get('status')
  const [status, setStatus] = useState<'loading' | 'confirmed' | 'failed'>(
    urlStatus === 'failed' ? 'failed' : 'loading'
  )
  const supabase = createClient()

  useEffect(() => {
    if (!bookingId || urlStatus === 'failed') return

    let attempts = 0
    const poll = setInterval(async () => {
      attempts++
      const { data } = await supabase
        .from('bookings')
        .select('status')
        .eq('id', bookingId)
        .single()

      if (data?.status === 'confirmed') {
        setStatus('confirmed')
        clearInterval(poll)
      } else if (attempts >= 15) {
        clearInterval(poll)
      }
    }, 2000)

    return () => clearInterval(poll)
  }, [bookingId, urlStatus])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-5xl mb-4">⏳</div>
          <p className="text-muted-foreground">מאמתים את התשלום...</p>
        </div>
      </div>
    )
  }

  if (status === 'confirmed') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-sm px-4">
          <div className="text-6xl mb-6">🎉</div>
          <h1 className="text-2xl font-bold mb-3">ההזמנה אושרה!</h1>
          <p className="text-muted-foreground mb-8">
            שלחנו לך SMS ומייל עם פרטי ההזמנה. נתראה בשיעור!
          </p>
          <div className="flex flex-col gap-3">
            <Button asChild><Link href="/me/bookings">ההזמנות שלי</Link></Button>
            <Button asChild variant="outline"><Link href="/lessons">לשיעורים נוספים</Link></Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-sm px-4">
        <div className="text-6xl mb-6">😕</div>
        <h1 className="text-2xl font-bold mb-3">התשלום לא הצליח</h1>
        <p className="text-muted-foreground mb-8">
          לא חויבת. תוכלי לנסות שוב או לפנות אלינו.
        </p>
        <div className="flex flex-col gap-3">
          <Button asChild><Link href="/lessons">חזרה לשיעורים</Link></Button>
        </div>
      </div>
    </div>
  )
}

export default function PaymentReturnPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-5xl mb-4">⏳</div>
          <p className="text-muted-foreground">טוען...</p>
        </div>
      </div>
    }>
      <PaymentReturnContent />
    </Suspense>
  )
}
