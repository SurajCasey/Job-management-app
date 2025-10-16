import { useState, useEffect } from "react"
import { FaCalendarAlt, FaBriefcase, FaUsers, FaClock, FaCheckCircle } from "react-icons/fa"
import { supabase } from "../../lib/supabaseClient"
import { useAuth } from "../../hooks/useAuth"
import toast from "react-hot-toast"
import LoadingSpinner from "../shared/LoadingSpinner"
import { FaArrowTrendUp } from "react-icons/fa6"

interface DashboardStats {
  totalJobs: number
  completedJobs: number
  activeJobs: number
  totalClients: number
  hoursThisWeek: number
  upcomingJobs: Array<{
    id: string
    job_number: string
    job_type: string
    due_date: string
    priority: string
  }>
  recentActivity: Array<{
    id: string
    type: string
    description: string
    timestamp: string
  }>
}

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalJobs: 0,
    completedJobs: 0,
    activeJobs: 0,
    totalClients: 0,
    hoursThisWeek: 0,
    upcomingJobs: [],
    recentActivity: [],
  })
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date())

  useEffect(() => {
    if (user?.id) {
      fetchDashboardData()
    }
  }, [user?.id])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      // Fetch jobs stats
      const { data: jobs, error: jobsError } = await supabase
        .from('jobs')
        .select('id, status')

      if (jobsError) throw jobsError

      const totalJobs = jobs?.length || 0
      const completedJobs = jobs?.filter(j => j.status === 'completed').length || 0
      const activeJobs = jobs?.filter(j => j.status === 'in_progress').length || 0

      // Fetch clients count
      const { data: clients, error: clientsError } = await supabase
        .from('clients')
        .select('id')

      if (clientsError) throw clientsError
      const totalClients = clients?.length || 0

      // Fetch upcoming jobs
      const today = new Date().toISOString().split('T')[0]
      const thirtyDaysLater = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0]

      const { data: upcomingJobs, error: upcomingError } = await supabase
        .from('jobs')
        .select('id, job_number, job_type, due_date, priority')
        .gte('due_date', today)
        .lte('due_date', thirtyDaysLater)
        .order('due_date', { ascending: true })
        .limit(5)

      if (upcomingError) throw upcomingError

      // Fetch hours this week
      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - weekStart.getDay())
      const weekStartStr = weekStart.toISOString().split('T')[0]

      const { data: timeEntries, error: timeError } = await supabase
        .from('time_entries')
        .select('duration_hours')
        .eq('user_id', user?.id)
        .gte('date', weekStartStr)
        .eq('status', 'approved')

      if (timeError) throw timeError
      const hoursThisWeek = timeEntries?.reduce((sum, entry) => sum + (entry.duration_hours || 0), 0) || 0

      // Build recent activity
      const recentActivity = [
        ...upcomingJobs!.map(job => ({
          id: job.id,
          type: 'job',
          description: `Job ${job.job_number} due on ${new Date(job.due_date).toLocaleDateString()}`,
          timestamp: job.due_date,
        })),
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5)

      setStats({
        totalJobs,
        completedJobs,
        activeJobs,
        totalClients,
        hoursThisWeek: Math.round(hoursThisWeek * 100) / 100,
        upcomingJobs: upcomingJobs || [],
        recentActivity,
      })
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      toast.error("Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const currentMonth = selectedDate.getMonth()
  const currentYear = selectedDate.getFullYear()
  const daysInMonth = getDaysInMonth(selectedDate)
  const firstDay = getFirstDayOfMonth(selectedDate)

  const calendarDays: (number | null)[] = [
    ...Array.from({ length: firstDay }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  if (loading) {
    return <LoadingSpinner fullScreen={false} message="Loading dashboard..." />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-gray-800 mb-2">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's your work overview</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Jobs */}
          <div className="bg-white rounded-2xl shadow p-6 border-l-4 border-blue-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Total Jobs</p>
                <p className="text-3xl font-bold text-gray-800">{stats.totalJobs}</p>
              </div>
              <FaBriefcase className="text-blue-600 text-3xl opacity-20" />
            </div>
          </div>

          {/* Completed Jobs */}
          <div className="bg-white rounded-2xl shadow p-6 border-l-4 border-green-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Completed</p>
                <p className="text-3xl font-bold text-gray-800">{stats.completedJobs}</p>
              </div>
              <FaCheckCircle className="text-green-600 text-3xl opacity-20" />
            </div>
          </div>

          {/* Active Jobs */}
          <div className="bg-white rounded-2xl shadow p-6 border-l-4 border-orange-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Active Jobs</p>
                <p className="text-3xl font-bold text-gray-800">{stats.activeJobs}</p>
              </div>
              <FaArrowTrendUp className="text-orange-600 text-3xl opacity-20" />
            </div>
          </div>

          {/* Active Clients */}
          <div className="bg-white rounded-2xl shadow p-6 border-l-4 border-purple-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Active Clients</p>
                <p className="text-3xl font-bold text-gray-800">{stats.totalClients}</p>
              </div>
              <FaUsers className="text-purple-600 text-3xl opacity-20" />
            </div>
          </div>

          {/* Hours This Week */}
          <div className="bg-white rounded-2xl shadow p-6 border-l-4 border-cyan-600 col-span-1 md:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Hours This Week</p>
                <p className="text-3xl font-bold text-gray-800">{stats.hoursThisWeek}</p>
              </div>
              <FaClock className="text-cyan-600 text-3xl opacity-20" />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar */}
          <div className="bg-white rounded-2xl shadow-lg p-6 lg:col-span-1">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Calendar</h2>
              <FaCalendarAlt className="text-blue-600" />
            </div>

            <div className="space-y-4">
              {/* Month Navigation */}
              <div className="flex justify-between items-center mb-4">
                <button
                  onClick={() => setSelectedDate(new Date(currentYear, currentMonth - 1))}
                  className="px-3 py-1 text-sm hover:bg-gray-100 rounded"
                >
                  ←
                </button>
                <h3 className="font-semibold text-gray-800">
                  {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h3>
                <button
                  onClick={() => setSelectedDate(new Date(currentYear, currentMonth + 1))}
                  className="px-3 py-1 text-sm hover:bg-gray-100 rounded"
                >
                  →
                </button>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-xs font-semibold text-gray-600">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => (
                  <div
                    key={index}
                    className={`aspect-square flex items-center justify-center rounded text-sm font-medium ${
                      day === null
                        ? ''
                        : day === new Date().getDate() &&
                          currentMonth === new Date().getMonth() &&
                          currentYear === new Date().getFullYear()
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {day}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Upcoming Jobs and Recent Activity */}
          <div className="lg:col-span-2 space-y-8">
            {/* Upcoming Jobs */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Upcoming Jobs (Next 30 Days)</h2>
              {stats.upcomingJobs.length === 0 ? (
                <p className="text-gray-500">No upcoming jobs scheduled</p>
              ) : (
                <div className="space-y-3">
                  {stats.upcomingJobs.map(job => (
                    <div key={job.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                      <div>
                        <h3 className="font-semibold text-gray-800">{job.job_number}</h3>
                        <p className="text-sm text-gray-600">{job.job_type}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-800">
                          {new Date(job.due_date).toLocaleDateString()}
                        </p>
                        <span className={`inline-block text-xs font-semibold px-2 py-1 rounded-full mt-1 ${
                          job.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                          job.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                          job.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {job.priority.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Recent Activity</h2>
              {stats.recentActivity.length === 0 ? (
                <p className="text-gray-500">No recent activity</p>
              ) : (
                <div className="space-y-3">
                  {stats.recentActivity.map(activity => (
                    <div key={activity.id} className="flex items-start gap-4 p-3 border-l-4 border-blue-600 bg-blue-50 rounded">
                      <div className="w-2 h-2 rounded-full bg-blue-600 mt-2"></div>
                      <div>
                        <p className="font-medium text-gray-800">{activity.description}</p>
                        <p className="text-xs text-gray-600">
                          {new Date(activity.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard