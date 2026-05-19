import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MOVEMENT – שיעורי ריקוד',
  description: 'הזמינו מקום בשיעורי ריקוד – קטלוג שיעורים, הזמנה ותשלום מקוון',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="he" dir="rtl" className="h-full">
      <body className="min-h-full flex flex-col antialiased font-sans">
        {children}
      </body>
    </html>
  )
}
