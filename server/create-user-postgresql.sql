-- Create a test user account
-- Password: "password123" (hashed with bcrypt)

INSERT INTO users (email, password, name, is_active, created_at)
VALUES (
  'admin@example.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyY5Y5Y5Y5Y5Y', -- password: "password123"
  'Admin User',
  TRUE,
  CURRENT_TIMESTAMP
)
ON CONFLICT (email) DO NOTHING;

-- Verify user was created
SELECT id, email, name, is_active, created_at FROM users WHERE email = 'admin@example.com';



