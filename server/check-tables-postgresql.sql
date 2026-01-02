-- Check which tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Check if users table exists and has data
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') 
    THEN 'users table exists'
    ELSE 'users table does NOT exist'
  END as users_table_status;

-- Count users (if table exists)
SELECT COUNT(*) as user_count FROM users;



