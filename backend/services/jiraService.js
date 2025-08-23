const createFetcher = require('../utils/fetcher');
const { debug, error, info, warn } = require('../utils/logger');

let fetcher = null;
let baseURL = null;

export const initialize = (domain, apiToken, email) => {
  const cleanDomain = domain.replace('.atlassian.net', '').replace('https://', '').replace('http://', '');
  baseURL = `https://${cleanDomain}.atlassian.net/rest/api/3`;
  const authHeader = Buffer.from(`${email}:${apiToken}`).toString('base64');
  
  info('Initializing Jira service', { 
    originalDomain: domain,
    cleanDomain,
    email,
    baseURL,
    hasApiToken: !!apiToken,
    authHeaderLength: authHeader.length
  });
  
  fetcher = createFetcher(baseURL, {
    'Authorization': `Basic ${authHeader}`,
    'Accept': 'application/json'
  });
};

export const getCurrentUser = async () => {
  try {
    debug('Fetching current user from Jira');
    const user = await fetcher.get('/myself');
    info('Current user fetched successfully', { 
      name: user.displayName, 
      email: user.emailAddress 
    });
    return user;
  } catch (err) {
    error('Failed to fetch current user', err);
    throw err;
  }
};

export const getIssues = async (assignee, startDate, endDate) => {
  try {
    const jql = `assignee = "${assignee}" AND updated >= "${startDate}" AND updated <= "${endDate}" ORDER BY updated DESC`;
    
    debug('Fetching issues with JQL', { 
      assignee, 
      startDate, 
      endDate, 
      jql 
    });
    
    const response = await fetcher.get(`/search?jql=${encodeURIComponent(jql)}&maxResults=100`);
    const issues = response.issues || [];
    
    info('Issues fetched successfully', { 
      count: issues.length,
      total: response.total,
      maxResults: response.maxResults
    });
    
    return issues;
  } catch (err) {
    error('Failed to fetch issues', err);
    throw err;
  }
};

export const getIssueHistory = async (issueKey) => {
  try {
    debug('Fetching issue history', { issueKey });
    const response = await fetcher.get(`/issue/${issueKey}/changelog`);
    const changelog = response.values || [];
    
    debug('Issue history fetched', { 
      issueKey, 
      changelogCount: changelog.length 
    });
    
    return changelog;
  } catch (err) {
    error(`Failed to fetch history for ${issueKey}`, err);
    throw err;
  }
};

//TODO: This is a placeholder for the actual time calculation while will be done by AI.
export const calculateTimeInProgress = (issueKey, changelog) => {
  let totalTimeInProgress = 0;
  let inProgressStart = null;

  const sortedChanges = changelog.sort((a, b) => new Date(a.created) - new Date(b.created));
  
  debug('Calculating time in progress', { 
    issueKey, 
    changelogCount: changelog.length 
  });

  for (const change of sortedChanges) {
    for (const item of change.items) {
      if (item.field === 'status') {
        const fromStatus = item.fromString?.toLowerCase();
        const toStatus = item.toString?.toLowerCase();

        if (fromStatus !== 'in progress' && toStatus === 'in progress') {
          inProgressStart = new Date(change.created);
          debug('Started in progress', { 
            issueKey, 
            date: change.created,
            fromStatus,
            toStatus
          });
        }
        else if (fromStatus === 'in progress' && toStatus !== 'in progress') {
          if (inProgressStart) {
            const endTime = new Date(change.created);
            const timeSpent = endTime - inProgressStart;
            totalTimeInProgress += timeSpent;
            
            debug('Left in progress', { 
              issueKey, 
              date: change.created,
              timeSpent: timeSpent / (1000 * 60 * 60),
              fromStatus,
              toStatus
            });
            
            inProgressStart = null;
          }
        }
      }
    }
  }

  if (inProgressStart) {
    const now = new Date();
    const timeSpent = now - inProgressStart;
    totalTimeInProgress += timeSpent;
    
    debug('Still in progress', { 
      issueKey, 
      timeSpent: timeSpent / (1000 * 60 * 60)
    });
  }

  const hoursInProgress = totalTimeInProgress / (1000 * 60 * 60);
  info('Time calculation complete', { 
    issueKey, 
    totalHours: hoursInProgress 
  });
  
  return totalTimeInProgress;
};

export const getTimesheetForWeek = async (assignee, weekStart, weekEnd) => {
  try {
    info('Generating timesheet', { 
      assignee, 
      weekStart, 
      weekEnd 
    });
    
    const issues = await getIssues(assignee, weekStart, weekEnd);
    
    const timesheet = [];

    for (const issue of issues) {
      debug('Processing issue', { 
        key: issue.key, 
        summary: issue.fields.summary 
      });
      
      const changelog = await getIssueHistory(issue.key);
      const timeInProgress = calculateTimeInProgress(issue.key, changelog);
      const hoursInProgress = timeInProgress / (1000 * 60 * 60);

      timesheet.push({
        key: issue.key,
        summary: issue.fields.summary,
        status: issue.fields.status.name,
        timeInProgress: hoursInProgress,
        updated: issue.fields.updated
      });
    }

    info('Timesheet generated successfully', { 
      assignee, 
      itemCount: timesheet.length,
      totalHours: timesheet.reduce((sum, item) => sum + item.timeInProgress, 0)
    });

    return timesheet;
  } catch (err) {
    error('Failed to generate timesheet', err);
    throw err;
  }
};


