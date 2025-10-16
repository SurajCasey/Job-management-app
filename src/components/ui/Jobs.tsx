import { FaBriefcase, FaTimes, FaTrash, FaCalendar, FaClock } from "react-icons/fa"
import EmptyState from "../shared/EmptyState"
import { useEffect, useState } from "react"
import AddJobForm from "../forms/AddJobForm"
import toast from "react-hot-toast"
import { supabase } from "../../lib/supabaseClient"
import LoadingSpinner from "../shared/LoadingSpinner"
import { deleteJob } from "../../utils/helpers"

interface Job {
  id: string
  job_number: string
  job_type: string
  description?: string
  status: "pending" | "in_progress" | "completed" | "cancelled" | "on_hold"
  priority: "low" | "medium" | "high" | "urgent"
  start_date?: string
  due_date?: string
  hours?: number
  location?: string
  created_at: string
}

const Jobs = () => {
  const [showAddJob, setShowAddJob] = useState(false)
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(false)

  const fetchJobs = async () => {
    try {
      setLoading(true)

      // FIXED: Changed job_type to title, hours to estimated_hours
      const { data: fetchedJobs, error: jobsError } = await supabase
        .from("jobs")
        .select("id, job_number, job_type, description, status, priority, start_date, due_date, hours, location, created_at")
        .order("created_at", { ascending: false })

      if (jobsError) throw jobsError

      setJobs(fetchedJobs || [])
    } catch (error) {
      console.error("Error fetching jobs", error)
      toast.error("Error loading jobs.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJobs()
  }, [])

  const handleAddJob = () => {
    setShowAddJob(true)
  }

  const handleCloseForm = () => {
    setShowAddJob(false)
  }

  const handleJobAdded = () => {
    toast.success("Job added successfully!")
    fetchJobs()
  }

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm("Are you sure you want to delete this job?")) {
      return
    }

    const result = await deleteJob(jobId)

    if (result.success) {
      toast.success("Job deleted successfully.")
      fetchJobs()
    } else {
      toast.error(result.error || "Failed to delete job")
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      in_progress: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      on_hold: "bg-orange-100 text-orange-800",
    }
    return colors[status] || "bg-gray-100 text-gray-800"
  }

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: "text-green-600",
      medium: "text-yellow-600",
      high: "text-orange-600",
      urgent: "text-red-600",
    }
    return colors[priority] || "text-gray-600"
  }

  if (loading) {
    return <LoadingSpinner fullScreen={false} message="Loading jobs..." />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-5xl font-bold text-gray-800 mb-2">Jobs</h1>
            <p className="text-gray-600">Manage and track all your projects</p>
          </div>
          {jobs.length > 0 && !showAddJob && (
            <button
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
              onClick={handleAddJob}
            >
              + Add Job
            </button>
          )}
        </div>

        {showAddJob ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">Add New Job</h2>
              <button
                onClick={handleCloseForm}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FaTimes size={24} className="text-gray-500" />
              </button>
            </div>
            <AddJobForm
              onClose={handleCloseForm}
              onSuccess={handleJobAdded}
            />
          </div>
        ) : jobs.length === 0 ? (
          <EmptyState
            icon={<FaBriefcase size={64} />}
            title="No Jobs Yet"
            description="You haven't added any jobs yet. Click below to add your first job."
            action={{
              label: "Add Job",
              onClick: handleAddJob
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold">{job.job_type}</h3>
                      <p className="text-blue-100 text-sm">{job.job_number}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(job.status)}`}>
                      {job.status.replace("_", " ").toUpperCase()}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-white ${getPriorityColor(job.priority)}`}>
                      {job.priority.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 space-y-4">
                  {job.description && (
                    <p className="text-gray-600 text-sm line-clamp-2">{job.description}</p>
                  )}

                  {/* Location */}
                  {job.location && (
                    <div className="flex items-start gap-2">
                      <span className="text-gray-400 mt-1 flex-shrink-0">📍</span>
                      <span className="text-sm text-gray-700">{job.location}</span>
                    </div>
                  )}

                  {/* Dates and Hours */}
                  <div className="space-y-2">
                    {job.start_date && (
                      <div className="flex items-center gap-2">
                        <FaCalendar className="text-gray-400 text-xs" />
                        <span className="text-xs text-gray-600">
                          Start: {new Date(job.start_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {job.due_date && (
                      <div className="flex items-center gap-2">
                        <FaCalendar className="text-red-400 text-xs" />
                        <span className="text-xs text-gray-600">
                          Due: {new Date(job.due_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {job.hours && (
                      <div className="flex items-center gap-2">
                        <FaClock className="text-blue-400 text-xs" />
                        <span className="text-xs text-gray-600">
                          Hours: {job.hours}h
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer */}
                <div className="bg-gray-50 px-6 py-4 flex gap-2 border-t border-gray-200">
                  <button
                    className="flex-1 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium text-sm"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleDeleteJob(job.id)}
                    className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <FaTrash size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Jobs