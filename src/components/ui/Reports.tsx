import { useState, useEffect } from "react"
import { FaClock, FaDownload, FaCalendar } from "react-icons/fa"
import { supabase } from "../../lib/supabaseClient"
import { useAuth } from "../../hooks/useAuth"
import toast from "react-hot-toast"
import LoadingSpinner from "../shared/LoadingSpinner"
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { FiBarChart } from "react-icons/fi"

interface TimeData {
  date: string
  hours: number
  job_number: string
  job_type: string
}

interface WeeklyStats {
  weekStart: string
  weekEnd: string
  totalHours: number
  jobCount: number
  timeEntries: TimeData[]
  averageDaily: number
}

const Reports = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState<WeeklyStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedWeek, setSelectedWeek] = useState<Date>(new Date())

  useEffect(() => {
    if (user?.id) {
      fetchWeeklyData()
    }
  }, [user?.id, selectedWeek])

  const getWeekDates = (date: Date) => {
    const curr = new Date(date)
    const first = curr.getDate() - curr.getDay()
    const last = first + 6

    const weekStart = new Date(curr.setDate(first))
    const weekEnd = new Date(curr.setDate(last))

    return {
      start: weekStart.toISOString().split('T')[0],
      end: weekEnd.toISOString().split('T')[0],
    }
  }

  const fetchWeeklyData = async () => {
    try {
      setLoading(true)
      const { start, end } = getWeekDates(selectedWeek)

      const { data, error } = await supabase
        .from('time_entries')
        .select(`
          date,
          duration_hours,
          jobs(job_number, job_type)
        `)
        .eq('user_id', user?.id)
        .gte('date', start)
        .lte('date', end)
        .eq('status', 'approved')

      if (error) throw error

      const mappedData: TimeData[] = data?.map(entry => ({
        date: entry.date,
        hours: entry.duration_hours || 0,
        job_number: Array.isArray(entry.jobs) ? entry.jobs[0]?.job_number : entry.jobs?.job_number || 'N/A',
        job_type: Array.isArray(entry.jobs) ? entry.jobs[0]?.job_type : entry.jobs?.job_type || 'N/A',
      })) || []

      const totalHours = mappedData.reduce((sum, entry) => sum + entry.hours, 0)
      const uniqueJobs = new Set(mappedData.map(e => e.job_number)).size
      const averageDaily = mappedData.length > 0 ? totalHours / 7 : 0

      setStats({
        weekStart: start,
        weekEnd: end,
        totalHours: Math.round(totalHours * 100) / 100,
        jobCount: uniqueJobs,
        timeEntries: mappedData,
        averageDaily: Math.round(averageDaily * 100) / 100,
      })
    } catch (error) {
      console.error("Error fetching weekly data:", error)
      toast.error("Failed to load report data")
    } finally {
      setLoading(false)
    }
  }

  const generatePDF = () => {
    if (!stats) return

    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()

    // Header
    doc.setFontSize(20)
    doc.text("Weekly Hours Report", pageWidth / 2, 20, { align: 'center' })

    // Week info
    doc.setFontSize(12)
    doc.text(`Week: ${new Date(stats.weekStart).toLocaleDateString()} - ${new Date(stats.weekEnd).toLocaleDateString()}`, 20, 35)
    doc.text(`Report Generated: ${new Date().toLocaleDateString()}`, 20, 43)

    // Summary stats
    doc.setFontSize(14)
    doc.text("Summary", 20, 55)

    doc.setFontSize(11)
    const summaryData = [
      ['Total Hours', `${stats.totalHours}h`],
      ['Average Daily', `${stats.averageDaily}h`],
      ['Jobs Worked On', `${stats.jobCount}`],
      ['Days Worked', `${stats.timeEntries.length}`],
    ]

    let yPos = 65
    summaryData.forEach(([label, value]) => {
      doc.text(`${label}: ${value}`, 20, yPos)
      yPos += 8
    })

    // Detailed table
    yPos += 10
    doc.setFontSize(14)
    doc.text("Daily Breakdown", 20, yPos)

    yPos += 10
    const tableData = stats.timeEntries.map(entry => [
      new Date(entry.date).toLocaleDateString(),
      entry.job_number,
      entry.job_type,
      `${entry.hours}h`,
    ])

    ;(doc as any).autoTable({
      head: [['Date', 'Job Number', 'Job Type', 'Hours']],
      body: tableData,
      startY: yPos,
      margin: 20,
      theme: 'grid',
      headerStyles: { fillColor: [37, 99, 235], textColor: 255 },
      alternateRowStyles: { fillColor: [240, 240, 240] },
    })

    doc.save(`Weekly-Report-${stats.weekStart}.pdf`)
    toast.success("Report downloaded successfully!")
  }

  if (loading) {
    return <LoadingSpinner fullScreen={false} message="Loading report data..." />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-gray-800 mb-2">Hours Report</h1>
          <p className="text-gray-600">View and export your weekly time tracking reports</p>
        </div>

        {/* Week Selector */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <FaCalendar className="text-blue-600" size={24} />
              <div>
                <p className="text-sm text-gray-600">Select Week</p>
                <input
                  type="date"
                  value={selectedWeek.toISOString().split('T')[0]}
                  onChange={(e) => setSelectedWeek(new Date(e.target.value))}
                  className="mt-1 px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            <button
              onClick={generatePDF}
              disabled={!stats || stats.timeEntries.length === 0}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-semibold"
            >
              <FaDownload /> Download PDF
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow p-6 border-l-4 border-blue-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Total Hours</p>
                  <p className="text-3xl font-bold text-gray-800">{stats.totalHours}</p>
                </div>
                <FaClock className="text-blue-600 text-3xl opacity-20" />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow p-6 border-l-4 border-green-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Average Daily</p>
                  <p className="text-3xl font-bold text-gray-800">{stats.averageDaily}</p>
                </div>
                <FiBarChart className="text-green-600 text-3xl opacity-20" />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow p-6 border-l-4 border-purple-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Jobs</p>
                  <p className="text-3xl font-bold text-gray-800">{stats.jobCount}</p>
                </div>
                <FiBarChart className="text-purple-600 text-3xl opacity-20" />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow p-6 border-l-4 border-orange-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Days Worked</p>
                  <p className="text-3xl font-bold text-gray-800">{stats.timeEntries.length}</p>
                </div>
                <FaCalendar className="text-orange-600 text-3xl opacity-20" />
              </div>
            </div>
          </div>
        )}

        {/* Daily Breakdown Table */}
        {stats && stats.timeEntries.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
              <h2 className="text-2xl font-bold text-white">Daily Breakdown</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Date</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Job Number</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Job Type</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Hours</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {stats.timeEntries.map((entry, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-gray-800">
                        {new Date(entry.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-gray-800 font-medium">{entry.job_number}</td>
                      <td className="px-6 py-4 text-gray-600">{entry.job_type}</td>
                      <td className="px-6 py-4">
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                          {entry.hours}h
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {stats && stats.timeEntries.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <p className="text-gray-600 text-lg">No time entries for this week</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Reports