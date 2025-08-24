# Jira Time Tracker Frontend

A React-based frontend for the Jira Time Tracker application that allows users to view and manage their timesheet data from Jira.

## Features

- **Authentication**: Login with Jira credentials (domain, email, API token)
- **Timesheet View**: Display weekly timesheet data organized by work type
- **Week Navigation**: Navigate between different weeks
- **Data Export**: Export timesheet data to CSV format
- **Weekly Summary**: AI-generated summary of the week's work patterns and insights
- **Interactive Editing**: Click on time entries to edit and update values
- **Responsive Design**: Works on desktop and mobile devices

## Weekly Summary Feature

The application now includes an AI-powered weekly summary section that provides insights about:

- Total hours worked during the week
- Hours per project (if multiple projects exist)
- Daily breakdown at a high level
- Most time-consuming day or pattern
- Notable trends (weekend-heavy work, multitasking, long streaks)

The summary is automatically generated when timesheet data is fetched and appears at the bottom of the timesheet view.

## Development

This project uses:
- React 19 with Vite
- Styled Components for styling
- Modern ES6+ features

### Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## API Integration

The frontend communicates with the backend API to:
- Validate Jira credentials
- Fetch timesheet data for specific weeks
- Receive AI-generated weekly summaries
