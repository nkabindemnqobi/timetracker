import express from 'express';
import cors from 'cors';
import 'dotenv/config';

import * as jiraService from './services/jiraService.js';
import { info, debug, error, warn } from './utils/logger.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  info('Health check requested');
  res.json({ status: 'OK', message: 'Time tracker backend is running' });
});

app.post('/api/auth/validate', async (req, res) => {
  try {
    const { domain, email, apiToken } = req.body;
    
    info('Authentication attempt', { 
      domain, 
      email, 
      apiTokenLength: apiToken?.length 
    });
    
    if (!domain || !email || !apiToken) {
      warn('Missing credentials', { 
        hasDomain: !!domain, 
        hasEmail: !!email, 
        hasToken: !!apiToken 
      });
      return res.status(400).json({ error: 'Domain, email, and API token are required' });
    }

    debug('Initializing Jira service', { domain });
    jiraService.initialize(domain, apiToken, email);
    
    debug('Fetching current user');
    const user = await jiraService.getCurrentUser();
    info('User fetched successfully', { 
      name: user.displayName, 
      email: user.emailAddress 
    });
    
    if (user.emailAddress === email) {
      info('Authentication successful', { email });
      res.json({ 
        success: true, 
        user: {
          name: user.displayName,
          email: user.emailAddress
        }
      });
    } else {
      warn('Email mismatch', { 
        provided: email, 
        actual: user.emailAddress 
      });
      res.status(401).json({ error: 'Email does not match authenticated user' });
    }
  } catch (err) {
    error('Authentication failed', err);
    res.status(401).json({ error: `Authentication failed: ${err.message}` });
  }
});

app.get('/api/timesheet/:week', async (req, res) => {
  try {
    const { week } = req.params;
    const { domain, email, apiToken } = req.query;
    
    info('Timesheet request', { 
      week, 
      domain, 
      email, 
      hasToken: !!apiToken 
    });
    
    if (!domain || !email || !apiToken) {
      warn('Missing credentials for timesheet request');
      return res.status(400).json({ error: 'Domain, email, and API token are required' });
    }

    jiraService.initialize(domain, apiToken, email);
    
    const [startDate, endDate] = week.split('_');
    debug('Fetching timesheet for period', { startDate, endDate });
    
    const timesheet = await jiraService.getTimesheetForWeek(email, startDate, endDate);
    info('Timesheet generated successfully', { 
      itemCount: timesheet.length 
    });
    
    res.json(timesheet);
  } catch (err) {
    error('Timesheet generation failed', err);
    res.status(500).json({ error: `Failed to fetch timesheet: ${err.message}` });
  }
});

app.listen(PORT, () => {
  info(`Server started successfully`, { port: PORT, environment: process.env.NODE_ENV || 'development' });
});
