import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import toast from "react-hot-toast";
import { FaCheckCircle, FaTimesCircle, FaUser, FaUserShield } from "react-icons/fa";
import LoadingSpinner from "../shared/LoadingSpinner";
import EmptyState from "../shared/EmptyState";


interface PendingUser {
  id: string;
  name: string;
  email: string;
  employer_email: string | null;
  role: string;
  approved_by_admin: boolean;
  created_at: string;
}

const Admin = () => {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [approvedUsers, setApprovedUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"pending" | "approved">("pending");
  const [selectedRole, setSelectedRole] = useState<Record<string, string>>({});

  // Fetch users from database
  const fetchUsers = async () => {
    try {
      setLoading(true);

      // Fetch pending users
      const { data: pending, error: pendingError } = await supabase
        .from("users")
        .select("*")
        .eq("approved_by_admin", false)
        .order("created_at", { ascending: false });

      if (pendingError) throw pendingError;

      // Fetch approved users
      const { data: approved, error: approvedError } = await supabase
        .from("users")
        .select("*")
        .eq("approved_by_admin", true)
        .order("created_at", { ascending: false });

      if (approvedError) throw approvedError;

      setPendingUsers(pending || []);
      setApprovedUsers(approved || []);

      // Initialize selected roles for pending users
      const initialRoles: Record<string, string> = {};
      pending?.forEach(user => {
        initialRoles[user.id] = user.role;
      });
      setSelectedRole(initialRoles);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle role change
  const handleRoleChange = (userId: string, newRole: string) => {
    setSelectedRole(prev => ({
      ...prev,
      [userId]: newRole
    }));
  };

  // Approve user with selected role
  const handleApprove = async (userId: string) => {
    try {
      setActionLoading(userId);

      const roleToAssign = selectedRole[userId] || 'employee';

      const { error } = await supabase
        .from("users")
        .update({ 
          approved_by_admin: true,
          role: roleToAssign 
        })
        .eq("id", userId);

      if (error) throw error;

      toast.success(`User approved as ${roleToAssign}!`);
      await fetchUsers();
    } catch (error) {
      console.error("Error approving user:", error);
      toast.error("Failed to approve user");
    } finally {
      setActionLoading(null);
    }
  };

  // Reject/Remove user
  const handleReject = async (userId: string) => {
    if (!confirm("Are you sure you want to reject this user? This will delete their account.")) {
      return;
    }

    try {
      setActionLoading(userId);

      const { error } = await supabase
        .from("users")
        .delete()
        .eq("id", userId);

      if (error) throw error;

      toast.success("User rejected and removed");
      await fetchUsers();
    } catch (error) {
      console.error("Error rejecting user:", error);
      toast.error("Failed to reject user");
    } finally {
      setActionLoading(null);
    }
  };

  // Change role for approved user
  const handleChangeRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'employee' : 'admin';
    
    if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      return;
    }

    try {
      setActionLoading(userId);

      const { error } = await supabase
        .from("users")
        .update({ role: newRole })
        .eq("id", userId);

      if (error) throw error;

      toast.success(`Role changed to ${newRole}`);
      await fetchUsers();
    } catch (error) {
      console.error("Error changing role:", error);
      toast.error("Failed to change role");
    } finally {
      setActionLoading(null);
    }
  };

  // Revoke approval
  const handleRevokeApproval = async (userId: string) => {
    if (!confirm("Are you sure you want to revoke approval for this user?")) {
      return;
    }

    try {
      setActionLoading(userId);

      const { error } = await supabase
        .from("users")
        .update({ approved_by_admin: false })
        .eq("id", userId);

      if (error) throw error;

      toast.success("User approval revoked");
      await fetchUsers();
    } catch (error) {
      console.error("Error revoking approval:", error);
      toast.error("Failed to revoke approval");
    } finally {
      setActionLoading(null);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return <LoadingSpinner message="Loading admin dashboard..." />;
  }

  return (
    <div className=" bg-gray-50">
  

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage user registrations and approvals</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Pending Approvals</p>
                <p className="text-3xl font-bold text-yellow-600 mt-1">
                  {pendingUsers.length}
                </p>
              </div>
              <div className="bg-yellow-100 rounded-full p-4">
                <FaUser className="text-yellow-600 text-2xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Approved Users</p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  {approvedUsers.length}
                </p>
              </div>
              <div className="bg-green-100 rounded-full p-4">
                <FaCheckCircle className="text-green-600 text-2xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab("pending")}
                className={`px-6 py-4 font-medium transition-colors cursor-pointer ${
                  activeTab === "pending"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Pending Approvals ({pendingUsers.length})
              </button>
              <button
                onClick={() => setActiveTab("approved")}
                className={`px-6 py-4 font-medium transition-colors cursor-pointer ${
                  activeTab === "approved"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Approved Users ({approvedUsers.length})
              </button>
            </div>
          </div>

          {/* Pending Users Tab */}
          {activeTab === "pending" && (
            <div className="p-6">
              {pendingUsers.length === 0 ? (
                <EmptyState
                  icon={<FaUser size={64} />}
                  title="No Pending Approvals"
                  description="All user registrations have been processed"
                />
              ) : (
                <div className="space-y-4">
                  {pendingUsers.map((user) => (
                    <div
                      key={user.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="bg-gray-200 rounded-full p-2">
                              <FaUser className="text-gray-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg text-gray-800">
                                {user.name}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {formatDate(user.created_at)}
                              </p>
                            </div>
                          </div>

                          <div className="ml-11 space-y-1">
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Email:</span> {user.email}
                            </p>
                            {user.employer_email && (
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Employer:</span>{" "}
                                {user.employer_email}
                              </p>
                            )}
                            
                            {/* Role Selector */}
                            <div className="flex items-center gap-2 mt-2">
                              <span className="font-medium text-sm text-gray-600">Approve as:</span>
                              <select
                                value={selectedRole[user.id] || 'employee'}
                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="employee">Employee</option>
                                <option value="admin">Admin</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-3 md:flex-col lg:flex-row">
                          <button
                            onClick={() => handleApprove(user.id)}
                            disabled={actionLoading === user.id}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white 
                            rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 
                            disabled:cursor-not-allowed"
                          >
                            <FaCheckCircle />
                            {actionLoading === user.id ? "Processing..." : "Approve"}
                          </button>

                          <button
                            onClick={() => handleReject(user.id)}
                            disabled={actionLoading === user.id}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white 
                            rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 
                            disabled:cursor-not-allowed"
                          >
                            <FaTimesCircle />
                            {actionLoading === user.id ? "Processing..." : "Reject"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Approved Users Tab */}
          {activeTab === "approved" && (
            <div className="p-6">
              {approvedUsers.length === 0 ? (
                <EmptyState
                  icon={<FaCheckCircle size={64} />}
                  title="No Approved Users"
                  description="No users have been approved yet"
                />
              ) : (
                <div className="space-y-4">
                  {approvedUsers.map((user) => (
                    <div
                      key={user.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`rounded-full p-2 ${
                              user.role === 'admin' ? 'bg-purple-100' : 'bg-green-100'
                            }`}>
                              {user.role === 'admin' ? (
                                <FaUserShield className="text-purple-600" />
                              ) : (
                                <FaCheckCircle className="text-green-600" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-lg text-gray-800">
                                  {user.name}
                                </h3>
                                <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                                  user.role === 'admin' 
                                    ? 'bg-purple-100 text-purple-700' 
                                    : 'bg-blue-100 text-blue-700'
                                }`}>
                                  {user.role.toUpperCase()}
                                </span>
                              </div>
                              <p className="text-sm text-gray-500">
                                Approved • {formatDate(user.created_at)}
                              </p>
                            </div>
                          </div>

                          <div className="ml-11 space-y-1">
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Email:</span> {user.email}
                            </p>
                            {user.employer_email && (
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Employer:</span>{" "}
                                {user.employer_email}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-3 flex-wrap">
                          <button
                            onClick={() => handleChangeRole(user.id, user.role)}
                            disabled={actionLoading === user.id}
                            className={`flex items-center gap-2 px-4 py-2 text-white rounded-md 
                            transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                              user.role === 'admin' 
                                ? 'bg-blue-600 hover:bg-blue-700' 
                                : 'bg-purple-600 hover:bg-purple-700'
                            }`}
                          >
                            <FaUserShield />
                            {actionLoading === user.id ? "Processing..." : 
                              user.role === 'admin' ? 'Make Employee' : 'Make Admin'}
                          </button>

                          <button
                            onClick={() => handleRevokeApproval(user.id)}
                            disabled={actionLoading === user.id}
                            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white 
                            rounded-md hover:bg-orange-700 transition-colors disabled:opacity-50 
                            disabled:cursor-not-allowed"
                          >
                            <FaTimesCircle />
                            {actionLoading === user.id ? "Processing..." : "Revoke"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;