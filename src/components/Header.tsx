import { useEffect, useState } from "react";
import { FaBriefcase, FaSignOutAlt } from "react-icons/fa"
import { useNavigate } from "react-router-dom";


const Header = () => {
  const [currTime, setCurrTime] = useState(
    new Date().toLocaleTimeString("en-US", {hour12: true})
  );
  const navigate = useNavigate();
  // constant update of time
  useEffect(()=>{
    const interval = setInterval(()=>{
      setCurrTime(new Date().toLocaleTimeString("en-US", {hour12: true}));
    }, 1000);
    return () => clearInterval(interval);
  })
  // for logout
  const handleLogout = () =>{
    localStorage.removeItem("user");
    navigate("/LoginSignup");
  }


  return (
    <header 
      className="flex flex-col md:flex-row items-center justify-between px-5 py-2 gap-2"
    >
        <div className="flex items-center gap-3">
            <FaBriefcase size={30}/>
            <h1 className="text-2xl font-medium">Job Management</h1>
        </div>
        <div className="w-full md:w-auto flex justify-between gap-5">
          <p>{currTime}</p>
          <p>Welcome, Admin</p>
          <button
            className="flex items-center font-medium"
            onClick={handleLogout}
          >
            <FaSignOutAlt size={20}/>
            Logout
          </button>
        </div>
    </header>
  )
}

export default Header
