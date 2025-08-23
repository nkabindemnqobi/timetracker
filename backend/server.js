import express from 'express';
import cors from 'cors';
import 'dotenv/config';

import * as jiraService from './services/jiraService.js';
import { info, error } from './utils/logger.js';
import { API_ENDPOINTS } from './constants/urls.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get(API_ENDPOINTS.HEALTH, (req, res) => {
  info('Health check requested');
  res.json({ status: 'OK', message: 'Time tracker backend is running' });
});

app.post(API_ENDPOINTS.AUTH_VALIDATE, async (req, res) => {
  try {
    const { domain, email, apiToken } = req.body;
    
    info('Authentication attempt', { 
      domain, 
      email, 
      apiTokenLength: apiToken?.length 
    });
    
    if (!domain || !email || !apiToken) {
      return res.status(400).json({ error: 'Domain, email, and API token are required' });
    }

    jiraService.initialize(domain, apiToken, email);
    
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
      res.status(401).json({ error: 'Email does not match authenticated user' });
    }
  } catch (err) {
    error('Authentication failed', err);
    res.status(401).json({ error: `Authentication failed: ${err.message}` });
  }
});

app.get(API_ENDPOINTS.TIMESHEET(':week'), async (req, res) => {
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
      return res.status(400).json({ error: 'Domain, email, and API token are required' });
    }

    jiraService.initialize(domain, apiToken, email);
    
    const [startDate, endDate] = week.split('_');
    
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
