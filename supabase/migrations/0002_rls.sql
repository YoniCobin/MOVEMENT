-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

-- Helper: is the current user an admin?
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- users: read own row; admin reads all
CREATE POLICY "users_select_own" ON users FOR SELECT
  USING (id = auth.uid() OR is_admin());

CREATE POLICY "users_insert_own" ON users FOR INSERT
  WITH CHECK (id = auth.uid());

CREATE POLICY "users_update_own" ON users FOR UPDATE
  USING (id = auth.uid() OR is_admin());

-- lessons: public read for open/completed; admin full access
CREATE POLICY "lessons_public_read" ON lessons FOR SELECT
  USING (status IN ('open', 'full', 'completed') OR is_admin());

CREATE POLICY "lessons_admin_write" ON lessons FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());

-- bookings: own rows; admin all
CREATE POLICY "bookings_select" ON bookings FOR SELECT
  USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "bookings_insert" ON bookings FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "bookings_update" ON bookings FOR UPDATE
  USING (user_id = auth.uid() OR is_admin());

-- waitlist: own rows; admin all
CREATE POLICY "waitlist_select" ON waitlist FOR SELECT
  USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "waitlist_insert" ON waitlist FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "waitlist_admin" ON waitlist FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());

-- payments: own bookings; admin all
CREATE POLICY "payments_select" ON payments FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM bookings b WHERE b.id = booking_id AND b.user_id = auth.uid())
    OR is_admin()
  );

-- feedback: own bookings; admin all
CREATE POLICY "feedback_select" ON feedback FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM bookings b WHERE b.id = booking_id AND b.user_id = auth.uid())
    OR is_admin()
  );

CREATE POLICY "feedback_insert" ON feedback FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM bookings b
      WHERE b.id = booking_id
        AND b.user_id = auth.uid()
        AND b.status IN ('confirmed', 'attended')
    )
  );

-- webhook_events: service role only (no user policies)
CREATE POLICY "webhook_admin_only" ON webhook_events FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());
