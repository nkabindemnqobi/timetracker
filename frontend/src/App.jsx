import { useState, useEffect } from 'react'
import { Heading, Paragraph, Button, Link } from './libs/index.js'
import { TextInput } from './components/TextInput'
import { Timesheet } from './components/Timesheet'
import { API_URLS, EXTERNAL_URLS } from './constants/urls.js'
import { getCurrentWeek, handleLogin, handleLogout, fetchTimesheet } from './utils/authUtils.js'
import { StyledAppMain, StyledAppHeader, StyledHeaderSection, StyledAppSection, StyledAppArticle, StyledAppForm, StyledLogoutButton } from './components/App.styles.js'

export const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [timesheet, setTimesheet] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedWeek, setSelectedWeek] = useState('')
  const [credentials, setCredentials] = useState({ domain: '', email: '', apiToken: '' })

  const onLogin = async (e) => {
    e.preventDefault()
    await handleLogin(credentials, setLoading, setIsAuthenticated, setUser)
  }

  const onLogout = () => {
    handleLogout(setIsAuthenticated, setUser, setTimesheet, setCredentials)
  }

  const onFetchTimesheet = async (week = selectedWeek) => {
    await fetchTimesheet(week, credentials, setLoading, setTimesheet)
  }

  const onClearTimesheet = () => {
    setTimesheet([])
  }

  useEffect(() => {
    const week = getCurrentWeek()
    setSelectedWeek(`${week.start}_${week.end}`)
  }, [])

  return (
    <StyledAppMain>
      <StyledAppHeader>
        <Heading level={1}>Jira Time Tracker</Heading>
        {isAuthenticated && (
          <StyledHeaderSection>
            <Paragraph>Welcome, {user?.name}</Paragraph>
            <StyledLogoutButton onClick={onLogout}>Logout</StyledLogoutButton>
          </StyledHeaderSection>
        )}
      </StyledAppHeader>
      <StyledAppSection>
        {!isAuthenticated ? (
          <StyledAppArticle>
            <Heading level={2}>Login with Jira</Heading>
            <Paragraph>Enter your Jira credentials to get started</Paragraph>
            <StyledAppForm onSubmit={onLogin}>
              <TextInput label="Jira Domain:" type="text" placeholder="yourcompany.atlassian.net" value={credentials.domain} onChange={(e) => setCredentials({...credentials, domain: e.target.value})} required />
              <TextInput label="Email:" type="email" placeholder="your.email@company.com" value={credentials.email} onChange={(e) => setCredentials({...credentials, email: e.target.value})} required />
              <TextInput label="API Token:" type="password" placeholder="Your Jira API token" value={credentials.apiToken} onChange={(e) => setCredentials({...credentials, apiToken: e.target.value})} required small={<Link href={EXTERNAL_URLS.ATLASSIAN_API_TOKENS} target="_blank" rel="noopener noreferrer">Get your API token here</Link>} />
              <Button type="submit" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</Button>
            </StyledAppForm>
          </StyledAppArticle>
        ) : (
          <StyledAppArticle>
            <Timesheet timesheet={timesheet} selectedWeek={selectedWeek} onWeekChange={setSelectedWeek} onFetchTimesheet={onFetchTimesheet} onClearTimesheet={onClearTimesheet} loading={loading} credentials={credentials} />
          </StyledAppArticle>
        )}
      </StyledAppSection>
    </StyledAppMain>
  )
}
