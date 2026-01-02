# 🔐 Set JWT_SECRET in Vercel

## Your JWT Secret
```
dfdf5811224a42a9f13bbb2dcdb664b9
```

## Steps to Set in Vercel

1. **Go to Vercel Dashboard:**
   - https://vercel.com/dashboard
   - Select your project: `task-managment`

2. **Navigate to Settings:**
   - Click "Settings" tab
   - Click "Environment Variables" in the left sidebar

3. **Add JWT_SECRET:**
   - Click "Add New"
   - **Name:** `JWT_SECRET`
   - **Value:** `dfdf5811224a42a9f13bbb2dcdb664b9`
   - **Environments:** Check all (Production, Preview, Development)
   - Click "Save"

4. **Redeploy:**
   - After saving, Vercel will automatically redeploy
   - Or manually trigger: `vercel --prod`

## Important Notes

- **After setting JWT_SECRET, you MUST log out and log back in** to get a new token signed with the correct secret
- The old token was signed with a different secret (or no secret), so it won't work
- Once you log in again with the new secret, all API requests should work

## Verify It's Set

After redeploying, check the Vercel function logs. You should see:
```
Verifying token with secret: Set
```

Instead of:
```
Verifying token with secret: Not set
```



