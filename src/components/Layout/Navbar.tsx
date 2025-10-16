import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs"
import { FaBriefcase, FaClock, FaHome, FaUpload, FaChartBar } from "react-icons/fa"
import { FaPeopleGroup } from "react-icons/fa6"
import { IoMdPeople } from "react-icons/io"
import { IoPeople } from "react-icons/io5"
import { useAuth } from "../../hooks/useAuth"
import Dashboard from "../ui/Dashboard"
import Admin from "../ui/Admin"
import Clients from "../ui/Clients"
import Jobs from "../ui/Jobs"
import Time from "../ui/Time"
import Reports from "../ui/Reports"
import Files from "../ui/Files"
import Staff from "../ui/Staffs"

const Navbar = () => {
  const { isAdmin } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      <Tabs defaultValue="dashboard" className="w-full">
        {/* Navigation Bar */}
        <div className="bg-white shadow-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4">
            <TabsList className="flex gap-1 overflow-x-auto scrollbar-hide">
              {/* Dashboard */}
              <TabsTrigger
                value="dashboard"
                className="group px-4 py-4 flex items-center gap-2 text-gray-700 hover:text-blue-600 border-b-2 border-transparent hover:border-blue-600 transition-all duration-200 data-[state=active]:text-blue-600 data-[state=active]:border-blue-600"
              >
                <FaHome className="text-lg group-hover:scale-110 transition-transform" />
                <span className="font-medium">Dashboard</span>
              </TabsTrigger>

              {/* Time */}
              <TabsTrigger
                value="time"
                className="group px-4 py-4 flex items-center gap-2 text-gray-700 hover:text-green-600 border-b-2 border-transparent hover:border-green-600 transition-all duration-200 data-[state=active]:text-green-600 data-[state=active]:border-green-600"
              >
                <FaClock className="text-lg group-hover:scale-110 transition-transform" />
                <span className="font-medium">Clock In/Out</span>
              </TabsTrigger>

              {/* Jobs */}
              <TabsTrigger
                value="jobs"
                className="group px-4 py-4 flex items-center gap-2 text-gray-700 hover:text-orange-600 border-b-2 border-transparent hover:border-orange-600 transition-all duration-200 data-[state=active]:text-orange-600 data-[state=active]:border-orange-600"
              >
                <FaBriefcase className="text-lg group-hover:scale-110 transition-transform" />
                <span className="font-medium">Jobs</span>
              </TabsTrigger>

              {/* Admin Only - Staff */}
              {isAdmin && (
                <TabsTrigger
                  value="staff"
                  className="group px-4 py-4 flex items-center gap-2 text-gray-700 hover:text-purple-600 border-b-2 border-transparent hover:border-purple-600 transition-all duration-200 data-[state=active]:text-purple-600 data-[state=active]:border-purple-600"
                >
                  <FaPeopleGroup className="text-lg group-hover:scale-110 transition-transform" />
                  <span className="font-medium">Staff</span>
                </TabsTrigger>
              )}

              {/* Admin Only - Clients */}
              {isAdmin && (
                <TabsTrigger
                  value="clients"
                  className="group px-4 py-4 flex items-center gap-2 text-gray-700 hover:text-blue-500 border-b-2 border-transparent hover:border-blue-500 transition-all duration-200 data-[state=active]:text-blue-500 data-[state=active]:border-blue-500"
                >
                  <IoMdPeople className="text-lg group-hover:scale-110 transition-transform" />
                  <span className="font-medium">Clients</span>
                </TabsTrigger>
              )}

              {/* Reports */}
              <TabsTrigger
                value="reports"
                className="group px-4 py-4 flex items-center gap-2 text-gray-700 hover:text-red-600 border-b-2 border-transparent hover:border-red-600 transition-all duration-200 data-[state=active]:text-red-600 data-[state=active]:border-red-600"
              >
                <FaChartBar className="text-lg group-hover:scale-110 transition-transform" />
                <span className="font-medium">Reports</span>
              </TabsTrigger>

              {/* Files */}
              <TabsTrigger
                value="files"
                className="group px-4 py-4 flex items-center gap-2 text-gray-700 hover:text-indigo-600 border-b-2 border-transparent hover:border-indigo-600 transition-all duration-200 data-[state=active]:text-indigo-600 data-[state=active]:border-indigo-600"
              >
                <FaUpload className="text-lg group-hover:scale-110 transition-transform" />
                <span className="font-medium">Files</span>
              </TabsTrigger>

              {/* Admin Only - Admin Panel */}
              {isAdmin && (
                <TabsTrigger
                  value="admin"
                  className="group px-4 py-4 flex items-center gap-2 text-gray-700 hover:text-pink-600 border-b-2 border-transparent hover:border-pink-600 transition-all duration-200 data-[state=active]:text-pink-600 data-[state=active]:border-pink-600"
                >
                  <IoPeople className="text-lg group-hover:scale-110 transition-transform" />
                  <span className="font-medium">Admin</span>
                </TabsTrigger>
              )}
            </TabsList>
          </div>
        </div>

        {/* Tab Content */}
        <div className="max-w-7xl mx-auto">
          <TabsContent value="dashboard" className="mt-0">
            <Dashboard />
          </TabsContent>

          <TabsContent value="time" className="mt-0">
            <Time />
          </TabsContent>

          <TabsContent value="jobs" className="mt-0">
            <Jobs />
          </TabsContent>

          {isAdmin && (
            <>
              <TabsContent value="staff" className="mt-0">
              
              </TabsContent>

              <TabsContent value="clients" className="mt-0">
                <Clients />
              </TabsContent>
            </>
          )}

          <TabsContent value="reports" className="mt-0">
            <Reports />
          </TabsContent>

          <TabsContent value="files" className="mt-0">
            <Files />
          </TabsContent>

          <TabsContent value="staff" className="mt-0">
            <Staff/>
          </TabsContent>

          {isAdmin && (
            <TabsContent value="admin" className="mt-0">
              <Admin />
            </TabsContent>
          )}
        </div>
      </Tabs>
    </div>
  )
}

export default Navbar