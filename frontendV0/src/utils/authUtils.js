import { API_URLS } from '../constants/urls.js'

export const getCurrentWeek = () => {
  const now = new Date()
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))
  const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6))
  return {
    start: startOfWeek.toISOString().split('T')[0],
    end: endOfWeek.toISOString().split('T')[0]
  }
}

export const handleLogin = async (credentials, setLoading, setIsAuthenticated, setUser) => {
  setLoading(true)
  
  try {
    const response = await fetch(API_URLS.AUTH_VALIDATE, {
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

export const handleLogout = (setIsAuthenticated, setUser, setTimesheet, setCredentials) => {
  setIsAuthenticated(false)
  setUser(null)
  setTimesheet([])
  setCredentials({ domain: '', email: '', apiToken: '' })
}

export const fetchTimesheet = async (week, credentials, setLoading, setTimesheet) => {
  if (!week) return
  
  setLoading(true)
  try {
    const params = new URLSearchParams({
      domain: credentials.domain,
      email: credentials.email,
      apiToken: credentials.apiToken
    })
    
    const response = await fetch(`${API_URLS.TIMESHEET(week)}?${params}`)
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
