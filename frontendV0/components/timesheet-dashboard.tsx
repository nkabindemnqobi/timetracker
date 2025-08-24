"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Clock, ChevronLeft, ChevronRight, Calendar, Download, RefreshCw, LogOut, BarChart3 } from "lucide-react"

interface User {
  name: string
  email: string
}

interface AuthData {
  domain: string
  email: string
  apiToken: string
}

interface TimeEntry {
  time: number
  type: string
  timeBreakDown: Array<{ start: string; end: string }>
  summary: string
}

interface Issue {
  key: string
  timeInProgress: number
  dailyHours: {
    Mon: TimeEntry[]
    Tue: TimeEntry[]
    Wed: TimeEntry[]
    Thu: TimeEntry[]
    Fri: TimeEntry[]
    Sat: TimeEntry[]
    Sun: TimeEntry[]
  }
  updated: string
}

interface TimesheetData {
  projectName: string
  issues: Issue[]
  totalHours: number
  summary: string
}

interface TimesheetDashboardProps {
  user: User
  authData: AuthData
  onLogout: () => void
}

export function TimesheetDashboard({ user, authData, onLogout }: TimesheetDashboardProps) {
  const [timesheetData, setTimesheetData] = useState<TimesheetData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentWeek, setCurrentWeek] = useState(new Date())

  const formatWeekRange = (date: Date) => {
    const startOfWeek = new Date(date)
    startOfWeek.setDate(date.getDate() - date.getDay() + 1) // Monday
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6) // Sunday

    const formatDate = (d: Date) => d.toISOString().split("T")[0]
    return `${formatDate(startOfWeek)}_${formatDate(endOfWeek)}`
  }

  const getWeekNumber = (date: Date) => {
    const startOfYear = new Date(date.getFullYear(), 0, 1)
    const pastDaysOfYear = (date.getTime() - startOfYear.getTime()) / 86400000
    return Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7)
  }

  const fetchTimesheetData = async () => {
    setIsLoading(true)
    try {
      const weekRange = formatWeekRange(currentWeek)
      const params = new URLSearchParams({
        domain: authData.domain,
        email: authData.email,
        apiToken: authData.apiToken,
      })

      const response = await fetch(`http://localhost:3001/api/timesheet/${weekRange}?${params}`)

      if (response.ok) {
        const data = await response.json()
        setTimesheetData(data)
      } else {
        console.error("Failed to fetch timesheet data")
      }
    } catch (error) {
      console.error("Error fetching timesheet data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTimesheetData()
  }, [currentWeek])

  const navigateWeek = (direction: "prev" | "next") => {
    const newWeek = new Date(currentWeek)
    newWeek.setDate(currentWeek.getDate() + (direction === "next" ? 7 : -7))
    setCurrentWeek(newWeek)
  }

  const exportCSV = () => {
    if (!timesheetData) return

    // Simple CSV export logic
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Project,Issue,Type,Day,Hours\n" +
      timesheetData.issues
        .map((issue) =>
          Object.entries(issue.dailyHours)
            .map(([day, entries]) =>
              entries
                .map(
                  (entry) => `${timesheetData.projectName},${issue.key},${entry.type},${day},${entry.time.toFixed(2)}`,
                )
                .join("\n"),
            )
            .join("\n"),
        )
        .join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `timesheet-${formatWeekRange(currentWeek)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getDayTotal = (day: keyof Issue["dailyHours"]) => {
    if (!timesheetData) return 0
    return timesheetData.issues.reduce((total, issue) => {
      return total + issue.dailyHours[day].reduce((dayTotal, entry) => dayTotal + entry.time, 0)
    }, 0)
  }

  const getProjectTypeTotal = (type: string) => {
    if (!timesheetData) return 0
    return timesheetData.issues.reduce((total, issue) => {
      return (
        total +
        Object.values(issue.dailyHours)
          .flat()
          .reduce((typeTotal, entry) => {
            return entry.type.toLowerCase() === type.toLowerCase() ? typeTotal + entry.time : typeTotal
          }, 0)
      )
    }, 0)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Jira Time Tracker</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Welcome, {user.name}</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuItem onClick={onLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Week Navigation */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => navigateWeek("prev")}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Timesheet Period (Week {getWeekNumber(currentWeek)})</span>
              <span className="text-sm text-muted-foreground">{formatWeekRange(currentWeek).replace("_", " - ")}</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigateWeek("next")}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchTimesheetData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Fetch from Jira
            </Button>
            <Button variant="outline" size="sm" onClick={exportCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {timesheetData && (
          <>
            {/* Daily Totals */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Daily Totals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-8 gap-4 text-center">
                  <div className="font-medium">Project</div>
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                    <div key={day} className="font-medium text-muted-foreground">
                      {day}
                    </div>
                  ))}
                  <div className="font-medium">{timesheetData.projectName}</div>
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                    <div key={day} className="text-sm">
                      {getDayTotal(day as keyof Issue["dailyHours"]).toFixed(2)}h
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Project Details */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {timesheetData.issues.map((issue) => (
                    <div key={issue.key} className="border rounded-lg p-4">
                      <div className="grid grid-cols-9 gap-4 items-center text-sm">
                        <div className="font-medium text-accent">{issue.key}</div>
                        <div className="grid grid-cols-7 col-span-7 gap-4 text-center">
                          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => {
                            const dayEntries = issue.dailyHours[day as keyof Issue["dailyHours"]]
                            return (
                              <div key={day} className="space-y-1">
                                {dayEntries.length > 0 ? (
                                  dayEntries.map((entry, idx) => (
                                    <div key={idx} className="space-y-1">
                                      <div className="text-xs font-medium">{entry.time.toFixed(2)}h</div>
                                      <Badge
                                        variant={entry.type.toLowerCase() === "bug" ? "destructive" : "secondary"}
                                        className="text-xs"
                                      >
                                        {entry.type.toUpperCase()}
                                      </Badge>
                                    </div>
                                  ))
                                ) : (
                                  <div className="text-muted-foreground">-</div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                        <div className="font-medium">{issue.timeInProgress.toFixed(2)}h</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Weekly Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Weekly Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-primary">{timesheetData.totalHours.toFixed(1)}h</div>
                    <div className="text-sm text-muted-foreground">Total Hours</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-chart-3">{getProjectTypeTotal("dev").toFixed(1)}h</div>
                    <div className="text-sm text-muted-foreground">Development</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-destructive">{getProjectTypeTotal("bug").toFixed(1)}h</div>
                    <div className="text-sm text-muted-foreground">Bug Fixes</div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{timesheetData.summary}</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
