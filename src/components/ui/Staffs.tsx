import { useState, useEffect } from "react"
import { FaUsers, FaUserCheck, FaUserClock, FaMailBulk, FaCalendar } from "react-icons/fa"
import { supabase } from "../../lib/supabaseClient"
import toast from "react-hot-toast"
import LoadingSpinner from "../shared/LoadingSpinner"
import EmptyState from "../shared/EmptyState"

interface StaffMember {
  id: string
  name: string
  email: string
  role: string
  approved_by_admin: boolean
  created_at: string
}

interface StaffStats {
  totalStaff: number
  activeStaff: number
  pendingApproval: number
  adminCount: number
}

const Staff = () => {
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [filteredStaff, setFilteredStaff] = useState<StaffMember[]>([])
  const [stats, setStats] = useState<StaffStats>({
    totalStaff: 0,
    activeStaff: 0,
    pendingApproval: 0,
    adminCount: 0,
  })
  const [loading, setLoading] = useState(true)
  const [filterRole, setFilterRole] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState<string>("")

  useEffect(() => {
    fetchStaff()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [staff, filterRole, searchTerm])

  const fetchStaff = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, role, approved_by_admin, created_at')
        .order('created_at', { ascending: false })

      if (error) throw error

      setStaff(data || [])

      // Calculate stats
      const total = data?.length || 0
      const active = data?.filter(u => u.approved_by_admin).length || 0
      const pending = data?.filter(u => !u.approved_by_admin).length || 0
      const admins = data?.filter(u => u.role === 'admin' && u.approved_by_admin).length || 0

      setStats({
        totalStaff: total,
        activeStaff: active,
        pendingApproval: pending,
        adminCount: admins,
      })
    } catch (error) {
      console.error("Error fetching staff:", error)
      toast.error("Failed to load staff")
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = staff

    // Filter by role
    if (filterRole === "admin") {
      filtered = filtered.filter(s => s.role === "admin")
    } else if (filterRole === "employee") {
      filtered = filtered.filter(s => s.role === "employee")
    } else if (filterRole === "pending") {
      filtered = filtered.filter(s => !s.approved_by_admin)
    } else if (filterRole === "active") {
      filtered = filtered.filter(s => s.approved_by_admin)
    }

    // Search by name or email
    if (searchTerm) {
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredStaff(filtered)
  }

  const getRoleColor = (role: string) => {
    return role === "admin"
      ? "bg-purple-100 text-purple-800"
      : "bg-blue-100 text-blue-800"
  }

  const getStatusColor = (approved: boolean) => {
    return approved
      ? "bg-green-100 text-green-800"
      : "bg-yellow-100 text-yellow-800"
  }

  if (loading) {
    return <LoadingSpinner fullScreen={false} message="Loading staff..." />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-gray-800 mb-2">Staff Management</h1>
          <p className="text-gray-600">Manage and view all team members</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Staff */}
          <div className="bg-white rounded-2xl shadow p-6 border-l-4 border-blue-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Total Staff</p>
                <p className="text-3xl font-bold text-gray-800">{stats.totalStaff}</p>
              </div>
              <FaUsers className="text-blue-600 text-3xl opacity-20" />
            </div>
          </div>

          {/* Active Staff */}
          <div className="bg-white rounded-2xl shadow p-6 border-l-4 border-green-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Active Staff</p>
                <p className="text-3xl font-bold text-gray-800">{stats.activeStaff}</p>
              </div>
              <FaUserCheck className="text-green-600 text-3xl opacity-20" />
            </div>
          </div>

          {/* Pending Approval */}
          <div className="bg-white rounded-2xl shadow p-6 border-l-4 border-yellow-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Pending Approval</p>
                <p className="text-3xl font-bold text-gray-800">{stats.pendingApproval}</p>
              </div>
              <FaUserClock className="text-yellow-600 text-3xl opacity-20" />
            </div>
          </div>

          {/* Admins */}
          <div className="bg-white rounded-2xl shadow p-6 border-l-4 border-purple-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Administrators</p>
                <p className="text-3xl font-bold text-gray-800">{stats.adminCount}</p>
              </div>
              <FaUsers className="text-purple-600 text-3xl opacity-20" />
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Search by Name or Email</label>
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Filter</label>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Staff</option>
                <option value="active">Active Only</option>
                <option value="pending">Pending Approval</option>
                <option value="admin">Administrators</option>
                <option value="employee">Employees</option>
              </select>
            </div>
          </div>
        </div>

        {/* Staff List */}
        {filteredStaff.length === 0 ? (
          <EmptyState
            icon={<FaUsers size={64} />}
            title="No Staff Found"
            description={searchTerm || filterRole !== "all" ? "No staff members match your search or filters." : "No staff members yet."}
          />
        ) : (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Desktop View */}
            <div className="hidden md:block">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-600 to-blue-700">
                  <tr className="text-white">
                    <th className="px-6 py-4 text-left font-semibold">Name</th>
                    <th className="px-6 py-4 text-left font-semibold">Email</th>
                    <th className="px-6 py-4 text-left font-semibold">Role</th>
                    <th className="px-6 py-4 text-left font-semibold">Status</th>
                    <th className="px-6 py-4 text-left font-semibold">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredStaff.map(member => (
                    <tr key={member.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-800">{member.name}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <FaMailBulk size={14} />
                          {member.email}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${getRoleColor(member.role)}`}>
                          {member.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(member.approved_by_admin)}`}>
                          {member.approved_by_admin ? "Active" : "Pending"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                          <FaCalendar size={14} />
                          {new Date(member.created_at).toLocaleDateString()}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View */}
            <div className="md:hidden divide-y">
              {filteredStaff.map(member => (
                <div key={member.id} className="p-4 hover:bg-gray-50 transition">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-800">{member.name}</h3>
                      <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                        <FaMailBulk size={12} />
                        {member.email}
                      </p>
                    </div>
                    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(member.approved_by_admin)}`}>
                      {member.approved_by_admin ? "Active" : "Pending"}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(member.role)}`}>
                      {member.role.toUpperCase()}
                    </span>
                    <span className="text-gray-600 flex items-center gap-1">
                      <FaCalendar size={12} />
                      {new Date(member.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Results Count */}
        {filteredStaff.length > 0 && (
          <div className="mt-4 text-center text-gray-600 text-sm">
            Showing {filteredStaff.length} of {staff.length} staff members
          </div>
        )}
      </div>
    </div>
  )
}

export default Staff