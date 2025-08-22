import { useState, useEffect } from 'react'
import { TextInput } from './components/TextInput'

export const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [timesheet, setTimesheet] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedWeek, setSelectedWeek] = useState('')
  const [credentials, setCredentials] = useState({
    domain: '',
    email: '',
    apiToken: ''
  })

  const getCurrentWeek = () => {
    const now = new Date()
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))
    const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6))
    return {
      start: startOfWeek.toISOString().split('T')[0],
      end: endOfWeek.toISOString().split('T')[0]
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const response = await fetch('http://localhost:3001/api/auth/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      })
      
      const data = await response.json()
      
      if (data.success) {
        setIsAuthenticated(true)
        setUser(data.user)
      } else {
        alert('Authentication failed: ' + data.error)
      }
    } catch (error) {
      console.error('Login error:', error)
      alert('Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setUser(null)
    setTimesheet([])
    setCredentials({ domain: '', email: '', apiToken: '' })
  }

  const fetchTimesheet = async () => {
    if (!selectedWeek) return
    
    setLoading(true)
    try {
      const params = new URLSearchParams({
        domain: credentials.domain,
        email: credentials.email,
        apiToken: credentials.apiToken
      })
      
      const response = await fetch(`http://localhost:3001/api/timesheet/${selectedWeek}?${params}`)
      const data = await response.json()
      
      if (data.error) {
        alert('Error: ' + data.error)
      } else {
        setTimesheet(data)
      }
    } catch (error) {
      console.error('Error fetching timesheet:', error)
      alert('Failed to fetch timesheet')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const week = getCurrentWeek()
    setSelectedWeek(`${week.start}_${week.end}`)
  }, [])

  const formatHours = (hours) => {
    return hours.toFixed(2)
  }

  const totalHours = timesheet.reduce((sum, item) => sum + item.timeInProgress, 0)

  return (
    <main>
      <header>
        <h1>Jira Time Tracker</h1>
        {isAuthenticated && (
          <section>
            <p>Welcome, {user?.name}</p>
            <button onClick={handleLogout}>
              Logout
            </button>
          </section>
        )}
      </header>

      <section>
        {!isAuthenticated ? (
          <article>
            <h2>Login with Jira</h2>
            <p>Enter your Jira credentials to get started</p>
            
            <form onSubmit={handleLogin}>
              <TextInput
                label="Jira Domain:"
                type="text"
                placeholder="yourcompany.atlassian.net"
                value={credentials.domain}
                onChange={(e) => setCredentials({...credentials, domain: e.target.value})}
                required
              />
              
              <TextInput
                label="Email:"
                type="email"
                placeholder="your.email@company.com"
                value={credentials.email}
                onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                required
              />
              
              <TextInput
                label="API Token:"
                type="password"
                placeholder="Your Jira API token"
                value={credentials.apiToken}
                onChange={(e) => setCredentials({...credentials, apiToken: e.target.value})}
                required
                small={
                  <a href="https://id.atlassian.com/manage-profile/security/api-tokens" target="_blank" rel="noopener noreferrer">
                    Get your API token here
                  </a>
                }
              />
              
              <button type="submit" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          </article>
        ) : (
          <article>
            <section>
              <input
                type="week"
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(e.target.value)}
              />
              <button onClick={fetchTimesheet} disabled={loading}>
                {loading ? 'Loading...' : 'Get Timesheet'}
              </button>
            </section>

            {timesheet.length > 0 && (
              <section>
                <h2>Timesheet</h2>
                <p>
                  Total Hours: {formatHours(totalHours)}h
                </p>
                <table>
                  <thead>
                    <tr>
                      <th>Issue Key</th>
                      <th>Summary</th>
                      <th>Status</th>
                      <th>Hours in Progress</th>
                    </tr>
                  </thead>
                  <tbody>
                    {timesheet.map((item) => (
                      <tr key={item.key}>
                        <td>{item.key}</td>
                        <td>{item.summary}</td>
                        <td>{item.status}</td>
                        <td>{formatHours(item.timeInProgress)}h</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            )}
          </article>
        )}
      </section>
    </main>
  )
}
