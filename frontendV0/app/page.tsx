"use client"

import { useState, useEffect } from "react"
import { LoginForm } from "@/components/login-form"
import { TimesheetDashboard } from "@/components/timesheet-dashboard"

interface User {
  name: string
  email: string
}

interface AuthData {
  domain: string
  email: string
  apiToken: string
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [authData, setAuthData] = useState<AuthData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is already authenticated
    const savedAuthData = localStorage.getItem("jira-auth")
    if (savedAuthData) {
      const parsedAuthData = JSON.parse(savedAuthData)
      setAuthData(parsedAuthData)
      validateAuth(parsedAuthData)
    } else {
      setIsLoading(false)
    }
  }, [])

  const validateAuth = async (authData: AuthData) => {
    try {
      const response = await fetch("http://localhost:3001/api/auth/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(authData),
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setUser(result.user)
        } else {
          localStorage.removeItem("jira-auth")
          setAuthData(null)
        }
      } else {
        localStorage.removeItem("jira-auth")
        setAuthData(null)
      }
    } catch (error) {
      console.error("Auth validation failed:", error)
      localStorage.removeItem("jira-auth")
      setAuthData(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = async (loginData: AuthData) => {
    setIsLoading(true)
    try {
      const response = await fetch("http://localhost:3001/api/auth/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          localStorage.setItem("jira-auth", JSON.stringify(loginData))
          setAuthData(loginData)
          setUser(result.user)
        } else {
          throw new Error("Authentication failed")
        }
      } else {
        throw new Error("Authentication failed")
      }
    } catch (error) {
      console.error("Login failed:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("jira-auth")
    setUser(null)
    setAuthData(null)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user || !authData) {
    return <LoginForm onLogin={handleLogin} />
  }

  return <TimesheetDashboard user={user} authData={authData} onLogout={handleLogout} />
}
