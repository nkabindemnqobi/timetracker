import createFetcher from '../utils/fetcher.js';
import {error, info} from '../utils/logger.js';
import {JIRA_API_ENDPOINTS} from '../constants/urls.js';
import {getIssueTypeCode} from '../constants/issueTypes.js';
import {eachDayOfInterval, format, max, min, set} from "date-fns";

let fetcher = null;
let baseURL = null;
const WORK_START = { hours: 8, minutes: 0 };
const WORK_END = { hours: 17, minutes: 0 };

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
    const user = await fetcher.get(JIRA_API_ENDPOINTS.MYSELF);
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

    const jql = `assignee = "${assignee}" ORDER BY updated DESC`;
    
    info('Fetching issues with JQL', { jql, assignee, startDate, endDate });
    
    const response = await fetcher.get(JIRA_API_ENDPOINTS.SEARCH(jql, 100));
    const issues = response.issues || [];
    
    info('Issues fetched successfully', { 
      count: issues.length,
      total: response.total,
      maxResults: response.maxResults,
      issueKeys: issues.map(i => i.key)
    });
    
    return issues;
  } catch (err) {
    error('Failed to fetch issues', err);
    throw err;
  }
};

export const getIssueHistory = async (issueKey) => {
  try {
    const response = await fetcher.get(JIRA_API_ENDPOINTS.ISSUE_CHANGELOG(issueKey));
    return response.values || [];
  } catch (err) {
    error(`Failed to fetch history for ${issueKey}`, err);
    throw err;
  }
};

function splitByWorkDay(start, end) {
  const slices = [];
  const dayList = eachDayOfInterval({ start, end });

  for (let i = 0; i < dayList.length; i++) {
    const day = dayList[i];

    // working window for that day
    const workStart = set(day, WORK_START);
    const workEnd = set(day, WORK_END);

    // clamp actual times into working window
    const dayStart = max([i === 0 ? start : workStart, workStart]);
    const dayEnd = min([i === dayList.length - 1 ? end : workEnd, workEnd]);

    if (dayEnd > dayStart) {
      const hours = (dayEnd - dayStart) / (1000 * 60 * 60);

      slices.push({
        day: format(day, 'EEE'), // Mon, Tue, ...
        time: hours,
        breakdown: [{ start: format(dayStart, 'HH:mm'), end: format(dayEnd, 'HH:mm') }]
      });
    }
  }

  return slices;
}

const getInProgressIntervals = (changelog) => {
  const intervals = [];

  for (let i = 0; i < changelog.length; i++) {
    const history = changelog[i];
    const created = new Date(history.created);

    for (const item of history.items) {
      if (item.field === 'status' && item.toString === 'In Progress') {
        const start = created;

        // find when it left In Progress
        let exitDate = null;
        for (let j = i + 1; j < changelog.length && !exitDate; j++) {
          const nextHistory = changelog[j];
          for (const nextItem of nextHistory.items) {
            if (nextItem.field === 'status') {
              exitDate = new Date(nextHistory.created);
              break;
            }
          }
        }

        const end = exitDate || new Date();
        intervals.push({ start, end });
      }
    }
  }

  return intervals;
};

const mergeIntervals = (intervals) => {
  if (!intervals.length) return [];
  intervals.sort((a, b) => a.start - b.start);

  const merged = [];
  let prev = { ...intervals[0] };

  for (let i = 1; i < intervals.length; i++) {
    const curr = intervals[i];
    if (curr.start <= prev.end) {
      prev.end = new Date(Math.max(prev.end, curr.end));
    } else {
      merged.push(prev);
      prev = { ...curr };
    }
  }
  merged.push(prev);
  return merged;
};

const getDailyHoursForIntervals = (intervals, summary = 'dev', issueType = 'dev', weekStart, weekEnd) => {
  const dailyHours = { Mon: [], Tue: [], Wed: [], Thu: [], Fri: [], Sat: [], Sun: [] };

  // Convert week dates to Date objects for comparison
  const weekStartDate = new Date(weekStart);
  const weekEndDate = new Date(weekEnd);
  weekEndDate.setHours(23, 59, 59, 999); // End of the week

  for (const { start, end } of intervals) {
    // Filter intervals to only include time within the specified week
    const intervalStart = new Date(Math.max(start, weekStartDate));
    const intervalEnd = new Date(Math.min(end, weekEndDate));
    
    // Only process if there's overlap with the week
    if (intervalStart < intervalEnd) {
      const daySlices = splitByWorkDay(intervalStart, intervalEnd);
      for (const slice of daySlices) {
        dailyHours[slice.day].push({
          time: slice.time,
          type: issueType,
          timeBreakDown: slice.breakdown,
          summary
        });
      }
    }
  }

  return dailyHours;
};

export const getTimesheetForWeek = async (assignee, weekStart, weekEnd) => {
  try {
    info('Generating timesheet', { assignee, weekStart, weekEnd });

    const issues = await getIssues(assignee, weekStart, weekEnd);
    if (!issues || issues.length === 0) {
      return { projectName: null, issues: [], totalHours: 0 };
    }

    const projectName = issues[0].fields.project.name;
    const timesheetIssues = [];
    const allIntervals = [];

    for (const issue of issues) {
      info('Processing issue', { key: issue.key, summary: issue.fields.summary });

      const changelog = await getIssueHistory(issue.key);
      const intervals = getInProgressIntervals(changelog);
      allIntervals.push(...intervals);

      const issueType = getIssueTypeCode(issue.fields.issuetype?.name);
      const dailyHours = getDailyHoursForIntervals(intervals, issue.fields.summary, issueType, weekStart, weekEnd);
      const totalHoursForIssue = Object.values(dailyHours).flat().reduce(
          (sum, d) => sum + d.time, 0);

      timesheetIssues.push({
        key: issue.key,
        timeInProgress: totalHoursForIssue,
        dailyHours,
        updated: issue.fields.updated
      });
    }

    // Merge intervals across all tickets to calculate non-overlapping total hours
    const mergedIntervals = mergeIntervals(allIntervals);
    
    // Convert week dates to Date objects for comparison
    const weekStartDate = new Date(weekStart);
    const weekEndDate = new Date(weekEnd);
    weekEndDate.setHours(23, 59, 59, 999); // End of the week
    
    const totalHours = mergedIntervals.reduce((sum, interval) => {
      // Filter intervals to only include time within the specified week
      const intervalStart = new Date(Math.max(interval.start, weekStartDate));
      const intervalEnd = new Date(Math.min(interval.end, weekEndDate));
      
      // Only process if there's overlap with the week
      if (intervalStart < intervalEnd) {
        const daySlices = splitByWorkDay(intervalStart, intervalEnd);
        return sum + daySlices.reduce((s, slice) => s + slice.time, 0);
      }
      return sum;
    }, 0);

    info('Timesheet generated successfully', {
      assignee,
      projectName,
      itemCount: timesheetIssues.length,
      totalHours
    });

    return {
      projectName,
      issues: timesheetIssues,
      totalHours
    };
  } catch (err) {
    error('Failed to generate timesheet', err);
    throw err;
  }
};


