# Auth0 Configuration Guide for STAT-96

Complete setup guide for Statsland Auth0 authentication workflow.

---

## Part 1: Basic Auth0 Dashboard Configuration

### 1.1 Enable Email/Password Authentication

1. Go to **Auth0 Dashboard** → **Authentication** → **Database**
2. Find your existing database connection (likely "Username-Password-Authentication")
3. Click on the connection name
4. Under **Settings** tab, ensure these are enabled:
   - ✅ **Requires Username**: OFF (we want email-based login)
   - ✅ **Username-Password Authentication**: ON
5. Click **Save Changes**

---

### 1.2 Configure Password Strength Requirements

1. In the same Database connection settings
2. Scroll to **Password Policy**
3. Select: **Good** or **Excellent** (recommended: **Good**)
4. **Good** requires:
   - At least 8 characters
   - Contains lowercase, uppercase, numbers
   - No more than 2 identical characters in a row
5. Click **Save Changes**

---

### 1.3 Enable Google Social Connection

1. Go to **Auth0 Dashboard** → **Authentication** → **Social**
2. Click **+ Create Connection**
3. Select **Google / Gmail**
4. You have two options:

   **Option A - Use Auth0 Dev Keys (Quick Testing):**
   - Just toggle ON and click **Create**
   - ⚠️ Only for development, shows Auth0 branding

   **Option B - Use Your Own Google OAuth Credentials (Production):**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable **Google+ API**
   - Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
   - Application type: **Web application**
   - Authorized redirect URIs: `https://YOUR_AUTH0_DOMAIN/login/callback`
   - Copy **Client ID** and **Client Secret**
   - Paste them into Auth0 Google connection settings
   - Toggle ON and click **Save**

5. Go to **Applications** tab in the connection
6. Enable the connection for your Statsland application

---

### 1.4 Enable Forgot Password / Password Reset

1. Go to **Auth0 Dashboard** → **Branding** → **Email Templates**
2. Select **Change Password** template
3. Verify **Status** is **Enabled**
4. Customize email template with Statsland branding if desired
5. Click **Save**

**Verify Reset Flow Works:**
- Password reset is automatically enabled with Database connections
- Users click "Forgot Password" on login page
- Auth0 sends reset email
- User clicks link and sets new password

---

## Part 2: Auth0 Universal Login Customization (Statsland Branding)

### 2.1 Customize Login Page

1. Go to **Auth0 Dashboard** → **Branding** → **Universal Login**
2. Under **Advanced Customization**, toggle ON
3. Click **Universal Login** tab
4. Select **New Universal Login Experience**
5. Click **Customize** on Login tab

**Add Statsland Logo:**
1. Go to **Branding** → **Universal Login** → **Settings**
2. Upload logo URL or image
3. Recommended size: 150x150px minimum
4. Save changes

