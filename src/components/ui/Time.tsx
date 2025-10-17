import { useState, useEffect } from "react"
import { FaClock, FaPlay, FaPause, FaCheckCircle } from "react-icons/fa"
import toast from "react-hot-toast"
import { supabase } from "../../lib/supabaseClient"
import { useAuth } from "../../hooks/useAuth"
import { logTime, updateTimeEntry, completeJob } from "../../utils/helpers"
import LoadingSpinner from "../shared/LoadingSpinner"

interface Job {
  id: string
  job_number: string
  job_type: string
  status: string
}

interface TimeEntry {
  id: string
  job_id: string
  job: Job
  start_time: string
  end_time?: string
  duration_hours?: number
  date: string
}

const Time = () => {
  const { user } = useAuth()
  const [todaysJobs, setTodaysJobs] = useState<Job[]>([])
  const [selectedJob, setSelectedJob] = useState<string>("")
  const [isClocked, setIsClocked] = useState(false)
  const [clockedInTime, setClockedInTime] = useState<string>("")
  const [currentTime, setCurrentTime] = useState<string>(new Date().toLocaleTimeString())
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [currentTimeEntryId, setCurrentTimeEntryId] = useState<string>("")
  const [completingJob, setCompletingJob] = useState(false)
  const [loading, setLoading] = useState(false)

  // Update current time every second
useEffect(() => {
  const interval = setInterval(() => {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });

    // Convert AM/PM to uppercase
    setCurrentTime(timeString.replace(/am|pm/, match => match.toUpperCase()));
  }, 1000);

  return () => clearInterval(interval);
}, []);

  // Fetch today's jobs
  const fetchTodaysJobs = async () => {
    try {
      setLoading(true)
      const today = new Date().toISOString().split('T')[0]

      const { data, error } = await supabase
        .from('jobs')
        .select('id, job_number, job_type, status')
        .or(`start_date.eq.${today},due_date.eq.${today}`)
        .in('status', ['pending', 'in_progress'])

      if (error) throw error
      setTodaysJobs(data || [])
    } catch (error) {
      console.error("Error fetching jobs:", error)
      toast.error("Failed to load today's jobs")
    } finally {
      setLoading(false)
    }
  }

  // Fetch today's time entries
  const fetchTodaysTimeEntries = async () => {
    if (!user?.id) return
    try {
      const today = new Date().toISOString().split('T')[0]

      const { data, error } = await supabase
        .from('time_entries')
        .select(`
          id,
          job_id,
          start_time,
          end_time,
          duration_hours,
          date,
          jobs(id, job_number, job_type, status)
        `)
        .eq('user_id', user.id)
        .eq('date', today)
        .order('start_time', { ascending: false })

      if (error) throw error

      const mappedData = data?.map((entry: any) => ({
        id: entry.id,
        job_id: entry.job_id,
        start_time: entry.start_time,
        end_time: entry.end_time,
        duration_hours: entry.duration_hours,
        date: entry.date,
        job: Array.isArray(entry.jobs) ? entry.jobs[0] : entry.jobs,
      })) || []

      setTimeEntries(mappedData)

      // Restore active clock state if an entry is running
      const activeEntry = mappedData.find((entry) => !entry.end_time)
      if (activeEntry) {
        setIsClocked(true)
        setClockedInTime(activeEntry.start_time)
        setCurrentTimeEntryId(activeEntry.id)
        setSelectedJob(activeEntry.job_id)
      } else {
        setIsClocked(false)
        setClockedInTime("")
        setCurrentTimeEntryId("")
        setSelectedJob("")
      }
    } catch (error) {
      console.error("Error fetching time entries:", error)
    }
  }

  useEffect(() => {
    if (user?.id) {
      fetchTodaysJobs()
      fetchTodaysTimeEntries()
    }
  }, [user?.id])

  const handleClockIn = async () => {
    if (!selectedJob) return toast.error("Please select a job")

    const now = new Date()
    const timeStr = now.toLocaleTimeString("en-US", { hour12: true }).slice(0, 8)
    const today = now.toISOString().split('T')[0]

    const result = await logTime({ job_id: selectedJob, date: today, start_time: timeStr })
    if (result.success) {
      toast.success("Clocked in successfully!")
      setIsClocked(true)
      setClockedInTime(timeStr)
      setCurrentTimeEntryId(result.timeEntryId || "")
      fetchTodaysTimeEntries()
    } else {
      toast.error(result.error || "Failed to clock in")
    }
  }

  const handleClockOut = async () => {
    if (!currentTimeEntryId) return toast.error("No active clock in")

    const now = new Date()
    const timeStr = now.toLocaleTimeString("en-US", { hour12: true }).slice(0, 8)

    const result = await updateTimeEntry(currentTimeEntryId, timeStr)
    if (result.success) {
      toast.success("Clocked out successfully!")
      setIsClocked(false)
      setClockedInTime("")
      setCurrentTimeEntryId("")
      setSelectedJob("")
      fetchTodaysTimeEntries()
    } else {
      toast.error(result.error || "Failed to clock out")
    }
  }

  const handleCompleteJob = async () => {
    if (!selectedJob) return toast.error("No job selected")
    setCompletingJob(true)
    const result = await completeJob(selectedJob)
    if (result.success) {
      toast.success("Job marked as completed!")
      setSelectedJob("")
      fetchTodaysJobs()
    } else {
      toast.error(result.error || "Failed to complete job")
    }
    setCompletingJob(false)
  }

  if (loading) return <LoadingSpinner fullScreen={false} message="Loading..." />

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold text-gray-800 mb-2">Time Tracking</h1>
        <p className="text-gray-600 mb-8">Clock in and out for your daily work</p>

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Time display */}
            <div className="flex flex-col justify-center items-center bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-8">
              <FaClock className="text-blue-600 mb-4" size={48} />
              <p className="text-gray-600 text-sm mb-2">Current Time</p>
              <p className="text-5xl font-bold text-blue-600 font-mono">{currentTime}</p>
              {isClocked && (
                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600 mb-2">Clocked In Since</p>
                  <p className="text-2xl font-semibold text-green-600">{clockedInTime}</p>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Select Job</label>
                <select
                  value={selectedJob}
                  onChange={(e) => setSelectedJob(e.target.value)}
                  disabled={isClocked}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                >
                  <option value="">Choose a job...</option>
                  {todaysJobs.map((job) => (
                    <option key={job.id} value={job.id}>
                      {job.job_number} - {job.job_type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-4">
                {!isClocked ? (
                  <button onClick={handleClockIn} disabled={!selectedJob} className="flex-1 bg-green-600 text-white py-4 rounded-lg hover:bg-green-700 font-semibold flex items-center justify-center gap-2 transition-colors">
                    <FaPlay size={20} /> Clock In
                  </button>
                ) : (
                  <button onClick={handleClockOut} className="flex-1 bg-red-600 text-white py-4 rounded-lg hover:bg-red-700 font-semibold flex items-center justify-center gap-2 transition-colors">
                    <FaPause size={20} /> Clock Out
                  </button>
                )}
              </div>

              {isClocked && (
                <button
                  onClick={handleCompleteJob}
                  disabled={!selectedJob || completingJob}
                  className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 disabled:bg-gray-300 font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <FaCheckCircle size={18} />
                  {completingJob ? "Processing..." : "Mark Complete"}
                </button>
              )}

              <div className="flex items-center justify-center gap-2 p-3 bg-blue-50 rounded-lg">
                <div className={`w-3 h-3 rounded-full ${isClocked ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span className="font-medium text-gray-700">{isClocked ? "Clocked In" : "Clocked Out"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Time entries */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
            <h2 className="text-2xl font-bold text-white">Today's Time Entries</h2>
          </div>

          {timeEntries.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>No time entries yet today</p>
            </div>
          ) : (
            <div className="divide-y">
              {timeEntries.map((entry) => (
                <div key={entry.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-800">{entry.job.job_number} - {entry.job.job_type}</h3>
                      <p className="text-sm text-gray-600 mt-1">{entry.start_time} {entry.end_time && `- ${entry.end_time}`}</p>
                    </div>
                    <div className="text-right">
                      {(() => {
                        const totalHours = entry.duration_hours || 0;
                        const hours = Math.floor(totalHours);
                        const minutes = Math.round((totalHours - hours) * 60);
                        return (
                          <p className="text-2xl font-bold text-blue-600">
                            {hours}h {minutes}m
                          </p>
                        );
                      })()}
                      
                      {!entry.end_time && (
                        <span className="inline-block mt-2 px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                          Pending
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Time
