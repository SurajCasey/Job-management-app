import { useState, useEffect } from "react"
import { FaFile, FaUpload, FaTrash, FaDownload, FaFilter, FaTimes } from "react-icons/fa"
import { supabase } from "../../lib/supabaseClient"
import { useAuth } from "../../hooks/useAuth"
import toast from "react-hot-toast"
import LoadingSpinner from "../shared/LoadingSpinner"
import EmptyState from "../shared/EmptyState"

interface FileRecord {
  id: string
  name: string
  file_path: string
  file_type: string
  file_size: number
  job_id: string | null
  description: string
  uploaded_by: string
  created_at: string
  category: string
}

interface Job {
  id: string
  job_number: string
  job_type: string
}

const Files = () => {
  const { user } = useAuth()
  const [files, setFiles] = useState<FileRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [jobs, setJobs] = useState<Job[]>([])
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [formData, setFormData] = useState({
    file: null as File | null,
    description: "",
    category: "SWMS",
    job_id: "",
  })

  const categories = ["SWMS", "Prestart Cleaning", "Safety Manual", "Other"]

  useEffect(() => {
    if (user?.id) {
      fetchFiles()
      fetchJobs()
    }
  }, [user?.id])

  const fetchFiles = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('files')
        .select('id, name, file_path, file_type, file_size, job_id, description, uploaded_by, created_at')
        .order('created_at', { ascending: false })

      if (error) throw error

      const mappedFiles = data?.map(f => ({
        ...f,
        category: categorizeFile(f.name),
      })) || []

      setFiles(mappedFiles)
    } catch (error) {
      console.error("Error fetching files:", error)
      toast.error("Failed to load files")
    } finally {
      setLoading(false)
    }
  }

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('id, job_number, job_type')
        .order('created_at', { ascending: false })

      if (error) throw error
      setJobs(data || [])
    } catch (error) {
      console.error("Error fetching jobs:", error)
    }
  }

  const categorizeFile = (filename: string): string => {
    const lower = filename.toLowerCase()
    if (lower.includes('swms')) return 'SWMS'
    if (lower.includes('prestart') || lower.includes('cleaning')) return 'Prestart Cleaning'
    if (lower.includes('safety')) return 'Safety Manual'
    return 'Other'
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFormData(prev => ({ ...prev, file: e.target.files![0] }))
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.file) {
      toast.error("Please select a file")
      return
    }

    setUploading(true)

    try {
      const { user: currentUser } = await supabase.auth.getUser().then(r => r.data)
      if (!currentUser) throw new Error("Not authenticated")

      // Upload file to storage
      const filename = `${Date.now()}-${formData.file.name}`
      const { error: uploadError } = await supabase.storage
        .from('job-files')
        .upload(`files/${filename}`, formData.file)

      if (uploadError) throw uploadError

      // Save file record to database
      const { error: insertError } = await supabase
        .from('files')
        .insert({
          name: formData.file.name,
          file_path: `files/${filename}`,
          file_type: formData.file.type,
          file_size: formData.file.size,
          job_id: formData.job_id || null,
          description: formData.description,
          uploaded_by: user?.id,
          created_at: new Date().toISOString(),
        })

      if (insertError) throw insertError

      toast.success("File uploaded successfully!")
      setFormData({ file: null, description: "", category: "SWMS", job_id: "" })
      setShowUploadForm(false)
      fetchFiles()
    } catch (error) {
      console.error("Error uploading file:", error)
      toast.error("Failed to upload file")
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteFile = async (fileId: string, filePath: string) => {
    if (!confirm("Delete this file?")) return

    try {
      // Delete from storage
      await supabase.storage.from('job-files').remove([filePath])

      // Delete from database
      await supabase.from('files').delete().eq('id', fileId)

      toast.success("File deleted")
      fetchFiles()
    } catch (error) {
      console.error("Error deleting file:", error)
      toast.error("Failed to delete file")
    }
  }

  const handleDownloadFile = async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('job-files')
        .download(filePath)

      if (error) throw error

      const url = URL.createObjectURL(data)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error downloading file:", error)
      toast.error("Failed to download file")
    }
  }

  const filteredFiles = categoryFilter === "all"
    ? files
    : files.filter(f => f.category === categoryFilter)

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i]
  }

  if (loading) {
    return <LoadingSpinner fullScreen={false} message="Loading files..." />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-5xl font-bold text-gray-800 mb-2">Document Library</h1>
            <p className="text-gray-600">Manage SWMS, prestart forms, and safety documents</p>
          </div>
          <button
            onClick={() => setShowUploadForm(!showUploadForm)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold flex items-center gap-2"
          >
            <FaUpload /> Upload File
          </button>
        </div>

        {/* Upload Form */}
        {showUploadForm && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Upload New File</h2>
              <button
                onClick={() => setShowUploadForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes size={24} />
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">File</label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                />
                {formData.file && (
                  <p className="text-sm text-gray-600 mt-2">
                    Selected: {formData.file.name} ({formatFileSize(formData.file.size)})
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Job (Optional)</label>
                  <select
                    value={formData.job_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, job_id: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  >
                    <option value="">Select a job...</option>
                    {jobs.map(job => (
                      <option key={job.id} value={job.id}>
                        {job.job_number} - {job.job_type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Add notes about this file..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg min-h-[100px]"
                />
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowUploadForm(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {uploading ? "Uploading..." : "Upload"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filter */}
        <div className="bg-white rounded-2xl shadow p-6 mb-8">
          <div className="flex items-center gap-2 mb-3">
            <FaFilter className="text-gray-600" />
            <span className="font-semibold text-gray-700">Filter by Category</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCategoryFilter("all")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                categoryFilter === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              All Files
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  categoryFilter === cat
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Files List */}
        {filteredFiles.length === 0 ? (
          <EmptyState
            icon={<FaFile size={64} />}
            title="No Files"
            description="No documents uploaded yet"
            action={{ label: "Upload File", onClick: () => setShowUploadForm(true) }}
          />
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredFiles.map(file => (
              <div
                key={file.id}
                className="bg-white rounded-2xl shadow p-6 hover:shadow-lg transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="bg-blue-100 rounded-lg p-3">
                      <FaFile className="text-blue-600 text-2xl" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-800">{file.name}</h3>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                          {file.category}
                        </span>
                        <span className="text-xs text-gray-600">
                          {formatFileSize(file.file_size)}
                        </span>
                        <span className="text-xs text-gray-600">
                          {new Date(file.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {file.description && (
                        <p className="text-sm text-gray-600 mt-2">{file.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDownloadFile(file.file_path, file.name)}
                      className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100"
                      title="Download"
                    >
                      <FaDownload />
                    </button>
                    <button
                      onClick={() => handleDeleteFile(file.id, file.file_path)}
                      className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Files
