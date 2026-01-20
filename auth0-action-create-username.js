/**
 * Auth0 Post-Registration Action: Create Default Username
 *
 * This Action runs after a user successfully registers.
 * It creates a default username "Guest{X}{Y}" where:
 * - X = random number 1-999
 * - Y = first letter of email (uppercase)
 *
 * SETUP INSTRUCTIONS:
 * 1. Create this Action in Auth0 Dashboard → Actions → Library
 * 2. Trigger: Post User Registration
 * 3. Add secrets (see below)
 * 4. Add dependency: axios@1.6.0
 * 5. Deploy and add to Login → Post User Registration flow
 *
 * REQUIRED SECRETS:
 * - API_BASE_URL: Your backend API URL (e.g., https://api.statslandfantasy.com)
 * - M2M_CLIENT_ID: Machine-to-Machine app Client ID
 * - M2M_CLIENT_SECRET: Machine-to-Machine app Client Secret
 * - AUTH0_DOMAIN: Your Auth0 domain (e.g., statsland.us.auth0.com)
 * - AUTH0_AUDIENCE: Your API audience (e.g., https://api.statslandfantasy.com)
 */

exports.onExecutePostUserRegistration = async (event) => {
  const axios = require('axios');

  // Configuration from secrets
  const API_BASE_URL = event.secrets.API_BASE_URL;
  const M2M_CLIENT_ID = event.secrets.M2M_CLIENT_ID;
  const M2M_CLIENT_SECRET = event.secrets.M2M_CLIENT_SECRET;
  const AUTH0_DOMAIN = event.secrets.AUTH0_DOMAIN;
  const AUTH0_AUDIENCE = event.secrets.AUTH0_AUDIENCE;

  const userId = event.user.user_id;
  const email = event.user.email || '';

  console.log(`[CreateDefaultUsername] Processing new user: ${userId}`);

  try {
    // Step 1: Get M2M access token from Auth0
    console.log(`[CreateDefaultUsername] Requesting M2M access token...`);

    const tokenResponse = await axios.post(
      `https://${AUTH0_DOMAIN}/oauth/token`,
      {
        client_id: M2M_CLIENT_ID,
        client_secret: M2M_CLIENT_SECRET,
        audience: AUTH0_AUDIENCE,
        grant_type: 'client_credentials'
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      }
    );

    const accessToken = tokenResponse.data.access_token;
    console.log(`[CreateDefaultUsername] Successfully obtained access token`);

    // Step 2: Generate default username
    const randomNum = Math.floor(Math.random() * 999) + 1;
    const firstLetter = email && email.length > 0 ? email[0].toUpperCase() : 'A';
    const defaultUsername = `Guest${randomNum}${firstLetter}`;

    console.log(`[CreateDefaultUsername] Generated username: ${defaultUsername}`);

    // Step 3: Create user stats with default username
    const userStatsPayload = {
      userId: userId,
      userName: defaultUsername,
      userCreated: new Date().toISOString(),
      currentDailyStreak: 0,
      lastDayPlayed: '',
      sports: []
    };

    console.log(`[CreateDefaultUsername] Creating user stats via API...`);

    const response = await axios.post(
      `${API_BASE_URL}/v1/stats/user/migrate`,
      userStatsPayload,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    console.log(`[CreateDefaultUsername] ✅ Successfully created user stats for ${userId} with username: ${defaultUsername}`);

  } catch (error) {
    // Log detailed error information
    console.error(`[CreateDefaultUsername] ❌ Error:`, error.message);

    if (error.response) {
      console.error(`[CreateDefaultUsername] API Response Status: ${error.response.status}`);
      console.error(`[CreateDefaultUsername] API Response Data:`, JSON.stringify(error.response.data));

      // If user already exists (409 Conflict), that's okay
      if (error.response.status === 409) {
        console.log(`[CreateDefaultUsername] User stats already exist (409 Conflict) - this is expected for existing users`);
        return;
      }
    } else if (error.request) {
      console.error(`[CreateDefaultUsername] No response received from API`);
      console.error(`[CreateDefaultUsername] Request config:`, {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers
      });
    }

    // Don't throw error - we don't want to block user registration
    // The user can still use the app, they just won't have a default username yet
    console.warn(`[CreateDefaultUsername] ⚠️ Continuing registration despite error - user can set username manually later`);
  }
};
