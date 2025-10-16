import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { FaBriefcase, FaCheckCircle, FaUserFriends, FaClock, FaCalendarAlt } from "react-icons/fa";
import { supabase } from "../../lib/supabaseClient";
import LoadingSpinner from "../shared/LoadingSpinner";

interface Job {
  id: string;
  job_type: string;
  status: string;
  due_date: string;
  hours: number;
}

const Dashboard = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date());
  const [hoursWorked, setHoursWorked] = useState(0);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("jobs")
        .select("id, job_type, status, due_date, hours")
        .order("due_date", { ascending: true });

      if (error) throw error;

      setJobs(data || []);
      const totalHours = (data || [])
        .filter((job) => job.status === "completed")
        .reduce((acc, curr) => acc + (curr.hours || 0), 0);
      setHoursWorked(totalHours);
    } catch (error) {
      console.error("Error fetching dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const upcomingJobs = jobs
    .filter((job) => new Date(job.due_date) >= new Date())
    .slice(0, 5);

  if (loading) return <LoadingSpinner fullScreen message="Loading Dashboard..." />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold text-gray-800">Dashboard</h1>
          <div className="flex items-center gap-3 text-gray-500">
            <FaCalendarAlt />
            <span>{new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard icon={<FaBriefcase />} label="Total Jobs" value={jobs.length} color="blue" />
          <StatCard icon={<FaCheckCircle />} label="Completed" value={jobs.filter(j => j.status === "completed").length} color="green" />
          <StatCard icon={<FaUserFriends />} label="Active Clients" value={12} color="purple" />
          <StatCard icon={<FaClock />} label="Hours Worked This Week" value={`${hoursWorked}h`} color="orange" />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Calendar</h2>
            <Calendar
              value={date}
              onChange={setDate}
              className="w-full rounded-lg border border-gray-200 shadow-sm p-3"
            />
          </div>

          {/* Upcoming Jobs */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Upcoming Jobs</h2>
            {upcomingJobs.length === 0 ? (
              <p className="text-gray-500 text-center py-6">No upcoming jobs</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {upcomingJobs.map((job) => (
                  <li key={job.id} className="py-4 flex justify-between items-center hover:bg-gray-50 px-3 rounded-lg transition">
                    <div>
                      <p className="text-gray-800 font-medium">{job.job_type}</p>
                      <p className="text-gray-500 text-sm">Due: {new Date(job.due_date).toLocaleDateString()}</p>
                    </div>
                    <span
                      className={`px-3 py-1 text-sm rounded-full ${
                        job.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {job.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <ActivityItem text="John clocked in at 9:00 AM" time="2h ago" />
            <ActivityItem text="New client added: Sunrise Cleaning" time="5h ago" />
            <ActivityItem text="Job #102 marked completed" time="1 day ago" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

// Small components
const StatCard = ({ icon, label, value, color }: { icon: JSX.Element; label: string; value: string | number; color: string }) => {
  const colors: Record<string, string> = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
    orange: "bg-orange-100 text-orange-600",
  };
  return (
    <div className="bg-white shadow-md hover:shadow-lg transition rounded-2xl p-6 flex items-center gap-4">
      <div className={`p-4 rounded-xl ${colors[color]}`}>{icon}</div>
      <div>
        <p className="text-gray-500 text-sm font-medium">{label}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
};

const ActivityItem = ({ text, time }: { text: string; time: string }) => (
  <div className="flex justify-between items-center border-b border-gray-100 pb-3">
    <p className="text-gray-700">{text}</p>
    <span className="text-gray-400 text-sm">{time}</span>
  </div>
);
