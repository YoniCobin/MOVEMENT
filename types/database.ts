export type UserRole = 'student' | 'admin'
export type LessonLevel = 'beginner' | 'intermediate' | 'advanced'
export type LessonStatus = 'open' | 'full' | 'cancelled' | 'completed'
export type BookingStatus =
  | 'pending_payment'
  | 'confirmed'
  | 'cancelled'
  | 'attended'
  | 'no_show'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

export interface User {
  id: string
  name: string
  phone: string
  email: string | null
  role: UserRole
  created_at: string
}

export interface Lesson {
  id: string
  title: string
  description: string | null
  cover_image_url: string | null
  date: string
  start_time: string
  duration_min: number
  location: string
  location_url: string | null
  max_students: number
  price: number
  level: LessonLevel
  status: LessonStatus
  created_at: string
}

export interface LessonWithAvailability extends Lesson {
  booked_count: number
  seats_left: number
}

export interface Booking {
  id: string
  lesson_id: string
  user_id: string
  status: BookingStatus
  reminder_sent_at: string | null
  feedback_request_sent_at: string | null
  created_at: string
  cancelled_at: string | null
}

export interface BookingWithLesson extends Booking {
  lesson: Lesson
}

export interface Waitlist {
  id: string
  lesson_id: string
  user_id: string
  position: number
  notified_at: string | null
  notification_expires_at: string | null
  created_at: string
}

export interface Payment {
  id: string
  booking_id: string
  green_invoice_doc_id: string | null
  green_invoice_doc_url: string | null
  amount: number
  status: PaymentStatus
  paid_at: string | null
  refunded_at: string | null
}

export interface Feedback {
  id: string
  booking_id: string
  rating: number
  comment: string | null
  created_at: string
}

export interface WebhookEvent {
  id: string
  payload: Record<string, unknown>
  processed_at: string | null
}

export interface Database {
  public: {
    Tables: {
      users: {
        Row: User
        Insert: Omit<User, 'id' | 'created_at'>
        Update: Partial<Omit<User, 'id' | 'created_at'>>
      }
      lessons: {
        Row: Lesson
        Insert: Omit<Lesson, 'id' | 'created_at'>
        Update: Partial<Omit<Lesson, 'id' | 'created_at'>>
      }
      bookings: {
        Row: Booking
        Insert: Omit<Booking, 'id' | 'created_at'>
        Update: Partial<Omit<Booking, 'id' | 'created_at'>>
      }
      waitlist: {
        Row: Waitlist
        Insert: Omit<Waitlist, 'id' | 'created_at'>
        Update: Partial<Omit<Waitlist, 'id' | 'created_at'>>
      }
      payments: {
        Row: Payment
        Insert: Omit<Payment, 'id'>
        Update: Partial<Omit<Payment, 'id'>>
      }
      feedback: {
        Row: Feedback
        Insert: Omit<Feedback, 'id' | 'created_at'>
        Update: Partial<Omit<Feedback, 'id' | 'created_at'>>
      }
      webhook_events: {
        Row: WebhookEvent
        Insert: Omit<WebhookEvent, 'processed_at'>
        Update: Partial<WebhookEvent>
      }
    }
  }
}
