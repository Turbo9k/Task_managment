# OAuth Callback URL Configuration Guide

## Problem
If you're seeing `redirect_uri_mismatch` errors, it means the callback URLs registered in your OAuth provider (Google/GitHub) don't match what your application is sending.

## Required Callback URLs

You **MUST** add these exact URLs to your OAuth provider settings:

### Google OAuth
**Authorized redirect URIs:**
```
https://task-managment-mauve.vercel.app/api/auth/google/callback
```

### GitHub OAuth
**Authorization callback URL:**
```
https://task-managment-mauve.vercel.app/api/auth/github/callback
```

## How to Configure

### Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to **APIs & Services** > **Credentials**
4. Click on your OAuth 2.0 Client ID
5. Under **Authorized redirect URIs**, click **+ ADD URI**
6. Add: `https://task-managment-mauve.vercel.app/api/auth/google/callback`
7. Click **SAVE**

### GitHub Developer Settings
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click on your OAuth App (or create a new one)
3. In the **Authorization callback URL** field, enter:
   ```
   https://task-managment-mauve.vercel.app/api/auth/github/callback
   ```
4. Click **Update application**

## Vercel Environment Variables

Make sure these are set in your Vercel project settings:

### Required Variables
- `CLIENT_URL=https://task-managment-mauve.vercel.app`
- `GOOGLE_CLIENT_ID=your-google-client-id`
- `GOOGLE_CLIENT_SECRET=your-google-client-secret`
- `GITHUB_CLIENT_ID=your-github-client-id`
- `GITHUB_CLIENT_SECRET=your-github-client-secret`

### Optional (for explicit control)
If you want to override the default callback URLs, you can also set:
- `GOOGLE_CALLBACK_URL=https://task-managment-mauve.vercel.app/api/auth/google/callback`
- `GITHUB_CALLBACK_URL=https://task-managment-mauve.vercel.app/api/auth/github/callback`

## Testing

After configuring:
1. Deploy your changes to Vercel
2. Try logging in with Google/GitHub
3. The redirect should work without errors

## Troubleshooting

### Still getting redirect_uri_mismatch?
1. **Double-check the URLs** - They must match EXACTLY (including https, no trailing slash)
2. **Wait a few minutes** - OAuth providers sometimes cache settings
3. **Check Vercel environment variables** - Make sure `CLIENT_URL` is set correctly
4. **Verify the callback URL in code** - Check server logs to see what URL is being sent

### For Local Development
Add these URLs for local testing:
- `http://localhost:8080/api/auth/google/callback`
- `http://localhost:8080/api/auth/github/callback`

Note: You can add multiple callback URLs in your OAuth provider settings.

