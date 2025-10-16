import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs"
import { FaBriefcase, FaClock, FaFile, FaHome, FaUpload } from "react-icons/fa"
import { FaPeopleGroup } from "react-icons/fa6"
import { IoMdPeople } from "react-icons/io"
import { IoPeople } from "react-icons/io5"
import { useAuth } from "../../hooks/useAuth"
import Dashboard from "../ui/Dashboard"
import Admin from "../ui/Admin"
import Clients from "../ui/Clients"

const Navbar = () => {
  const { isAdmin } = useAuth();
  return (
    <div>
      <Tabs defaultValue="dashboard">
        <TabsList
            className="flex my-2 justify-around bg-gray-300 rounded-xl"
        >
            <TabsTrigger
                className="navitems " 
                value="dashboard"
                >
                <FaHome className="hidden md:flex"/>
                <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger 
                className="navitems"
                value="time"
            >
                <FaClock className="hidden md:flex"/>
                <span>Time</span>
            </TabsTrigger>
            <TabsTrigger
                className="navitems"
                value="jobs"
            >
                <FaBriefcase className="hidden md:flex"/>
                <span>Jobs</span>
            </TabsTrigger>
            {isAdmin && (
                <TabsTrigger 
                  className="navitems"
                  value="staff"
              >
                  <FaPeopleGroup className="hidden md:flex"/>
                  <span>Staff</span>               
              </TabsTrigger>
            )}
            {isAdmin &&(
              <TabsTrigger 
                  className="navitems"
                  value="clients"
              >
                  <IoMdPeople className="hidden md:flex"/>   
                  <span>Clients</span>
              </TabsTrigger>
            )}
            <TabsTrigger 
                className="navitems"
                value="reports"
            >
                <FaFile className="hidden md:flex"/>
                Reports
            </TabsTrigger>
            <TabsTrigger 
                className="navitems"
                value="files"
            >
                <FaUpload className="hidden md:flex"/>
                <span>Files</span>
            </TabsTrigger>
           {isAdmin && (
              <TabsTrigger 
                  className="navitems"
                  value="admin"
              >
                  <IoPeople className="hidden md:flex"/>
                  <span>Admin</span>
              </TabsTrigger>
           )}
        </TabsList>

      <TabsContent value="dashboard">
        <Dashboard/>
      </TabsContent>

       <TabsContent value="admin">          
          <Admin/>
        </TabsContent>
        <TabsContent value="clients">
          <Clients/>
        </TabsContent>


      </Tabs>
    </div>
  )
}

export default Navbar