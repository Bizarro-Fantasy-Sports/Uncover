# Auth0 Setup Quick Checklist (STAT-96)

Complete this checklist to finish the Auth0 authentication setup for Statsland.

---

## ✅ Dashboard Configuration (15 minutes)

### Database Connection
- [ ] Go to **Authentication** → **Database**
- [ ] Verify "Username-Password-Authentication" exists
- [ ] Password Policy set to **Good** or **Excellent**
- [ ] Username requirement: **OFF** (use email instead)

### Google Social Login
- [ ] Go to **Authentication** → **Social**
- [ ] Create **Google** connection
- [ ] Either: Use Auth0 dev keys (quick) OR add your own Google OAuth credentials
- [ ] Enable connection for your Statsland application

### Password Reset
- [ ] Go to **Branding** → **Email Templates**
- [ ] **Change Password** template is **Enabled**
- [ ] (Optional) Customize email with Statsland branding

### Branding
- [ ] Go to **Branding** → **Universal Login**
- [ ] Upload Statsland logo
- [ ] Set primary color (e.g., #00b4d8)
- [ ] Customize login page appearance

---

## ✅ Machine-to-Machine Setup (10 minutes)

### Create M2M App
- [ ] Go to **Applications** → **Applications** → **+ Create Application**
- [ ] Name: `Statsland Backend Service`
- [ ] Type: **Machine to Machine**
- [ ] Authorize it to access your API
- [ ] Grant permission: `migrate:athlete-unknown:user-stats`

### Save Credentials
Copy these values (you'll need them for Action secrets):
- [ ] **Client ID**: `______________________________`
- [ ] **Client Secret**: `______________________________`
- [ ] **Auth0 Domain**: `______________________________`
- [ ] **API Audience**: `______________________________`

---

## ✅ Auth0 Action Setup (15 minutes)

### Create Action
- [ ] Go to **Actions** → **Library** → **+ Build Custom**
- [ ] Name: `Create Default Username`
- [ ] Trigger: **Post User Registration**
- [ ] Runtime: **Node 18**
- [ ] Paste code from `auth0-action-create-username.js` file

### Add Dependencies
- [ ] Click **Dependencies** icon (📦)
- [ ] Add: `axios` version `1.6.0`

### Add Secrets
- [ ] Click **Secrets** icon (🔒)
- [ ] Add secret: `API_BASE_URL` = `https://api.statslandfantasy.com` (or your URL)
- [ ] Add secret: `M2M_CLIENT_ID` = (from M2M app)
- [ ] Add secret: `M2M_CLIENT_SECRET` = (from M2M app)
- [ ] Add secret: `AUTH0_DOMAIN` = (e.g., `statsland.us.auth0.com`)
- [ ] Add secret: `AUTH0_AUDIENCE` = (e.g., `https://api.statslandfantasy.com`)

### Deploy Action
- [ ] Click **Deploy** button
- [ ] Go to **Actions** → **Flows** → **Login**
- [ ] Drag `Create Default Username` into **Post User Registration** flow
- [ ] Click **Apply**

---

## ✅ Testing (15 minutes)

### Test Email/Password Signup
- [ ] Go to your Statsland app
- [ ] Click **Sign Up**
- [ ] Create account with email/password
- [ ] Verify password requirements are enforced
- [ ] Login and check User Stats - should show "Guest123X" username

### Test Google Login
- [ ] Click **Sign in with Google**
- [ ] Authenticate with Google
- [ ] Login successful
- [ ] Check User Stats - should show "Guest456Y" username

### Test Password Reset
- [ ] Click **Forgot Password**
- [ ] Enter email
- [ ] Check email inbox
- [ ] Click reset link
- [ ] Set new password
- [ ] Login with new password

### Test Username Change
- [ ] Open User Stats modal
- [ ] Click edit (✏️) button next to username
- [ ] Try changing to invalid username (should show error)
- [ ] Try profanity (should show error)
- [ ] Change to valid username
- [ ] Verify it saves and updates

---

## ✅ Verify Action Logs

- [ ] Go to **Monitoring** → **Logs**
- [ ] Filter: Action = "Create Default Username"
- [ ] Verify recent signup shows successful execution
- [ ] Check console logs for "Successfully created user stats"

---

## 📋 What Each File Does

| File | Purpose |
|------|---------|
| `AUTH0_SETUP_GUIDE.md` | Complete step-by-step configuration guide |
| `AUTH0_M2M_SETUP.md` | Detailed M2M application setup instructions |
| `AUTH0_QUICK_CHECKLIST.md` | This file - quick checklist |
| `auth0-action-create-username.js` | Code to paste into Auth0 Action |

---

## 🚨 Common Issues

### "Insufficient scope" error
➜ Fix: Add `migrate:athlete-unknown:user-stats` permission to M2M app

### Action can't reach localhost
➜ Fix: Use `ngrok http 8080` and use ngrok URL in `API_BASE_URL` secret

### Username not created
➜ Fix: Check Auth0 logs for Action errors, verify M2M credentials are correct

### "Invalid audience" error
➜ Fix: Ensure `AUTH0_AUDIENCE` matches your API identifier exactly

---

## ⏭️ What's NOT Implemented (Optional Future Work)

These items from STAT-96 are NOT yet implemented but are optional:

- [ ] **Prompt user to customize username during signup**
  - Currently users get default username and can change later
  - Could add Auth0 redirect flow to collect username before completing signup
  - Decision: Keep current flow (default + edit later) or add signup prompt?

---

## 📞 Need Help?

If you get stuck:
1. Check Auth0 Monitoring → Logs for detailed error messages
2. Review `AUTH0_SETUP_GUIDE.md` for detailed instructions
3. Review `AUTH0_M2M_SETUP.md` for M2M troubleshooting
4. Test M2M token generation with the curl command in M2M guide

---

## ✨ Success Criteria

You're done when:
- ✅ Users can sign up with email/password
- ✅ Users can sign up/login with Google
- ✅ Password strength is enforced
- ✅ Password reset works
- ✅ New users automatically get "Guest{X}{Y}" username
- ✅ Users can change their username via User Stats modal
- ✅ Login page shows Statsland branding

**Estimated Total Time: 45-60 minutes**