**Customize Colors:**
1. **Primary Color**: Set to Statsland brand color (e.g., #00b4d8)
2. **Page Background**: Set background color/image
3. Save changes

---

## Part 3: Auth0 Actions (Username Creation)

### 3.1 Create Post-Registration Action

1. Go to **Auth0 Dashboard** → **Actions** → **Library**
2. Click **+ Build Custom**
3. **Name**: `Create Default Username`
4. **Trigger**: Select **Post User Registration** → **Login / Post User Registration**
5. **Runtime**: Node 18 (recommended)
6. Click **Create**

### 3.2 Add Action Code

Replace the default code with this:

```javascript
/**
 * Handler that will be called during the execution of a PostUserRegistration flow.
 *
 * @param {Event} event - Details about the context and user that has registered.
 */
exports.onExecutePostUserRegistration = async (event) => {
  const axios = require('axios');

  // Get configuration from secrets
  const API_BASE_URL = event.secrets.API_BASE_URL;
  const API_KEY = event.secrets.API_KEY;

  const userId = event.user.user_id;
  const email = event.user.email || '';

  console.log(`[CreateDefaultUsername] Processing new user: ${userId}`);

  try {
    // Generate default username: Guest{1-999}{FirstLetterOfEmail}
    const randomNum = Math.floor(Math.random() * 999) + 1;
    const firstLetter = email && email.length > 0 ? email[0].toUpperCase() : 'A';
    const defaultUsername = `Guest${randomNum}${firstLetter}`;

    console.log(`[CreateDefaultUsername] Generated username: ${defaultUsername}`);

    // Create user stats with default username via API
    // Note: This uses the migrate endpoint which creates if not exists
    const response = await axios.post(
      `${API_BASE_URL}/v1/stats/user/migrate`,
      {
        userId: userId,
        userName: defaultUsername,
        userCreated: new Date().toISOString(),
        currentDailyStreak: 0,
        lastDayPlayed: '',
        sports: []
      },
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    console.log(`[CreateDefaultUsername] Successfully created user stats for ${userId}`);

  } catch (error) {
    // Log error but don't fail registration
    console.error(`[CreateDefaultUsername] Error creating user stats:`, error.message);

    if (error.response) {
      console.error(`[CreateDefaultUsername] API Response Status: ${error.response.status}`);
      console.error(`[CreateDefaultUsername] API Response Data:`, error.response.data);

      // If user already exists (409 Conflict), that's okay
      if (error.response.status === 409) {
        console.log(`[CreateDefaultUsername] User stats already exist, skipping creation`);
        return;
      }
    }

    // Don't throw - we don't want to block user registration if this fails
    console.warn(`[CreateDefaultUsername] Continuing registration despite error`);
  }
};
```

### 3.3 Configure Action Secrets

1. In the Action editor, click **Secrets** icon (🔒) in left sidebar
2. Click **+ Add Secret**
3. Add these secrets:

   **Secret 1:**
   - **Key**: `API_BASE_URL`
   - **Value**: Your API base URL (e.g., `https://api.statslandfantasy.com` or `http://localhost:8080` for local testing)

   **Secret 2:**
   - **Key**: `API_KEY`
   - **Value**: Your API key for admin endpoints (the one you use for X-API-Key header)
     - ⚠️ If you don't have API key auth set up yet, you'll need to modify the backend to accept JWT tokens for the migrate endpoint

4. Click **Save**

### 3.4 Add Dependencies

1. Click **Dependencies** icon (📦) in left sidebar
2. Add: `axios` version `1.6.0` (or latest)
3. Click **Save**

### 3.5 Deploy Action

1. Click **Deploy** button (top right)
2. Go to **Actions** → **Flows** → **Login**
3. Click **Post User Registration** flow
4. Drag your `Create Default Username` action from the right sidebar into the flow
5. Click **Apply**

---

## Part 4: Prompt User for Username (Optional Enhanced Flow)

If you want to prompt users to customize their username during signup (instead of just using default), you have two options:

### Option A: Custom Action with Redirect (Recommended)

This requires building a separate username setup page in your app.

**Benefits:**
- Full control over UI/UX
- Better user experience
- Can show validation in real-time

**I can provide this code if you want it** - let me know.

### Option B: Use Auth0 Progressive Profiling

Auth0's built-in progressive profiling can collect additional user data post-signup.

1. Go to **Actions** → **Flows** → **Login**
2. Create new Action: `Prompt Username Collection`
3. Use Auth0's forms to collect username
4. Less flexible but faster to implement

**For now, I recommend skipping this** and just using the default username. Users can change it later via the edit button you already built.

---

## Part 5: Testing the Setup

### Test Email/Password Signup

1. Go to your Statsland app
2. Click **Sign Up**
3. Enter email and password
4. Verify:
   - ✅ Password strength requirements enforced
   - ✅ Account created successfully
   - ✅ Default username "Guest123X" assigned (check User Stats)

### Test Google Social Login

1. Go to your Statsland app
2. Click **Continue with Google**
3. Select Google account
4. Verify:
   - ✅ Login successful
   - ✅ Default username assigned

### Test Password Reset

1. On login page, click **Forgot Password**
2. Enter email
3. Check email inbox
4. Click reset link
5. Set new password
6. Verify login works with new password

### Test Username Change

1. Login to Statsland
2. Click Stats button
3. Click edit (✏️) button next to username
4. Enter new username
5. Verify:
   - ✅ Validation works (try invalid usernames)
   - ✅ Profanity filter works (try "badword")
   - ✅ Username updates in UI immediately

---

## Part 6: Auth0 Application Settings (Verify)

1. Go to **Auth0 Dashboard** → **Applications** → **Applications**
2. Select your Statsland application
3. Verify these settings:

### Application URIs:
- **Application Login URI**: `https://statslandfantasy.com/login`
- **Allowed Callback URLs**:
  ```
  http://localhost:3000,
  https://statslandfantasy.com,
  https://dev.statslandfantasy.com
  ```
- **Allowed Logout URLs**: Same as callback URLs
- **Allowed Web Origins**: Same as callback URLs

### Application Type:
- Should be: **Single Page Application**

### Grant Types (Advanced Settings):
- ✅ Implicit
- ✅ Authorization Code
- ✅ Refresh Token

---

## Part 7: Important Notes & Troubleshooting

### API Key vs JWT for User Stats Migration

The Auth0 Action uses API_KEY for authentication. However, your `/v1/stats/user/migrate` endpoint currently requires JWT with specific permissions.

**Option 1: Use JWT in Action (Recommended)**

Modify the Action to use machine-to-machine authentication:

1. Create M2M Application in Auth0
2. Grant it `migrate:athlete-unknown:user-stats` permission
3. Get access token in Action using Client Credentials flow
4. Use that token instead of API_KEY

**Option 2: Allow API Key for Migrate Endpoint**

Modify your backend to accept API key auth for the migrate endpoint:

```go
// In main.go, add migrate endpoint to admin group instead:
admin.POST("/stats/user/migrate", server.MigrateUserStats)
```

### Testing Locally

When testing with local backend (`http://localhost:8080`):
1. Update `API_BASE_URL` secret in Action to `http://localhost:8080`
2. ⚠️ Auth0 Actions **cannot** reach `localhost` directly
3. Use **ngrok** or similar tunnel:
   ```bash
   ngrok http 8080
   ```
4. Use the ngrok URL in `API_BASE_URL` secret

### Monitoring Action Execution

1. Go to **Monitoring** → **Logs** in Auth0 Dashboard
2. Filter by Action name: `Create Default Username`
3. Check for errors after new user registration
4. Review console.log output

---

## Summary Checklist

- [ ] Email/Password authentication enabled
- [ ] Password strength policy set to "Good"
- [ ] Google Social connection configured
- [ ] Password reset verified working
- [ ] Universal Login branded with Statsland colors/logo
- [ ] Post-Registration Action created and deployed
- [ ] Action secrets configured (API_BASE_URL, API_KEY)
- [ ] Action added to Login flow
- [ ] All authentication methods tested
- [ ] Username change feature tested

---

## Next Steps

After completing this setup, users will be able to:
1. ✅ Sign up with Email/Password
2. ✅ Sign up with Google
3. ✅ Get default username "Guest{X}{Y}" automatically
4. ✅ Reset forgotten passwords
5. ✅ Change their username anytime via User Stats modal

The only piece not implemented is **prompting users to customize username during signup** - this is optional and can be added later if desired.
