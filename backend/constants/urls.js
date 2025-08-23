export const JIRA_API_ENDPOINTS = {
  MYSELF: '/myself',
  SEARCH: (jql, maxResults = 100) => `/search?jql=${encodeURIComponent(jql)}&maxResults=${maxResults}`,
  ISSUE_CHANGELOG: (issueKey) => `/issue/${issueKey}/changelog`
}

export const API_ENDPOINTS = {
  HEALTH: '/api/health',
  AUTH_VALIDATE: '/api/auth/validate',
  TIMESHEET: (week) => `/api/timesheet/${week}`
}
