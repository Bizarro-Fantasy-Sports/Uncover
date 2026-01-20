# Auth0 Machine-to-Machine Application Setup

This guide explains how to set up a Machine-to-Machine (M2M) application in Auth0 so that the Post-Registration Action can securely call your backend API.

---

## Why Do We Need This?

The Post-Registration Action needs to call your backend API to create user stats with a default username. Your backend API uses JWT authentication with specific permissions. A Machine-to-Machine app allows the Action to get a proper access token with the right permissions.

---

## Step 1: Create Machine-to-Machine Application

1. Go to **Auth0 Dashboard** → **Applications** → **Applications**
2. Click **+ Create Application**
3. **Name**: `Statsland Backend Service`
4. **Application Type**: Select **Machine to Machine Applications**
5. Click **Create**

---

## Step 2: Authorize the M2M App to Access Your API

1. After creating, you'll see "Authorize Machine to Machine Integrations"
2. Find your API in the list (e.g., "Athlete Unknown API" or whatever you named it)
   - If you don't see your API, go to **Applications** → **APIs** and create one first
3. Toggle ON to authorize
4. Click the dropdown arrow to expand permissions
5. Select these permissions:
   - ✅ `migrate:athlete-unknown:user-stats`
6. Click **Authorize**

---

## Step 3: Get Client Credentials

1. In the M2M application settings, you'll see:
   - **Domain**: Your Auth0 domain (e.g., `statsland.us.auth0.com`)
   - **Client ID**: Copy this (looks like: `abc123xyz456...`)
   - **Client Secret**: Copy this (looks like: `aBcDeFg123...`)
2. Keep these secure - you'll add them as secrets in the Auth0 Action

---

## Step 4: Configure Your Auth0 API (If Not Already Done)

If you haven't created an API in Auth0 yet:

1. Go to **Applications** → **APIs**
2. Click **+ Create API**
3. **Name**: `Athlete Unknown API`
4. **Identifier**: Your API base URL (e.g., `https://api.statslandfantasy.com`)
   - This is your **audience** value
   - ⚠️ This must match the `audience` in your Auth0 config
5. **Signing Algorithm**: RS256 (default)
6. Click **Create**

### Add Permissions:

1. In the API, go to **Permissions** tab
2. Add these permissions:
   - `migrate:athlete-unknown:user-stats` - "Migrate user statistics"
   - `read:athlete-unknown:user-stats` - "Read user statistics"
   - `update:athlete-unknown:profile` - "Update user profile"
   - `read:athlete-unknown:upcoming-rounds` - "Read upcoming rounds"
3. Click **Add**

---

## Step 5: Add Secrets to Auth0 Action

1. Go to **Actions** → **Library**
2. Find your `Create Default Username` action
3. Click to edit
4. Click **Secrets** icon (🔒) in left sidebar
5. Add these secrets:

   | Key | Value | Example |
   |-----|-------|---------|
   | `API_BASE_URL` | Your backend API URL | `https://api.statslandfantasy.com` |
   | `M2M_CLIENT_ID` | Client ID from Step 3 | `abc123xyz456...` |
   | `M2M_CLIENT_SECRET` | Client Secret from Step 3 | `aBcDeFg123...` |
   | `AUTH0_DOMAIN` | Your Auth0 domain | `statsland.us.auth0.com` |
   | `AUTH0_AUDIENCE` | Your API identifier | `https://api.statslandfantasy.com` |

6. Click **Save**

---

## Step 6: Test the Setup

### Test M2M Token Generation

You can test if the M2M app can get tokens using curl:

```bash
curl --request POST \
  --url 'https://YOUR_AUTH0_DOMAIN/oauth/token' \
  --header 'content-type: application/json' \
  --data '{
    "client_id": "YOUR_M2M_CLIENT_ID",
    "client_secret": "YOUR_M2M_CLIENT_SECRET",
    "audience": "YOUR_API_AUDIENCE",
    "grant_type": "client_credentials"
  }'
```

Expected response:
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "Bearer",
  "expires_in": 86400
}
```

### Decode the Token

Copy the `access_token` and decode it at [jwt.io](https://jwt.io)

Verify it contains:
- ✅ `aud`: Your API audience
- ✅ `permissions`: `["migrate:athlete-unknown:user-stats"]`

### Test Full Registration Flow

1. Sign up a new user in your app
2. Go to **Auth0 Dashboard** → **Monitoring** → **Logs**
3. Find the "Post User Registration" log entry
4. Click to expand and check for:
   - ✅ Action: `Create Default Username` succeeded
   - ✅ Console logs show "Successfully created user stats"
5. Log in as the new user
6. Check User Stats modal - should show username like "Guest123J"

---

## Troubleshooting

### Error: "Insufficient scope"

**Cause**: M2M app doesn't have the `migrate:athlete-unknown:user-stats` permission

**Fix**:
1. Go to Applications → APIs → Your API → Machine to Machine Applications
2. Find "Statsland Backend Service"
3. Click dropdown and ensure permission is checked
4. Click **Update**

### Error: "invalid_client"

**Cause**: Wrong Client ID or Client Secret

**Fix**:
1. Verify the secrets in your Action match the M2M app credentials exactly
2. No extra spaces or line breaks

### Error: "Access token is missing required scope"

**Cause**: The API endpoint requires a permission that wasn't granted to the M2M app

**Fix**:
1. Check what permission your backend endpoint requires
2. Add that permission to the M2M app authorization

### Error: "Cannot reach localhost"

**Cause**: Auth0 Actions run in Auth0's cloud and can't reach `localhost`

**Fix** (for local testing):
1. Use ngrok: `ngrok http 8080`
2. Use the ngrok URL as `API_BASE_URL` in Action secrets
3. Example: `https://abc123.ngrok.io`

---

## Security Best Practices

1. **Never commit secrets to Git** - Secrets are managed in Auth0 only
2. **Rotate secrets regularly** - Regenerate Client Secret periodically
3. **Use separate M2M apps for dev/prod** - Don't use same credentials across environments
4. **Monitor API usage** - Check Auth0 logs for suspicious M2M activity
5. **Minimum permissions** - Only grant the exact permissions needed

---

## Alternative: Use API Key Instead

If you prefer not to use JWT tokens for the Action, you can modify your backend to accept API key auth for the migrate endpoint:

### Backend Change (main.go):

```go
// Move migrate endpoint from publicAuth to admin group
admin := v1.Group("")
admin.Use(middleware.APIKeyMiddleware())
{
    admin.PUT("/round", server.CreateRound)
    admin.POST("/round", server.ScrapeAndCreateRound)
    admin.DELETE("/round", server.DeleteRound)
    admin.POST("/stats/user/migrate", server.MigrateUserStats) // Add this line
}
```

### Action Secrets (simplified):

- `API_BASE_URL`: Your backend API URL
- `API_KEY`: Your X-API-Key value

### Action Code (simplified):

```javascript
const response = await axios.post(
  `${API_BASE_URL}/v1/stats/user/migrate`,
  userStatsPayload,
  {
    headers: {
      'X-API-Key': event.secrets.API_KEY,
      'Content-Type': 'application/json'
    }
  }
);
```

**Pros**: Simpler setup, no M2M app needed
**Cons**: Less secure, harder to audit, no fine-grained permissions

---

## Summary

✅ M2M application created
✅ M2M app authorized to access your API
✅ Permissions granted: `migrate:athlete-unknown:user-stats`
✅ Client credentials added as Action secrets
✅ Action can now securely call your backend API

Your Post-Registration Action will now automatically create user stats with a default username for all new signups!
