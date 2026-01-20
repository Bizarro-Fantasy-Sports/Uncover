/**
 * Auth0 Post-Registration Action: Create Default Username (SIMPLE VERSION)
 *
 * This is a simplified version that uses API Key authentication instead of M2M JWT.
 * Use this if you want simpler setup but are okay with less security granularity.
 *
 * PREREQUISITE BACKEND CHANGE:
 * You must move the migrate endpoint to accept API key auth.
 * In athlete-unknown-api/main.go, add this line to the admin group:
 *
 *   admin.POST("/stats/user/migrate", server.MigrateUserStats)
 *
 * SETUP INSTRUCTIONS:
 * 1. Make the backend change above
 * 2. Create this Action in Auth0 Dashboard → Actions → Library
 * 3. Trigger: Post User Registration
 * 4. Add secrets: API_BASE_URL and API_KEY
 * 5. Add dependency: axios@1.6.0
 * 6. Deploy and add to Login → Post User Registration flow
 *
 * REQUIRED SECRETS:
 * - API_BASE_URL: Your backend API URL (e.g., https://api.statslandfantasy.com)
 * - API_KEY: Your X-API-Key value (the one you use for admin endpoints)
 */

exports.onExecutePostUserRegistration = async (event) => {
  const axios = require('axios');

  // Configuration from secrets
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

    // Create user stats with default username
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
          'X-API-Key': API_KEY,
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
      console.error(`[CreateDefaultUsername] Request URL: ${error.config?.url}`);
    }

    // Don't throw error - we don't want to block user registration
    // The user can still use the app, they just won't have a default username yet
    console.warn(`[CreateDefaultUsername] ⚠️ Continuing registration despite error - user can set username manually later`);
  }
};
