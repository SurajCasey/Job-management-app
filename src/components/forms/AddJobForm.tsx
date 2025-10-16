import { useState } from "react"
import toast from "react-hot-toast"
import { addJob } from "../../utils/helpers"

interface AddJobFormProps {
  onClose: () => void
  onSuccess?: () => void
}

const AddJobForm = ({ onClose, onSuccess }: AddJobFormProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    job_number: "",
    title: "",
    description: "",
    status: "pending",
    priority: "medium",
    start_date: "",
    due_date: "",
    hours: "",
    location: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.job_number.trim()) {
      toast.error("Job number is required")
      return
    }
    if (!formData.title.trim()) {
      toast.error("Job title is required")
      return
    }

    setIsLoading(true)

    try {
      const result = await addJob({
        job_number: formData.job_number,
        title: formData.title,
        description: formData.description,
        status: formData.status as "pending" | "in_progress" | "completed" | "cancelled" | "on_hold",
        priority: formData.priority as "low" | "medium" | "high" | "urgent",
        start_date: formData.start_date || null,
        due_date: formData.due_date || null,
        hours: formData.hours ? parseFloat(formData.hours) : null,
        location: formData.location || null,
      })

      if (!result.success) {
        toast.error(result.error || "Failed to add job")
        return
      }

      toast.success("Job added successfully!")
      setFormData({
        job_number: "",
        title: "",
        description: "",
        status: "pending",
        priority: "medium",
        start_date: "",
        due_date: "",
        hours: "",
        location: "",
      })

      if (onSuccess) onSuccess()
      onClose()
    } catch (error) {
      console.error("Error adding job", error)
      toast.error("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Job Number */}
        <div className="fieldset">
          <label className="label" htmlFor="job-number">
            Job Number *
          </label>
          <input
            id="job-number"
            name="job_number"
            type="text"
            className="input w-full"
            placeholder="e.g., JOB-001"
            value={formData.job_number}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
        </div>

        {/* Title */}
        <div className="fieldset">
          <label className="label" htmlFor="title">
            Job Title *
          </label>
          <input
            id="title"
            name="title"
            type="text"
            className="input w-full"
            placeholder="Enter job title"
            value={formData.title}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Description */}
      <div className="fieldset">
        <label className="label" htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          className="input w-full min-h-[100px]"
          placeholder="Enter job description"
          value={formData.description}
          onChange={handleChange}
          disabled={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Status */}
        <div className="fieldset">
          <label className="label" htmlFor="status">
            Status
          </label>
          <select
            id="status"
            name="status"
            className="input w-full"
            value={formData.status}
            onChange={handleChange}
            disabled={isLoading}
          >
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="on_hold">On Hold</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Priority */}
        <div className="fieldset">
          <label className="label" htmlFor="priority">
            Priority
          </label>
          <select
            id="priority"
            name="priority"
            className="input w-full"
            value={formData.priority}
            onChange={handleChange}
            disabled={isLoading}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Start Date */}
        <div className="fieldset">
          <label className="label" htmlFor="start_date">
            Start Date
          </label>
          <input
            id="start_date"
            name="start_date"
            type="date"
            className="input w-full"
            value={formData.start_date}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>

        {/* Due Date */}
        <div className="fieldset">
          <label className="label" htmlFor="due_date">
            Due Date
          </label>
          <input
            id="due_date"
            name="due_date"
            type="date"
            className="input w-full"
            value={formData.due_date}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Hours */}
        <div className="fieldset">
          <label className="label" htmlFor="hours">
            Hours
          </label>
          <input
            id="hours"
            name="hours"
            type="number"
            step="0.5"
            className="input w-full"
            placeholder="e.g., 40"
            value={formData.hours}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>

        {/* Location */}
        <div className="fieldset">
          <label className="label" htmlFor="location">
            Location
          </label>
          <input
            id="location"
            name="location"
            type="text"
            className="input w-full"
            placeholder="Enter job location"
            value={formData.location}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Adding..." : "Add Job"}
        </button>
      </div>
    </form>
  )
}

export default AddJobForm