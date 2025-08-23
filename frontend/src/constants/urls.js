const BACKEND_URL = 'http://localhost:3001'

export const API_URLS = {
  AUTH_VALIDATE: `${BACKEND_URL}/api/auth/validate`,
  TIMESHEET: (week) => `${BACKEND_URL}/api/timesheet/${week}`,
  HEALTH: `${BACKEND_URL}/api/health`
}

export const EXTERNAL_URLS = {
  ATLASSIAN_API_TOKENS: 'https://id.atlassian.com/manage-profile/security/api-tokens'
}
