-- Create a user with properly hashed password
-- This hash is for password: "password123"
-- Generated with: bcrypt.hash('password123', 12)

-- First, let's check if user exists
SELECT id, email, name, is_active FROM users WHERE email = 'admin@example.com';

-- If user doesn't exist, create it
-- If user exists, update the password
INSERT INTO users (email, password, name, is_active, created_at)
VALUES (
  'admin@example.com',
  '$2a$12$rKqJqJqJqJqJqJqJqJqJqOqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq', -- This is a placeholder - you need to generate a real hash
  'Admin User',
  TRUE,
  CURRENT_TIMESTAMP
)
ON CONFLICT (email) 
DO UPDATE SET 
  password = EXCLUDED.password,
  is_active = TRUE;

-- Verify user
SELECT id, email, name, is_active, created_at FROM users WHERE email = 'admin@example.com';



