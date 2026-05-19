-- Enums
CREATE TYPE user_role AS ENUM ('student', 'admin');
CREATE TYPE lesson_level AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE lesson_status AS ENUM ('open', 'full', 'cancelled', 'completed');
CREATE TYPE booking_status AS ENUM ('pending_payment', 'confirmed', 'cancelled', 'attended', 'no_show');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');

-- Users (extends auth.users)
CREATE TABLE users (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name        text NOT NULL,
  phone       text NOT NULL UNIQUE,
  email       text,
  role        user_role NOT NULL DEFAULT 'student',
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Lessons
CREATE TABLE lessons (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title           text NOT NULL,
  description     text,
  cover_image_url text,
  date            date NOT NULL,
  start_time      time NOT NULL,
  duration_min    int NOT NULL DEFAULT 60,
  location        text NOT NULL,
  location_url    text,
  max_students    int NOT NULL DEFAULT 12,
  price           numeric(10,2) NOT NULL,
  level           lesson_level NOT NULL DEFAULT 'beginner',
  status          lesson_status NOT NULL DEFAULT 'open',
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_lessons_date ON lessons(date);
CREATE INDEX idx_lessons_status ON lessons(status);

-- Bookings
CREATE TABLE bookings (
  id                        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id                 uuid NOT NULL REFERENCES lessons(id) ON DELETE RESTRICT,
  user_id                   uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  status                    booking_status NOT NULL DEFAULT 'pending_payment',
  reminder_sent_at          timestamptz,
  feedback_request_sent_at  timestamptz,
  created_at                timestamptz NOT NULL DEFAULT now(),
  cancelled_at              timestamptz,
  CONSTRAINT unique_active_booking
    UNIQUE NULLS NOT DISTINCT (lesson_id, user_id)
    WHERE (status <> 'cancelled')
);

CREATE INDEX idx_bookings_lesson_id ON bookings(lesson_id);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_status ON bookings(status);

-- Waitlist
CREATE TABLE waitlist (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id               uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  user_id                 uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  position                int NOT NULL,
  notified_at             timestamptz,
  notification_expires_at timestamptz,
  created_at              timestamptz NOT NULL DEFAULT now(),
  UNIQUE(lesson_id, user_id)
);

CREATE INDEX idx_waitlist_lesson_id ON waitlist(lesson_id, position);

-- Payments
CREATE TABLE payments (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id              uuid NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE RESTRICT,
  green_invoice_doc_id    text,
  green_invoice_doc_url   text,
  amount                  numeric(10,2) NOT NULL,
  status                  payment_status NOT NULL DEFAULT 'pending',
  paid_at                 timestamptz,
  refunded_at             timestamptz
);

-- Feedback
CREATE TABLE feedback (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id  uuid NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
  rating      int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Webhook events (idempotency)
CREATE TABLE webhook_events (
  id           text PRIMARY KEY,
  payload      jsonb NOT NULL,
  processed_at timestamptz
);
