import { useState, useEffect } from "react"
import { FaDownload, FaCalendar } from "react-icons/fa"
import { supabase } from "../../lib/supabaseClient"
import { useAuth } from "../../hooks/useAuth"
import toast from "react-hot-toast"
import LoadingSpinner from "../shared/LoadingSpinner"
import jsPDF from "jspdf"
import "jspdf-autotable"


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
      start: weekStart.toISOString().split("T")[0],
      end: weekEnd.toISOString().split("T")[0],
    }
  }

  const fetchWeeklyData = async () => {
    try {
      setLoading(true)
      const { start, end } = getWeekDates(selectedWeek)

      const { data, error } = await supabase
        .from("time_entries")
        .select(`
          date,
          duration_hours,
          jobs(job_number, job_type)
        `)
        .eq("user_id", user?.id)
        .gte("date", start)
        .lte("date", end)
        .eq("status", "approved")

      if (error) throw error

      const mappedData: TimeData[] =
        (data as any[])?.map((entry) => {
          const job = Array.isArray(entry.jobs) ? entry.jobs[0] : entry.jobs
          return {
            date: entry.date,
            hours: entry.duration_hours || 0,
            job_number: job?.job_number || "N/A",
            job_type: job?.job_type || "N/A",
          }
        }) || []

      const totalHours = mappedData.reduce((sum, entry) => sum + entry.hours, 0)
      const uniqueJobs = new Set(mappedData.map((e) => e.job_number)).size
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

    // Header
    doc.setFontSize(20)
    doc.text("Weekly Hours Report", pageWidth / 2, 20, { align: "center" })

    // Week info
    doc.setFontSize(12)
    doc.text(
      `Week: ${new Date(stats.weekStart).toLocaleDateString()} - ${new Date(
        stats.weekEnd
      ).toLocaleDateString()}`,
      20,
      35
    )
    doc.text(`Report Generated: ${new Date().toLocaleDateString()}`, 20, 43)

    // Summary stats
    doc.setFontSize(14)
    doc.text("Summary", 20, 55)

    doc.setFontSize(11)
    const summaryData = [
      ["Total Hours", `${stats.totalHours}h`],
      ["Average Daily", `${stats.averageDaily}h`],
      ["Jobs Worked On", `${stats.jobCount}`],
      ["Days Worked", `${stats.timeEntries.length}`],
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
    const tableData = stats.timeEntries.map((entry) => [
      new Date(entry.date).toLocaleDateString(),
      entry.job_number,
      entry.job_type,
      `${entry.hours}h`,
    ])

    ;(doc as any).autoTable({
      head: [["Date", "Job Number", "Job Type", "Hours"]],
      body: tableData,
      startY: yPos,
      margin: 20,
      theme: "grid",
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
                  value={selectedWeek.toISOString().split("T")[0]}
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

        {/* Summary + Breakdown sections unchanged */}
        {/* ... */}
      </div>
    </div>
  )
}

export default Reports
