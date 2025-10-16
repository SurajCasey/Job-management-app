import { useEffect, useState } from "react"
import { FaBriefcase } from "react-icons/fa"
import { useAuth } from "../../hooks/useAuth"
import { useNavigate } from "react-router-dom"
import { MdLogout } from "react-icons/md"

const Header = () => {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [currTime, setCurrTime] = useState(
    new Date().toLocaleTimeString("en-US", { hour12: true })
  )

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrTime(new Date().toLocaleTimeString("en-US", { hour12: true }))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleLogout = async () => {
    navigate("/")
    await signOut()
  }

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left - Logo */}
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-2.5 shadow-md">
              <FaBriefcase size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Statewide Escalator Cleaning</h1>
              <p className="text-xs text-gray-500">Professional Escalator facility company</p>
            </div>
          </div>

          {/* Right - User Info and Logout */}
          <div className="flex items-center gap-6">
            {/* Time */}
            <div className="text-right hidden md:block">
              <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Time</p>
              <p className="text-lg font-semibold text-gray-900">{currTime}</p>
            </div>

            {/* Divider */}
            <div className="hidden md:block h-8 w-px bg-gray-200"></div>

            {/* User Name */}
            <div className="text-right hidden md:block">
              <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Welcome</p>
              <p className="text-lg font-semibold text-gray-900">{profile?.name || "User"}</p>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors duration-200 font-medium border border-red-200 hover:border-red-300"
            >
              <MdLogout size={18} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Mobile View */}
        <div className="md:hidden flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-500">{currTime}</p>
            <p className="text-sm font-semibold text-gray-900">{profile?.name || "User"}</p>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header